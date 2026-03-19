import requests

API = "http://127.0.0.1:8000"

def test_login(email, password):
    print(f"Testing login for {email}...")
    try:
        res = requests.post(f"{API}/api/auth/login", json={"email": email, "password": password})
        if res.status_code == 200:
            print(f"SUCCESS: {email} logged in.")
            return True
        else:
            print(f"FAILED: {email} login returned {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"ERROR: Could not connect to backend: {e}")
        return False

if __name__ == "__main__":
    test_login("doctor@echronibook.co.zw", "password123")
    test_login("reception@echronibook.co.zw", "password123")
    test_login("sister@echronibook.co.zw", "password123")
