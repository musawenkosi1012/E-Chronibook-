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
    
    # 1. Ensure Institution exists
    cursor.execute("SELECT id FROM institutions LIMIT 1")
    inst = cursor.fetchone()
    if not inst:
        print("Seeding default institution...")
        cursor.execute("""
            INSERT INTO institutions (
                facility_name, facility_type, ownership, mohcc_reg_no, 
                province, official_email, primary_phone, physical_address,
                internet_availability, power_backup, current_record_system,
                admin_name, admin_contact, registration_status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'Parirenyatwa Group of Hospitals', 'Quaternary', 'Public', 'MOHCC-001',
            'Harare', 'admin@parirenyatwa.co.zw', '+263 242 701555', 'Mazowe St, Harare',
            'High', 'Solar & Generator', 'Digital', 'Dr. Mercy M. Admin', '+263 771 000 000',
            'Approved', datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        ))
        inst_id = cursor.lastrowid
    else:
        inst_id = inst[0]

    # 2. Ensure Facility exists
    cursor.execute("SELECT id FROM facilities WHERE institution_id = ?", (inst_id,))
    fac = cursor.fetchone()
    if not fac:
        print("Seeding default facility...")
        cursor.execute("""
            INSERT INTO facilities (
                institution_id, name, facility_type, province, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            inst_id, 'Main Triage & Consultation Hub', 'Clinical Unit', 'Harare', 1,
            datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        ))
        fac_id = cursor.lastrowid
    else:
        fac_id = fac[0]

    # 3. Seed Professional Users
    users_to_seed = [
        # (Full Name, Email, Role)
        ('Tendai Receptionist', 'reception@echronibook.co.zw', 'receptionist'),
        ('Sister Memory Nurse', 'sister@echronibook.co.zw', 'nurse'),
        ('Dr. Farai Specialist', 'doctor@echronibook.co.zw', 'doctor'),
        ('National Admin', 'admin@echronibook.co.zw', 'national_super_user')
    ]

    hashed = hash_password(PASSWORD)
    now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    for name, email, role in users_to_seed:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            cursor.execute("UPDATE users SET hashed_password = ?, role = ? WHERE email = ?", (hashed, role, email))
            print(f"Updated credentials for {email}")
        else:
            cursor.execute("""
                INSERT INTO users (full_name, email, hashed_password, role, institution_id, facility_id, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (name, email, hashed, role, inst_id, fac_id, 1, now))
            print(f"Created professional account: {name} ({role})")

    conn.commit()
    conn.close()
    print("\n--- Seeding Complete ---")
    print(f"Shared Password: {PASSWORD}")

if __name__ == "__main__":
    seed_database()
