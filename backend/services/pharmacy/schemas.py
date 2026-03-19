from pydantic import BaseModel
from typing import Optional
import datetime


class MedicationCreate(BaseModel):
    generic_name: str
    brand_name: Optional[str] = None
    form: str
    strength: str
    category: Optional[str] = None
    requires_prescription: bool = True
    stock_quantity: int = 0


class MedicationOut(MedicationCreate):
    id: int
    institution_id: Optional[int] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class PrescriptionCreate(BaseModel):
    patient_id: int
    encounter_id: Optional[int] = None
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    route: Optional[str] = None
    instructions: Optional[str] = None
    quantity: int = 1


class PrescriptionOut(BaseModel):
    id: int
    patient_id: int
    encounter_id: Optional[int] = None
    prescriber_id: int
    institution_id: int
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    route: Optional[str] = None
    instructions: Optional[str] = None
    quantity: int
    status: str
    dispensed_by_id: Optional[int] = None
    dispensed_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
