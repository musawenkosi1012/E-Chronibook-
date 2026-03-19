from pydantic import BaseModel
from typing import Optional
import datetime


class InstitutionCreate(BaseModel):
    facility_name: str
    facility_type: str
    ownership: str
    mohcc_reg_no: str
    province: str
    district: Optional[str] = None
    official_email: str
    primary_phone: str
    physical_address: str
    internet_availability: str
    power_backup: str
    current_record_system: str
    admin_name: str
    admin_contact: str
    admin_password: str
    consent_given: bool


class InstitutionOut(BaseModel):
    id: int
    facility_name: str
    facility_type: str
    ownership: str
    mohcc_reg_no: str
    province: str
    district: Optional[str] = None
    official_email: str
    primary_phone: str
    physical_address: str
    internet_availability: str
    power_backup: str
    current_record_system: str
    admin_name: str
    admin_contact: str
    consent_given: bool
    registration_status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class FacilityCreate(BaseModel):
    name: str
    facility_type: str
    province: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None


class FacilityOut(BaseModel):
    id: int
    institution_id: int
    name: str
    facility_type: str
    province: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
