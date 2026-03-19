from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime


class LabTest(Base):
    """Reference table for available lab tests"""
    __tablename__ = "lab_tests"

    id = Column(Integer, primary_key=True, index=True)
    test_name = Column(String, nullable=False, index=True)
    test_code = Column(String, unique=True, nullable=True)  # LOINC code
    category = Column(String, nullable=True)  # hematology, chemistry, microbiology, pathology
    unit = Column(String, nullable=True)
    normal_range_low = Column(Float, nullable=True)
    normal_range_high = Column(Float, nullable=True)
    turnaround_hours = Column(Integer, default=24)


class LabOrder(Base):
    __tablename__ = "lab_orders"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=True)
    ordered_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    test_name = Column(String, nullable=False)
    test_code = Column(String, nullable=True)
    clinical_indication = Column(Text, nullable=True)
    priority = Column(String, default="routine")  # stat, urgent, routine
    status = Column(String, default="ordered")  # ordered, collected, processing, completed, cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="lab_orders")
    results = relationship("LabResult", back_populates="order")


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("lab_orders.id"), nullable=False)
    result_value = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    reference_range = Column(String, nullable=True)
    is_abnormal = Column(String, nullable=True)  # normal, high, low, critical
    notes = Column(Text, nullable=True)
    processed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("LabOrder", back_populates="results")
