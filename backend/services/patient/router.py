from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from services.patient.models import Patient
from services.patient.schemas import PatientCreate, PatientOut
from services.auth.models import User, NATIONAL_ROLES, AuditLog
from services.auth.dependencies import get_current_user, require_role
from datetime import date

router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.post("/register", response_model=PatientOut)
def register_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "nurse", "receptionist", "institution_it_admin", "national_super_user"))
):
    if data.national_id:
        existing = db.query(Patient).filter(Patient.national_id == data.national_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Patient with this National ID already exists")

    patient = Patient(
        national_id=data.national_id,
        first_name=data.first_name,
        last_name=data.last_name,
        date_of_birth=date.fromisoformat(data.date_of_birth),
        gender=data.gender,
        blood_type=data.blood_type,
        phone=data.phone,
        email=data.email,
        address=data.address,
        province=data.province,
        allergies=data.allergies,
        chronic_conditions=data.chronic_conditions,
        emergency_contact_name=data.emergency_contact_name,
        emergency_contact_phone=data.emergency_contact_phone,
        institution_id=current_user.institution_id,
        registered_by_id=current_user.id
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/search", response_model=list[PatientOut])
def search_patients(
    q: str = Query("", description="Search by name, national ID, or phone"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Patient)
    if current_user.role not in NATIONAL_ROLES:
        query = query.filter(Patient.institution_id == current_user.institution_id)
    
    if q:
        # Create Audit Log
        audit = AuditLog(
            user_id=current_user.id,
            action="patient_incremental_search",
            details=f"Query: {q}",
            institution_id=current_user.institution_id
        )
        db.add(audit)
        db.commit()

        # Incremental search logic
        search_term = f"{q.strip()}%"
        
        # If input is numeric, prioritze ID search
        if q.isdigit():
            query = query.filter(
                or_(
                    Patient.id == int(q),
                    Patient.national_id.ilike(search_term),
                    Patient.phone.ilike(search_term)
                )
            )
        else:
            query = query.filter(
                or_(
                    Patient.first_name.ilike(search_term),
                    Patient.last_name.ilike(search_term),
                    Patient.national_id.ilike(search_term)
                )
            )
    
    # Limit to 15 results for performance on mobile/low-bandwidth
    return query.limit(15).all()


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if current_user.role not in NATIONAL_ROLES:
        if patient.institution_id != current_user.institution_id:
            raise HTTPException(status_code=403, detail="Access denied")
    return patient
