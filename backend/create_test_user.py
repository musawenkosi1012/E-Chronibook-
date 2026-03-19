import sqlite3
import hashlib
import os

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

db_path = r'echronibook.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = 'test@test.com'")
    if cursor.fetchone():
        print("User test@test.com already exists.")
    else:
        cursor.execute("""
            INSERT INTO users (full_name, email, hashed_password, role, institution_id, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ('Test User', 'test@test.com', hash_password('password'), 'national_super_user', 1, 1, '2026-03-10 15:35:00'))
        conn.commit()
        print("User test@test.com created with role national_super_user and password 'password'.")
    conn.close()
else:
    print(f"Database not found at {db_path}")
