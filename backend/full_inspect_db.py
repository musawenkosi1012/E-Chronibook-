import sqlite3
import os

db_path = 'echronibook.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Total Tables: {len(tables)}")
    for table_name in tables:
        name = table_name[0]
        print(f"\n--- {name} ---")
        cursor.execute(f"PRAGMA table_info({name});")
        print(cursor.fetchall())
        cursor.execute(f"SELECT count(*) FROM {name};")
        print(f"Row count: {cursor.fetchone()[0]}")
    conn.close()
else:
    print("Database not found")
