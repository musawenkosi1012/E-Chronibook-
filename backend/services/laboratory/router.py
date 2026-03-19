from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.laboratory.models import LabOrder, LabResult, LabTest
from services.laboratory.schemas import LabOrderCreate, LabOrderOut, LabResultCreate, LabResultOut, LabTestOut
from services.auth.models import User, NATIONAL_ROLES
from services.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/api/lab", tags=["Laboratory"])


@router.post("/orders/create", response_model=LabOrderOut)
def create_lab_order(
    data: LabOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "nurse", "national_super_user"))
):
    order = LabOrder(
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        ordered_by_id=current_user.id,
        institution_id=current_user.institution_id,
        test_name=data.test_name,
        test_code=data.test_code,
        clinical_indication=data.clinical_indication,
        priority=data.priority
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders/pending", response_model=list[LabOrderOut])
def get_pending_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lab_tech", "doctor", "institution_it_admin", "national_super_user"))
):
    query = db.query(LabOrder).filter(LabOrder.status.in_(["ordered", "collected", "processing"]))
    if current_user.role not in NATIONAL_ROLES:
        query = query.filter(LabOrder.institution_id == current_user.institution_id)
    return query.order_by(LabOrder.created_at.desc()).all()


@router.post("/results/{order_id}", response_model=LabResultOut)
def enter_lab_result(
    order_id: int,
    data: LabResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lab_tech", "national_super_user"))
):
    order = db.query(LabOrder).filter(LabOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Lab order not found")
    result = LabResult(
        order_id=order_id,
        result_value=data.result_value,
        unit=data.unit,
        reference_range=data.reference_range,
        is_abnormal=data.is_abnormal,
        notes=data.notes,
        processed_by_id=current_user.id
    )
    order.status = "completed"
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.get("/orders/patient/{patient_id}", response_model=list[LabOrderOut])
def get_patient_lab_orders(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(LabOrder).filter(
        LabOrder.patient_id == patient_id
    ).order_by(LabOrder.created_at.desc()).all()


@router.get("/tests", response_model=list[LabTestOut])
def list_lab_tests(db: Session = Depends(get_db)):
    return db.query(LabTest).all()
