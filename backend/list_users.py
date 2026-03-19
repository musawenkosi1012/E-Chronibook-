import sqlite3
import os

db_path = r'echronibook.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    columns = [description[0] for description in cursor.description]
    users = cursor.fetchall()
    print("Users found in the database:")
    for user in users:
        print(dict(zip(columns, user)))
    conn.close()
else:
    print(f"Database not found at {db_path}")
