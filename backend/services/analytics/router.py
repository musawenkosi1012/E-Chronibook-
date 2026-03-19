from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from services.institution.models import Institution, Facility
from services.patient.models import Patient
from services.clinical.models import Encounter, Vitals, Diagnosis
from services.pharmacy.models import Prescription
from services.laboratory.models import LabOrder
from services.auth.models import User
from services.auth.dependencies import require_role

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Reporting"])


@router.get("/national/overview")
def national_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("national_super_user", "ministry_official"))
):
    return {
        "total_institutions": db.query(func.count(Institution.id)).scalar(),
        "total_facilities": db.query(func.count(Facility.id)).scalar(),
        "total_patients": db.query(func.count(Patient.id)).scalar(),
        "total_encounters": db.query(func.count(Encounter.id)).scalar(),
        "total_prescriptions": db.query(func.count(Prescription.id)).scalar(),
        "total_lab_orders": db.query(func.count(LabOrder.id)).scalar(),
        "total_staff": db.query(func.count(User.id)).scalar(),
        "institutions_by_province": _group_counts(db, Institution, Institution.province),
        "patients_by_gender": _group_counts(db, Patient, Patient.gender),
    }


@router.get("/national/ncd-burden")
def ncd_burden(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("national_super_user", "ministry_official"))
):
    hypertension_count = db.query(func.count(Vitals.id)).filter(
        (Vitals.systolic_bp >= 140) | (Vitals.diastolic_bp >= 90)
    ).scalar()
    diabetes_count = db.query(func.count(Vitals.id)).filter(
        Vitals.blood_glucose > 11.1
    ).scalar()
    obesity_count = db.query(func.count(Vitals.id)).filter(
        Vitals.bmi >= 30
    ).scalar()
    total_vitals = db.query(func.count(Vitals.id)).scalar() or 1

    top_diagnoses = db.query(
        Diagnosis.description, func.count(Diagnosis.id).label("count")
    ).group_by(Diagnosis.description).order_by(func.count(Diagnosis.id).desc()).limit(10).all()

    return {
        "hypertension_readings": hypertension_count,
        "diabetes_readings": diabetes_count,
        "obesity_readings": obesity_count,
        "total_vital_readings": total_vitals,
        "hypertension_rate": round((hypertension_count / total_vitals) * 100, 1),
        "diabetes_rate": round((diabetes_count / total_vitals) * 100, 1),
        "obesity_rate": round((obesity_count / total_vitals) * 100, 1),
        "top_diagnoses": [{"name": d[0], "count": d[1]} for d in top_diagnoses],
    }


@router.get("/national/maternal-health")
def maternal_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("national_super_user", "ministry_official"))
):
    maternal_encounters = db.query(func.count(Encounter.id)).filter(
        Encounter.encounter_type == "maternal"
    ).scalar()
    return {
        "total_maternal_encounters": maternal_encounters,
        "maternal_encounters_by_province": [
            {"province": r[0], "count": r[1]}
            for r in db.query(
                Institution.province, func.count(Encounter.id)
            ).join(Encounter, Encounter.institution_id == Institution.id).filter(
                Encounter.encounter_type == "maternal"
            ).group_by(Institution.province).all()
        ]
    }


@router.get("/national/disease-trends")
def disease_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("national_super_user", "ministry_official"))
):
    severity_distribution = db.query(
        Diagnosis.severity, func.count(Diagnosis.id).label("count")
    ).group_by(Diagnosis.severity).all()

    encounter_types = db.query(
        Encounter.encounter_type, func.count(Encounter.id).label("count")
    ).group_by(Encounter.encounter_type).all()

    return {
        "severity_distribution": [{"severity": s[0] or "unspecified", "count": s[1]} for s in severity_distribution],
        "encounter_types": [{"type": e[0], "count": e[1]} for e in encounter_types],
    }


@router.get("/institution/{institution_id}/summary")
def institution_summary(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("national_super_user", "ministry_official", "institution_it_admin"))
):
    return {
        "total_patients": db.query(func.count(Patient.id)).filter(Patient.institution_id == institution_id).scalar(),
        "total_encounters": db.query(func.count(Encounter.id)).filter(Encounter.institution_id == institution_id).scalar(),
        "total_staff": db.query(func.count(User.id)).filter(User.institution_id == institution_id).scalar(),
        "total_facilities": db.query(func.count(Facility.id)).filter(Facility.institution_id == institution_id).scalar(),
        "pending_prescriptions": db.query(func.count(Prescription.id)).filter(
            Prescription.institution_id == institution_id, Prescription.status == "pending"
        ).scalar(),
        "pending_lab_orders": db.query(func.count(LabOrder.id)).filter(
            LabOrder.institution_id == institution_id, LabOrder.status.in_(["ordered", "collected", "processing"])
        ).scalar(),
    }


def _group_counts(db: Session, model, column):
    results = db.query(column, func.count(model.id)).group_by(column).all()
    return [{"label": r[0] or "unknown", "count": r[1]} for r in results]
