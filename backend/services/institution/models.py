from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)

    # Facility Demographics
    facility_name = Column(String, index=True, nullable=False)
    facility_type = Column(String, nullable=False)
    ownership = Column(String, nullable=False)

    # Legal & Contact
    mohcc_reg_no = Column(String, unique=True, index=True, nullable=False)
    province = Column(String, nullable=False)
    district = Column(String, nullable=True)
    official_email = Column(String, nullable=False)
    primary_phone = Column(String, nullable=False)
    physical_address = Column(Text, nullable=False)

    # Technical Readiness
    internet_availability = Column(String, nullable=False)
    power_backup = Column(String, nullable=False)
    current_record_system = Column(String, nullable=False)

    # Admin Lead Contact
    admin_name = Column(String, nullable=False)
    admin_contact = Column(String, nullable=False)

    # Compliance
    consent_given = Column(Boolean, default=False)
    registration_status = Column(String, default="pending")  # pending, verified, active, suspended
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    staff = relationship("User", back_populates="institution")
    patients = relationship("Patient", back_populates="institution")
    facilities = relationship("Facility", back_populates="institution")


class Facility(Base):
    """Sub-facilities (clinics, hospitals) registered under an Institution"""
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    facility_type = Column(String, nullable=False)  # clinic, hospital, health_centre, pharmacy, laboratory
    province = Column(String, nullable=True)
    district = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    institution = relationship("Institution", back_populates="facilities")
    staff = relationship("User", back_populates="facility")
