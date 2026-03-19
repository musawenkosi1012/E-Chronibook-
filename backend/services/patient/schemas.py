from pydantic import BaseModel
from typing import Optional
import datetime


class PatientCreate(BaseModel):
    national_id: Optional[str] = None
    first_name: str
    last_name: str
    date_of_birth: str  # ISO date string
    gender: str
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    province: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class PatientOut(BaseModel):
    id: int
    national_id: Optional[str] = None
    first_name: str
    last_name: str
    date_of_birth: datetime.date
    gender: str
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    province: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    institution_id: Optional[int] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
