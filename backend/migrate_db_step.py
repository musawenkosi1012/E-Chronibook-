from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Check if columns exist
        res = conn.execute(text("PRAGMA table_info(users)"))
        cols = [r[1] for r in res]
        print(f"Current columns in 'users': {cols}")
        
        if "department" not in cols:
            print("Adding 'department' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN department VARCHAR"))
        if "specialty" not in cols:
            print("Adding 'specialty' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN specialty VARCHAR"))
        
        conn.commit()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
