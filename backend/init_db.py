from database import engine, Base
# Import all models to ensure they're registered with Base
from services.auth.models import User
from services.institution.models import Institution, Facility
from services.patient.models import Patient
from services.clinical.models import Encounter, Vitals, Diagnosis
from services.pharmacy.models import Prescription, Medication
from services.laboratory.models import LabOrder, LabResult, LabTest

print("Recreating database schema...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Schema recreation complete.")
