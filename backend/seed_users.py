import sqlite3
import hashlib
import os
import datetime

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

db_path = r'echronibook.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    users_to_add = [
        ('Receptionist', 'receptionist@hospital.co.zw', 'receptionist', 1),
        ('Sister Mary', 'nurse@hospital.co.zw', 'nurse', 1),
        ('Dr. Smith', 'doctor@hospital.co.zw', 'doctor', 1)
    ]

    for name, email, role, inst_id in users_to_add:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            print(f"User {email} already exists.")
        else:
            cursor.execute("""
                INSERT INTO users (full_name, email, hashed_password, role, institution_id, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (name, email, hash_password('password'), role, inst_id, 1, datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')))
            print(f"User {email} created with role {role} and password 'password'.")
            
    conn.commit()
    conn.close()
else:
    print(f"Database not found at {db_path}")
