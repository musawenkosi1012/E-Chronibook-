from pydantic import BaseModel
from typing import Optional
import datetime


class UserCreate(BaseModel):
    full_name: str
    email: str
    password: Optional[str] = None
    role: str
    institution_id: Optional[int] = None
    department: Optional[str] = None
    specialty: Optional[str] = None


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    institution_id: Optional[int] = None
    department: Optional[str] = None
    specialty: Optional[str] = None
    is_online: bool = False
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str
    institution_id: Optional[int] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
