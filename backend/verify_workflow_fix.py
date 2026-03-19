import requests

API = "http://127.0.0.1:8000"

def test_full_workflow():
    print("Step 1: Authenticating as Receptionist...")
    auth_res = requests.post(f"{API}/api/auth/login", json={
        "email": "reception@echronibook.co.zw",
        "password": "password123"
    })
    
    if auth_res.status_code != 200:
        print(f"Auth FAILED: {auth_res.text}")
        return
    
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Auth SUCCESS.")

    print("\nStep 2: Searching for Test Patient...")
    search_res = requests.get(f"{API}/api/patients/search?q=Test", headers=headers)
    patients = search_res.json()
    
    if not patients:
        print("Test Patient not found. Registering a new one...")
        reg_res = requests.post(f"{API}/api/patients/register", headers=headers, json={
            "national_id": "63-000000-A-01",
            "first_name": "API",
            "last_name": "Verified",
            "date_of_birth": "1990-01-01",
            "gender": "male"
        })
        patient_id = reg_res.json()["id"]
        print(f"Patient registered with ID: {patient_id}")
    else:
        patient_id = patients[0]["id"]
        print(f"Found Patient ID: {patient_id}")

    print("\nStep 3: Attempting to Queue for Triage (Create Encounter)...")
    encounter_data = {
        "patient_id": patient_id,
        "encounter_type": "outpatient",
        "status": "queued_for_triage"
    }
    
    enc_res = requests.post(f"{API}/api/encounters/create", headers=headers, json=encounter_data)
    
    if enc_res.status_code == 200:
        print("SUCCESS! Receptionist is now permitted to create encounters.")
        print(f"Encounter ID created: {enc_res.json()['id']}")
    elif enc_res.status_code == 403:
        print("FAILED: Permission still denied (403 Forbidden).")
    else:
        print(f"FAILED: Unexpected status {enc_res.status_code} - {enc_res.text}")

if __name__ == "__main__":
    test_full_workflow()
