from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime


class Encounter(Base):
    __tablename__ = "encounters"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    clinician_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    department = Column(String, nullable=True)             # e.g. "General", "Dental", "Emergency"
    encounter_type = Column(String, nullable=False)  # outpatient, inpatient, emergency, maternal, follow_up
    chief_complaint = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    status = Column(String, default="active")  # queued_for_triage, queued_for_doctor, active, completed, referred
    urgency_level = Column(String, default="normal") # normal, emergency
    previous_encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="encounters")
    previous_encounter = relationship("Encounter", remote_side=[id], backref="next_encounters")
    vitals = relationship("Vitals", back_populates="encounter")
    diagnoses = relationship("Diagnosis", back_populates="encounter")
    urgency_stamps = relationship("UrgencyStamp", back_populates="encounter")


class UrgencyStamp(Base):
    __tablename__ = "urgency_stamps"

    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    classification = Column(String, nullable=False) # normal, emergency
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    encounter = relationship("Encounter", back_populates="urgency_stamps")


class Vitals(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    recorded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    systolic_bp = Column(Float, nullable=True)
    diastolic_bp = Column(Float, nullable=True)
    heart_rate = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)  # Celsius
    respiratory_rate = Column(Float, nullable=True)
    spo2 = Column(Float, nullable=True)  # Oxygen saturation %
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    blood_glucose = Column(Float, nullable=True)  # mmol/L
    pain_score = Column(Integer, nullable=True)  # 0-10

    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    encounter = relationship("Encounter", back_populates="vitals")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=False)
    icd10_code = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    diagnosis_type = Column(String, default="primary")  # primary, secondary, differential
    severity = Column(String, nullable=True)  # mild, moderate, severe, critical
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    encounter = relationship("Encounter", back_populates="diagnoses")
