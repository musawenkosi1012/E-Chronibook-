"""
E-ChroniBook National EMR — API Gateway
A microservice-based national EMR for Zimbabwe's healthcare system.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Import all models to ensure they're registered with SQLAlchemy
from services.auth.models import User
from services.institution.models import Institution, Facility
from services.patient.models import Patient
from services.clinical.models import Encounter, Vitals, Diagnosis, UrgencyStamp
from services.pharmacy.models import Prescription, Medication
from services.laboratory.models import LabOrder, LabResult, LabTest

# Import routers
from services.auth.router import router as auth_router
from services.institution.router import router as institution_router
from services.patient.router import router as patient_router
from services.clinical.router import router as clinical_router
from services.pharmacy.router import router as pharmacy_router
from services.laboratory.router import router as laboratory_router
from services.analytics.router import router as analytics_router

# Create all tables
Base.metadata.create_all(bind=engine)

# --- App Configuration ---
app = FastAPI(
    title="E-ChroniBook National EMR",
    description="Zimbabwe's unified national Electronic Medical Record system. A microservice-based platform for clinical workflows, patient management, and national health intelligence.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount Service Routers ---
app.include_router(auth_router)
app.include_router(institution_router)
app.include_router(patient_router)
app.include_router(clinical_router)
app.include_router(pharmacy_router)
app.include_router(laboratory_router)
app.include_router(analytics_router)


@app.get("/")
def read_root():
    return {
        "system": "E-ChroniBook National EMR",
        "version": "1.0.0",
        "status": "operational",
        "services": [
            "auth", "institutions", "patients",
            "clinical", "pharmacy", "laboratory", "analytics"
        ]
    }
