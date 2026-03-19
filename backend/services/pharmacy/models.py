from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    generic_name = Column(String, nullable=False, index=True)
    brand_name = Column(String, nullable=True)
    form = Column(String, nullable=False)  # tablet, capsule, injection, syrup, topical
    strength = Column(String, nullable=False)  # e.g., "500mg", "10ml"
    category = Column(String, nullable=True)  # antihypertensive, antibiotic, analgesic, etc.
    requires_prescription = Column(Boolean, default=True)
    stock_quantity = Column(Integer, default=0)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=True)
    prescriber_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)

    medication_name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)  # e.g., "500mg"
    frequency = Column(String, nullable=False)  # e.g., "2x daily"
    duration = Column(String, nullable=False)  # e.g., "7 days"
    route = Column(String, nullable=True)  # oral, IV, IM, topical
    instructions = Column(Text, nullable=True)
    quantity = Column(Integer, default=1)

    status = Column(String, default="pending")  # pending, dispensed, cancelled
    dispensed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    dispensed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")
