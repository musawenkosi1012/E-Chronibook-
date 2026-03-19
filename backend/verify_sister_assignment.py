import requests

API = "http://127.0.0.1:8000"

def test_sister_assignment():
    # 1. Login as Sister
    print("Logging in as Sister...")
    res = requests.post(f"{API}/api/auth/login", json={"email": "sister@echronibook.co.zw", "password": "password123"})
    if res.status_code != 200:
        print(f"FAILED Sister Login: {res.text}")
        return
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 2. Get Doctor (Dr. Farai)
    print("Fetching doctors...")
    doc_res = requests.get(f"{API}/api/auth/doctors", headers=headers)
    doctors = doc_res.json()
    dr_farai = next((d for d in doctors if "Farai" in d["full_name"]), None)
    if not dr_farai:
        print("FAILED: Dr. Farai not found in doctors list.")
        return
    print(f"Selected Doctor: {dr_farai['full_name']} (ID: {dr_farai['id']})")
    
    # 3. Get first queued patient
    print("Fetching triage queue...")
    q_res = requests.get(f"{API}/api/encounters/queue?status=queued_for_triage", headers=headers)
    queue = q_res.json()
    if not queue:
        print("Queue empty. Registering one first as Receptionist...")
        # Quick receptionist login
        r_res = requests.post(f"{API}/api/auth/login", json={"email": "reception@echronibook.co.zw", "password": "password123"})
        r_token = r_res.json()["access_token"]
        r_headers = {"Authorization": f"Bearer {r_token}", "Content-Type": "application/json"}
        # Register and queue
        p_res = requests.post(f"{API}/api/patients/register", headers=r_headers, json={
            "national_id": "99-999999-Z-99", "first_name": "Triage", "last_name": "Test", "date_of_birth": "1980-01-01", "gender": "female"
        })
        p_id = p_res.json()["id"]
        requests.post(f"{API}/api/encounters/create", headers=r_headers, json={
            "patient_id": p_id, "encounter_type": "outpatient", "status": "queued_for_triage"
        })
        # Re-fetch queue
        q_res = requests.get(f"{API}/api/encounters/queue?status=queued_for_triage", headers=headers)
        queue = q_res.json()

    encounter = queue[0]
    print(f"Target Encounter ID: {encounter['id']}")
    
    # 4. Perform Assignment
    print("Assigning to doctor with vitals...")
    assign_data = {
        "clinician_id": dr_farai["id"],
        "department": "Dental Surgery",
        "chief_complaint": "Severe toothache",
        "vitals": {
            "systolic_bp": 120, "diastolic_bp": 80, "temperature": 37.2
        }
    }
    
    a_res = requests.patch(f"{API}/api/encounters/{encounter['id']}/assign", headers=headers, json=assign_data)
    if a_res.status_code == 200:
        data = a_res.json()
        print(f"SUCCESS! Encounter status: {data['status']}")
        print(f"Assigned Clinician ID: {data['clinician_id']}")
    else:
        print(f"FAILED Assignment: {a_res.status_code} - {a_res.text}")

if __name__ == "__main__":
    test_sister_assignment()
