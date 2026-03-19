import sqlite3
import hashlib
import datetime
import os

# Configuration
DB_PATH = 'echronibook.db'
PASSWORD = 'password123'  # Shared password for ease of testing

def hash_password(password: str) -> str:
    """Matches the project's hashing mechanism (SHA256)."""
    return hashlib.sha256(password.encode()).hexdigest()

def seed_database():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get institution/facility ID (using first ones if exist)
    cursor.execute("SELECT id FROM institutions LIMIT 1")
    inst = cursor.fetchone()
    inst_id = inst[0] if inst else 1

    cursor.execute("SELECT id FROM facilities LIMIT 1")
    fac = cursor.fetchone()
    fac_id = fac[0] if fac else 1

    # 3. Seed Professional Users with Departments
    users_to_seed = [
        # (Full Name, Email, Role, Department, Specialty)
        ('Tendai Receptionist', 'reception@echronibook.co.zw', 'receptionist', 'General', 'Outpatient Clerical'),
        ('Sister Memory Nurse', 'sister@echronibook.co.zw', 'nurse', 'Triage', 'Senior Triage Nurse'),
        ('Dr. Farai General', 'doctor@echronibook.co.zw', 'doctor', 'General Medicine', 'General Practitioner'),
        ('Dr. Chipo Dental', 'dental@echronibook.co.zw', 'doctor', 'Dental Surgery', 'Maxillofacial Specialist'),
        ('Dr. Kudzai Pedz', 'pediatrics@echronibook.co.zw', 'doctor', 'Pediatrics Oncology', 'Child Specialist'),
        ('National Admin', 'admin@echronibook.co.zw', 'national_super_user', 'MOHCC', 'National Health Admin')
    ]

    hashed = hash_password(PASSWORD)
    now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    for name, email, role, dept, spec in users_to_seed:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            cursor.execute("""
                UPDATE users 
                SET role = ?, department = ?, specialty = ?, is_online = 1, hashed_password = ?
                WHERE email = ?
            """, (role, dept, spec, hashed, email))
            print(f"Synchronized professional profile: {email} ({dept})")
        else:
            cursor.execute("""
                INSERT INTO users (full_name, email, hashed_password, role, institution_id, facility_id, department, specialty, is_online, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (name, email, hashed, role, inst_id, fac_id, dept, spec, 1, 1, now))
            print(f"Created professional account: {name} ({role} - {dept})")

    conn.commit()
    conn.close()
    print("\n--- Professional Workforce Seeding Complete ---")
    print(f"All Clinical Staff marked as ONLINE for testing.")

if __name__ == "__main__":
    seed_database()
