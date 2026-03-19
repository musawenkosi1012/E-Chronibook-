from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.auth.models import User
from services.auth.schemas import UserCreate, UserOut, LoginRequest, TokenResponse
from services.auth.dependencies import hash_password, verify_password, create_token, get_current_user, require_role

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Trust On First Use (TOFU) Logic
    if user.hashed_password == "TOFU_PENDING":
        user.hashed_password = hash_password(req.password)
        db.commit()
        print(f"DEBUG: Password set for {user.email} on first login (TOFU)")

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    token = create_token(user.id, user.role, user.institution_id)
    user.is_online = True
    db.commit()
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/register-staff", response_model=UserOut)
def register_staff(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("national_super_user", "institution_it_admin"))
):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Institution IT admins can only create staff within their institution
    if current_user.role == "institution_it_admin":
        if user_data.institution_id and user_data.institution_id != current_user.institution_id:
            raise HTTPException(status_code=403, detail="Cannot provision staff for another institution")
        user_data.institution_id = current_user.institution_id

    # Determine password
    hp = hash_password(user_data.password) if user_data.password else "TOFU_PENDING"

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hp,
        role=user_data.role,
        institution_id=user_data.institution_id,
        department=user_data.department,
        specialty=user_data.specialty
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/staff", response_model=list[UserOut])
def list_staff(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("national_super_user", "institution_it_admin"))
):
    if current_user.role == "institution_it_admin":
        return db.query(User).filter(User.institution_id == current_user.institution_id).all()
    return db.query(User).all()


@router.get("/doctors", response_model=list[UserOut])
def list_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists clinicians (doctors/nurses) for assignment."""
    query = db.query(User).filter(User.role.in_(["doctor", "nurse"]))
    if current_user.role != "national_super_user":
        query = query.filter(User.institution_id == current_user.institution_id)
    return query.all()
