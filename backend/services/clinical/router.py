from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.clinical.models import Encounter, Vitals, Diagnosis, UrgencyStamp
from services.clinical.schemas import EncounterCreate, EncounterOut, EncounterUpdateVitals, EncounterUpdateClinical, EncounterAssignment, TimelineEvent, EncounterConfirmationPreview
from services.auth.models import User, NATIONAL_ROLES, AuditLog
from services.institution.models import Institution, Facility
from services.patient.models import Patient
from services.pharmacy.models import Prescription
from services.laboratory.models import LabOrder
from services.auth.dependencies import get_current_user, require_role
from sqlalchemy import desc
import datetime

router = APIRouter(prefix="/api/clinical", tags=["Clinical Encounters"])


@router.post("/create", response_model=EncounterOut)
def create_encounter(
    data: EncounterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "nurse", "receptionist", "national_super_user"))
):
    # Find previous encounter for chaining
    last_enc = db.query(Encounter).filter(Encounter.patient_id == data.patient_id).order_by(desc(Encounter.created_at)).first()
    previous_id = last_enc.id if last_enc else None

    encounter = Encounter(
        patient_id=data.patient_id,
        clinician_id=current_user.id,
        institution_id=current_user.institution_id,
        facility_id=current_user.facility_id,
        department=current_user.department or "Reception",
        encounter_type=data.encounter_type,
        chief_complaint=data.chief_complaint,
        clinical_notes=data.clinical_notes,
        status=data.status,
        urgency_level=data.urgency_level or "normal",
        previous_encounter_id=previous_id
    )
    db.add(encounter)
    db.flush()

    # Initial Urgency Stamp (Reception)
    stamp = UrgencyStamp(
        encounter_id=encounter.id,
        user_id=current_user.id,
        role=current_user.role,
        facility_id=current_user.facility_id,
        classification=encounter.urgency_level
    )
    db.add(stamp)

    if data.vitals:
        bmi = None
        if data.vitals.weight_kg and data.vitals.height_cm:
            h_m = data.vitals.height_cm / 100
            bmi = round(data.vitals.weight_kg / (h_m * h_m), 1)

        vitals = Vitals(
            encounter_id=encounter.id,
            patient_id=data.patient_id,
            recorded_by_id=current_user.id,
            systolic_bp=data.vitals.systolic_bp,
            diastolic_bp=data.vitals.diastolic_bp,
            heart_rate=data.vitals.heart_rate,
            temperature=data.vitals.temperature,
            respiratory_rate=data.vitals.respiratory_rate,
            spo2=data.vitals.spo2,
            weight_kg=data.vitals.weight_kg,
            height_cm=data.vitals.height_cm,
            bmi=bmi,
            blood_glucose=data.vitals.blood_glucose,
            pain_score=data.vitals.pain_score
        )
        db.add(vitals)

    if data.diagnoses:
        for dx in data.diagnoses:
            diagnosis = Diagnosis(
                encounter_id=encounter.id,
                icd10_code=dx.icd10_code,
                description=dx.description,
                diagnosis_type=dx.diagnosis_type,
                severity=dx.severity
            )
            db.add(diagnosis)

    db.commit()
    db.refresh(encounter)

    # Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="create_encounter_chain_node",
        details=f"Created {data.encounter_type} encounter for patient {data.patient_id}. Prev: {previous_id}",
        institution_id=current_user.institution_id
    )
    db.add(audit)
    db.commit()

    return encounter


@router.get("/patient/{patient_id}", response_model=list[EncounterOut])
def get_patient_encounters(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Encounter).filter(Encounter.patient_id == patient_id)
    if current_user.role not in NATIONAL_ROLES:
        query = query.filter(Encounter.institution_id == current_user.institution_id)
    return query.order_by(Encounter.created_at.desc()).all()


@router.get("/queue", response_model=list[EncounterOut])
def get_encounter_queue(
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Encounter).filter(Encounter.status == status)
    if current_user.role not in NATIONAL_ROLES:
        query = query.filter(Encounter.institution_id == current_user.institution_id)
    return query.order_by(desc(Encounter.urgency_level == 'emergency'), Encounter.created_at.asc()).all()


@router.get("/{encounter_id}", response_model=EncounterOut)
def get_encounter(
    encounter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enc = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not enc:
        raise HTTPException(status_code=404, detail="Encounter not found")
    return enc


@router.patch("/{encounter_id}/vitals", response_model=EncounterOut)
def update_vitals(
    encounter_id: int,
    data: EncounterUpdateVitals,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("nurse", "national_super_user"))
):
    enc = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not enc:
        raise HTTPException(status_code=404, detail="Encounter not found")
        
    bmi = None
    if data.vitals.weight_kg and data.vitals.height_cm:
        h_m = data.vitals.height_cm / 100
        bmi = round(data.vitals.weight_kg / (h_m * h_m), 1)

    vitals = Vitals(
        encounter_id=enc.id,
        patient_id=enc.patient_id,
        recorded_by_id=current_user.id,
        systolic_bp=data.vitals.systolic_bp,
        diastolic_bp=data.vitals.diastolic_bp,
        heart_rate=data.vitals.heart_rate,
        temperature=data.vitals.temperature,
        respiratory_rate=data.vitals.respiratory_rate,
        spo2=data.vitals.spo2,
        weight_kg=data.vitals.weight_kg,
        height_cm=data.vitals.height_cm,
        bmi=bmi,
        blood_glucose=data.vitals.blood_glucose,
        pain_score=data.vitals.pain_score
    )
    db.add(vitals)
    
    # Update urgency if provided
    if data.urgency_level:
        enc.urgency_level = data.urgency_level
        stamp = UrgencyStamp(
            encounter_id=enc.id,
            user_id=current_user.id,
            role=current_user.role,
            facility_id=current_user.facility_id,
            classification=data.urgency_level
        )
        db.add(stamp)

    # Update status to queued for doctor after vitals are taken
    if enc.status == "queued_for_triage":
        enc.status = "queued_for_doctor"
        
    db.commit()
    db.refresh(enc)

    # Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="update_encounter_vitals",
        details=f"Recorded triage vitals for encounter {encounter_id}",
        institution_id=current_user.institution_id
    )
    db.add(audit)
    db.commit()

    return enc


@router.patch("/{encounter_id}/clinical", response_model=EncounterOut)
def update_clinical(
    encounter_id: int,
    data: EncounterUpdateClinical,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "national_super_user"))
):
    enc = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not enc:
        raise HTTPException(status_code=404, detail="Encounter not found")
        
    if data.clinical_notes:
        enc.clinical_notes = data.clinical_notes

    if data.diagnoses:
        for dx in data.diagnoses:
            diagnosis = Diagnosis(
                encounter_id=enc.id,
                icd10_code=dx.icd10_code,
                description=dx.description,
                diagnosis_type=dx.diagnosis_type,
                severity=dx.severity
            )
            db.add(diagnosis)
            
    # Update urgency if provided
    if data.urgency_level:
        enc.urgency_level = data.urgency_level
        stamp = UrgencyStamp(
            encounter_id=enc.id,
            user_id=current_user.id,
            role=current_user.role,
            facility_id=current_user.facility_id,
            classification=data.urgency_level
        )
        db.add(stamp)

    enc.status = "completed"
    enc.completed_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(enc)

    # Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="complete_clinical_encounter",
        details=f"Finalized consultation for encounter {encounter_id}. Status: completed",
        institution_id=current_user.institution_id
    )
    db.add(audit)
    db.commit()

    return enc
@router.patch("/{encounter_id}/assign", response_model=EncounterOut)
def assign_clinician(
    encounter_id: int,
    data: EncounterAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("nurse", "national_super_user"))
):
    """Assignment endpoint for Triage Nurses (Sisters)."""
    enc = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not enc:
        raise HTTPException(status_code=404, detail="Encounter not found")
        
    # Update assignment
    enc.clinician_id = data.clinician_id
    if data.department:
        enc.department = data.department
        enc.encounter_type = data.department  # Use department as encounter type for routing
    
    # Ensure facility and institution are correct (may change if referred)
    enc.institution_id = current_user.institution_id
    enc.facility_id = current_user.facility_id

    if data.chief_complaint:
        enc.chief_complaint = data.chief_complaint
        
    # If vitals are provided during triage assignment
    if data.vitals:
        bmi = None
        if data.vitals.weight_kg and data.vitals.height_cm:
            h_m = data.vitals.height_cm / 100
            bmi = round(data.vitals.weight_kg / (h_m * h_m), 1)

        vitals = Vitals(
            encounter_id=enc.id,
            patient_id=enc.patient_id,
            recorded_by_id=current_user.id,
            systolic_bp=data.vitals.systolic_bp,
            diastolic_bp=data.vitals.diastolic_bp,
            heart_rate=data.vitals.heart_rate,
            temperature=data.vitals.temperature,
            respiratory_rate=data.vitals.respiratory_rate,
            spo2=data.vitals.spo2,
            weight_kg=data.vitals.weight_kg,
            height_cm=data.vitals.height_cm,
            bmi=bmi,
            blood_glucose=data.vitals.blood_glucose,
            pain_score=data.vitals.pain_score
        )
        db.add(vitals)
        
    # Update urgency if provided (Triage Assignment)
    if data.urgency_level:
        enc.urgency_level = data.urgency_level
        stamp = UrgencyStamp(
            encounter_id=enc.id,
            user_id=current_user.id,
            role=current_user.role,
            facility_id=current_user.facility_id,
            classification=data.urgency_level
        )
        db.add(stamp)

    # Update status to indicate it's ready for the doctor
    enc.status = "queued_for_doctor"
    
    db.commit()
    db.refresh(enc)

    # Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="assign_clinician",
        details=f"Triage assignment: enc {encounter_id} assigned to user {data.clinician_id} ({data.department})",
        institution_id=current_user.institution_id
    )
    db.add(audit)
    db.commit()

    return enc


@router.get("/patients/{patient_id}/timeline", response_model=list[TimelineEvent])
def get_patient_timeline(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates a complete chronological medical journey for the patient."""
    from services.auth.models import AuditLog
    print(f"DEBUG: Fetching timeline for patient {patient_id}")
    try:
        events = []
        
        # 1. Fetch Encounters
        encounters = db.query(Encounter).filter(Encounter.patient_id == patient_id).all()
        print(f"DEBUG: Found {len(encounters)} encounters")
        for enc in encounters:
            # Get institution name
            inst_name = "Unknown Facility"
            inst = db.query(Institution).filter(Institution.id == enc.institution_id).first()
            if inst:
                inst_name = inst.facility_name

            # Get provider info
            provider_name = "System"
            provider_role = "System"
            user = db.query(User).filter(User.id == enc.clinician_id).first()
            if user:
                provider_name = user.full_name
                provider_role = user.role

            # Base Encounter Event
            events.append(TimelineEvent(
                id=enc.id,
                patient_id=patient_id,
                timestamp=enc.created_at,
                facility_name=inst_name,
                department=enc.department or "General",
                event_type="encounter_start",
                provider_name=provider_name,
                provider_role=provider_role,
                action="Check-in / Admission",
                content_summary=f"Visit Type: {(enc.encounter_type or 'General').capitalize()}",
                encounter_id=enc.id
            ))

            # 2. Add Vitals as child events
            for v in enc.vitals:
                # Safe conversion: handle None values
                s_bp = int(v.systolic_bp) if v.systolic_bp is not None else "N/A"
                d_bp = int(v.diastolic_bp) if v.diastolic_bp is not None else "N/A"
                bp_str = f"{s_bp}/{d_bp}" if (s_bp != "N/A" and d_bp != "N/A") else "N/A"
                hr_str = f"{int(v.heart_rate)} bpm" if v.heart_rate is not None else "N/A"
                temp_str = f"{v.temperature}°C" if v.temperature is not None else "N/A"
                
                events.append(TimelineEvent(
                    id=v.id,
                    patient_id=patient_id,
                    timestamp=v.recorded_at,
                    facility_name=inst_name,
                    department=enc.department or "General",
                    event_type="triage_vitals",
                    provider_name=provider_name,
                    provider_role=provider_role,
                    action="Vitals Recorded",
                    content_summary=f"BP: {bp_str}, HR: {hr_str}, Temp: {temp_str}",
                    encounter_id=enc.id
                ))

            # 3. Add Diagnoses
            for dx in enc.diagnoses:
                events.append(TimelineEvent(
                    id=dx.id,
                    patient_id=patient_id,
                    timestamp=dx.created_at,
                    facility_name=inst_name,
                    department=enc.department or "General",
                    event_type="clinical_diagnosis",
                    provider_name=provider_name,
                    provider_role=provider_role,
                    action="Diagnosis Formulated",
                    content_summary=f"{(dx.diagnosis_type or 'Primary').capitalize()}: {dx.description} ({dx.icd10_code or 'No ICD'})",
                    encounter_id=enc.id
                ))

        # 4. Fetch Prescriptions
        prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient_id).all()
        for rx in prescriptions:
            inst = db.query(Institution).filter(Institution.id == rx.institution_id).first()
            u = db.query(User).filter(User.id == rx.prescriber_id).first()
            events.append(TimelineEvent(
                id=rx.id,
                patient_id=patient_id,
                timestamp=rx.created_at,
                facility_name=inst.facility_name if inst else "Pharmacy",
                department="Pharmacy",
                event_type="medication_prescribed",
                provider_name=u.full_name if u else "Clinician",
                provider_role=u.role if u else "doctor",
                action="Prescription Issued",
                content_summary=f"Medication: {rx.medication_name}, Dosage: {rx.dosage} {rx.frequency}",
                encounter_id=rx.encounter_id or 0
            ))

        # 5. Fetch Lab Orders
        labs = db.query(LabOrder).filter(LabOrder.patient_id == patient_id).all()
        for lab in labs:
            inst = db.query(Institution).filter(Institution.id == lab.institution_id).first()
            u = db.query(User).filter(User.id == lab.ordered_by_id).first()
            events.append(TimelineEvent(
                id=lab.id,
                patient_id=patient_id,
                timestamp=lab.created_at,
                facility_name=inst.facility_name if inst else "Laboratory",
                department="Laboratory",
                event_type="lab_request",
                provider_name=u.full_name if u else "Clinician",
                provider_role=u.role if u else "doctor",
                action="Lab Test Requested",
                content_summary=f"Test: {lab.test_name} ({(lab.priority or 'routine').upper()})",
                encounter_id=lab.encounter_id or 0
            ))

        # Sort all events chronologically
        events.sort(key=lambda x: x.timestamp)
        
        # Audit Log
        audit = AuditLog(
            user_id=current_user.id,
            action="accessed_patient_timeline",
            details=f"Viewed longitudinal chain for patient ID {patient_id}",
            institution_id=current_user.institution_id
        )
        db.add(audit)
        db.commit()

        return events
    except Exception as e:
        import traceback
        print(f"ERROR in get_patient_timeline: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patients/{patient_id}/confirmation-preview", response_model=list[EncounterConfirmationPreview])
def get_confirmation_preview(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("receptionist", "nurse", "doctor", "national_super_user"))
):
    """
    Optimized endpoint for identity confirmation.
    Returns only the last 3-5 encounters with minimal data.
    """
    print(f"DEBUG: Fetching confirmation preview for patient {patient_id}")
    try:
        # 1. Fetch 5 most recent encounters
        encounters = db.query(Encounter).filter(Encounter.patient_id == patient_id).order_by(desc(Encounter.created_at)).limit(5).all()
        
        previews = []
        for enc in encounters:
            inst = db.query(Institution).filter(Institution.id == enc.institution_id).first()
            
            # Reason is encounter_type + chief_complaint (if available)
            reason = enc.encounter_type.capitalize()
            if enc.chief_complaint:
                # Limit length to keep it minimal
                cc = enc.chief_complaint[:50] + "..." if len(enc.chief_complaint) > 50 else enc.chief_complaint
                reason += f": {cc}"
                
            previews.append(EncounterConfirmationPreview(
                id=enc.id,
                date=enc.created_at,
                facility=inst.facility_name if inst else "Unknown Facility",
                reason=reason
            ))

        # 2. Audit Log (Essential for security as per requirements)
        audit = AuditLog(
            user_id=current_user.id,
            action="view_patient_confirmation_preview",
            details=f"Viewed recent visits (N={len(previews)}) for patient ID {patient_id} for identity verification",
            institution_id=current_user.institution_id
        )
        db.add(audit)
        db.commit()

        return previews
    except Exception as e:
        import traceback
        print(f"ERROR in get_confirmation_preview: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
