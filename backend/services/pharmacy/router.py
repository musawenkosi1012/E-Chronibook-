from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from services.pharmacy.models import Prescription, Medication
from services.pharmacy.schemas import PrescriptionCreate, PrescriptionOut, MedicationCreate, MedicationOut
from services.auth.models import User, NATIONAL_ROLES
from services.auth.dependencies import get_current_user, require_role
import datetime

router = APIRouter(prefix="/api/pharmacy", tags=["Pharmacy & Prescriptions"])


@router.post("/prescriptions/create", response_model=PrescriptionOut)
def create_prescription(
    data: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "national_super_user"))
):
    rx = Prescription(
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        prescriber_id=current_user.id,
        institution_id=current_user.institution_id,
        medication_name=data.medication_name,
        dosage=data.dosage,
        frequency=data.frequency,
        duration=data.duration,
        route=data.route,
        instructions=data.instructions,
        quantity=data.quantity
    )
    db.add(rx)
    db.commit()
    db.refresh(rx)
    return rx


@router.get("/prescriptions/pending", response_model=list[PrescriptionOut])
def get_pending_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("pharmacist", "institution_it_admin", "national_super_user"))
):
    query = db.query(Prescription).filter(Prescription.status == "pending")
    if current_user.role not in NATIONAL_ROLES:
        query = query.filter(Prescription.institution_id == current_user.institution_id)
    return query.order_by(Prescription.created_at.desc()).all()


@router.patch("/prescriptions/{prescription_id}/dispense")
def dispense_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("pharmacist", "national_super_user"))
):
    rx = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    if rx.status == "dispensed":
        raise HTTPException(status_code=400, detail="Already dispensed")
    rx.status = "dispensed"
    rx.dispensed_by_id = current_user.id
    rx.dispensed_at = datetime.datetime.utcnow()
    db.commit()
    return {"status": "dispensed", "prescription_id": rx.id}


@router.get("/prescriptions/patient/{patient_id}", response_model=list[PrescriptionOut])
def get_patient_prescriptions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).order_by(Prescription.created_at.desc()).all()


@router.post("/medications/add", response_model=MedicationOut)
def add_medication(
    data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("pharmacist", "institution_it_admin", "national_super_user"))
):
    med = Medication(
        generic_name=data.generic_name,
        brand_name=data.brand_name,
        form=data.form,
        strength=data.strength,
        category=data.category,
        requires_prescription=data.requires_prescription,
        stock_quantity=data.stock_quantity,
        institution_id=current_user.institution_id
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@router.get("/medications/search", response_model=list[MedicationOut])
def search_medications(
    q: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Medication)
    if q:
        search = f"%{q}%"
        query = query.filter(Medication.generic_name.ilike(search))
    return query.limit(50).all()
