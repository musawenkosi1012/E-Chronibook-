from pydantic import BaseModel
from typing import Optional
import datetime


class LabTestOut(BaseModel):
    id: int
    test_name: str
    test_code: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    normal_range_low: Optional[float] = None
    normal_range_high: Optional[float] = None
    turnaround_hours: int

    class Config:
        from_attributes = True


class LabOrderCreate(BaseModel):
    patient_id: int
    encounter_id: Optional[int] = None
    test_name: str
    test_code: Optional[str] = None
    clinical_indication: Optional[str] = None
    priority: str = "routine"


class LabResultCreate(BaseModel):
    result_value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    is_abnormal: Optional[str] = None
    notes: Optional[str] = None


class LabResultOut(LabResultCreate):
    id: int
    order_id: int
    processed_by_id: int
    completed_at: datetime.datetime

    class Config:
        from_attributes = True


class LabOrderOut(BaseModel):
    id: int
    patient_id: int
    encounter_id: Optional[int] = None
    ordered_by_id: int
    institution_id: int
    test_name: str
    test_code: Optional[str] = None
    clinical_indication: Optional[str] = None
    priority: str
    status: str
    created_at: datetime.datetime
    results: list[LabResultOut] = []

    class Config:
        from_attributes = True
