from pydantic import BaseModel
from typing import Optional
import datetime


class VitalsCreate(BaseModel):
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    heart_rate: Optional[float] = None
    temperature: Optional[float] = None
    respiratory_rate: Optional[float] = None
    spo2: Optional[float] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    blood_glucose: Optional[float] = None
    pain_score: Optional[int] = None


class VitalsOut(VitalsCreate):
    id: int
    encounter_id: int
    patient_id: int
    bmi: Optional[float] = None
    recorded_at: datetime.datetime

    class Config:
        from_attributes = True


class UrgencyStampOut(BaseModel):
    id: int
    user_id: int
    role: str
    facility_id: Optional[int] = None
    classification: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True


class DiagnosisCreate(BaseModel):
    icd10_code: Optional[str] = None
    description: str
    diagnosis_type: str = "primary"
    severity: Optional[str] = None


class DiagnosisOut(DiagnosisCreate):
    id: int
    encounter_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class EncounterCreate(BaseModel):
    patient_id: int
    encounter_type: str
    chief_complaint: Optional[str] = None
    clinical_notes: Optional[str] = None
    vitals: Optional[VitalsCreate] = None
    diagnoses: Optional[list[DiagnosisCreate]] = None
    status: str = "active"
    urgency_level: str = "normal"


class EncounterUpdateVitals(BaseModel):
    vitals: VitalsCreate
    urgency_level: Optional[str] = None


class EncounterUpdateClinical(BaseModel):
    clinical_notes: Optional[str] = None
    diagnoses: Optional[list[DiagnosisCreate]] = None
    urgency_level: Optional[str] = None


class EncounterAssignment(BaseModel):
    clinician_id: int
    department: Optional[str] = None
    chief_complaint: Optional[str] = None
    vitals: Optional[VitalsCreate] = None
    urgency_level: Optional[str] = None


class EncounterOut(BaseModel):
    id: int
    patient_id: int
    clinician_id: int
    institution_id: int
    facility_id: Optional[int] = None
    department: Optional[str] = None
    encounter_type: str
    chief_complaint: Optional[str] = None
    clinical_notes: Optional[str] = None
    status: str
    urgency_level: str
    previous_encounter_id: Optional[int] = None
    created_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    vitals: list[VitalsOut] = []
    diagnoses: list[DiagnosisOut] = []
    urgency_stamps: list[UrgencyStampOut] = []

    class Config:
        from_attributes = True


class TimelineEvent(BaseModel):
    id: int
    patient_id: int
    timestamp: datetime.datetime
    facility_name: Optional[str] = None
    department: Optional[str] = None
    event_type: str
    provider_name: str
    provider_role: str
    action: str
    content_summary: str  # e.g. "Vitals: 120/80, Temp 37.0" or "Diagnosis: Malaria"
    encounter_id: int


class EncounterConfirmationPreview(BaseModel):
    id: int
    date: datetime.datetime
    facility: str
    reason: str  # This will likely be encounter_type + chief_complaint summary
