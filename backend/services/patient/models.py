from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    national_id = Column(String, unique=True, index=True, nullable=True)
    first_name = Column(String, index=True, nullable=False)
    last_name = Column(String, index=True, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String, nullable=False)  # male, female, other
    blood_type = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    province = Column(String, nullable=True)

    # Medical baseline
    allergies = Column(Text, nullable=True)  # JSON array
    chronic_conditions = Column(Text, nullable=True)  # JSON array
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)

    # Assignment
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    registered_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    institution = relationship("Institution", back_populates="patients")
    encounters = relationship("Encounter", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    lab_orders = relationship("LabOrder", back_populates="patient")
