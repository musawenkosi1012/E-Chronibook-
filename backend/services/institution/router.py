from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.institution.models import Institution, Facility
from services.institution.schemas import InstitutionCreate, InstitutionOut, FacilityCreate, FacilityOut
from services.auth.models import User
from services.auth.dependencies import hash_password, create_token, get_current_user, require_role

router = APIRouter(prefix="/api/institutions", tags=["Institutions"])


@router.post("/register")
def register_institution(data: InstitutionCreate, db: Session = Depends(get_db)):
    existing = db.query(Institution).filter(Institution.mohcc_reg_no == data.mohcc_reg_no).first()
    if existing:
        raise HTTPException(status_code=400, detail="Institution with this MoHCC registration number already exists")
    if not data.consent_given:
        raise HTTPException(status_code=400, detail="Zimbabwe Cyber and Data Protection Act consent is required")

    inst = Institution(
        facility_name=data.facility_name,
        facility_type=data.facility_type,
        ownership=data.ownership,
        mohcc_reg_no=data.mohcc_reg_no,
        province=data.province,
        district=data.district,
        official_email=data.official_email,
        primary_phone=data.primary_phone,
        physical_address=data.physical_address,
        internet_availability=data.internet_availability,
        power_backup=data.power_backup,
        current_record_system=data.current_record_system,
        admin_name=data.admin_name,
        admin_contact=data.admin_contact,
        consent_given=data.consent_given,
        registration_status="active"
    )
    db.add(inst)
    db.flush()

    # Auto-create the Institution IT Admin user
    admin_user = User(
        full_name=data.admin_name,
        email=data.admin_contact,
        hashed_password=hash_password(data.admin_password),
        role="institution_it_admin",
        institution_id=inst.id
    )
    db.add(admin_user)
    db.commit()
    db.refresh(inst)
    db.refresh(admin_user)

    token = create_token(admin_user.id, admin_user.role, admin_user.institution_id)

    return {
        "status": "success",
        "institution_id": inst.id,
        "message": "Facility successfully onboarded",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": admin_user.id,
            "full_name": admin_user.full_name,
            "email": admin_user.email,
            "role": admin_user.role,
            "institution_id": admin_user.institution_id
        }
    }


@router.get("/list", response_model=list[InstitutionOut])
def list_institutions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("national_super_user", "ministry_official"))
):
    return db.query(Institution).all()


@router.get("/{institution_id}", response_model=InstitutionOut)
def get_institution(institution_id: int, db: Session = Depends(get_db)):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    return inst


# --- Sub-Facility Management ---

@router.post("/{institution_id}/facilities", response_model=FacilityOut)
def register_facility(
    institution_id: int,
    data: FacilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("national_super_user", "institution_it_admin"))
):
    """Register a clinic or hospital under an institution"""
    if current_user.role == "institution_it_admin" and current_user.institution_id != institution_id:
        raise HTTPException(status_code=403, detail="Cannot register facilities for another institution")

    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")

    facility = Facility(
        institution_id=institution_id,
        name=data.name,
        facility_type=data.facility_type,
        province=data.province or inst.province,
        district=data.district,
        address=data.address,
        phone=data.phone
    )
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


@router.get("/{institution_id}/facilities", response_model=list[FacilityOut])
def list_facilities(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all clinics/hospitals under an institution"""
    return db.query(Facility).filter(Facility.institution_id == institution_id).all()
