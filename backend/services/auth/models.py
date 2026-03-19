from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime


ROLE_NATIONAL_SUPER_USER = "national_super_user"      # System-wide IT admin
ROLE_MINISTRY_OFFICIAL = "ministry_official"            # MoHCC analytics viewer
ROLE_INSTITUTION_IT_ADMIN = "institution_it_admin"      # Institution-level IT admin
ROLE_DOCTOR = "doctor"
ROLE_NURSE = "nurse"
ROLE_PHARMACIST = "pharmacist"
ROLE_LAB_TECH = "lab_tech"
ROLE_RECEPTIONIST = "receptionist"

NATIONAL_ROLES = [ROLE_NATIONAL_SUPER_USER, ROLE_MINISTRY_OFFICIAL]
ADMIN_ROLES = [ROLE_NATIONAL_SUPER_USER, ROLE_INSTITUTION_IT_ADMIN]
ALL_ROLES = [
    ROLE_NATIONAL_SUPER_USER, ROLE_MINISTRY_OFFICIAL,
    ROLE_INSTITUTION_IT_ADMIN, ROLE_DOCTOR, ROLE_NURSE,
    ROLE_PHARMACIST, ROLE_LAB_TECH, ROLE_RECEPTIONIST
]


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    department = Column(String, nullable=True)             # e.g. "General", "Dental", "Emergency"
    specialty = Column(String, nullable=True)              # e.g. "Cardiologist", "Surgeon"
    is_online = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    institution = relationship("Institution", back_populates="staff")
    facility = relationship("Facility", back_populates="staff")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # e.g. "patient_search", "view_record"
    details = Column(String, nullable=True)  # JSON or Query string
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
