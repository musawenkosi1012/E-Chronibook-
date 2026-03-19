import requests

API = "http://127.0.0.1:8000"

def test_longitudinal_chain():
    # 1. Login
    print("Logging in as Doctor...")
    res = requests.post(f"{API}/api/auth/login", json={"email": "doctor@echronibook.co.zw", "password": "password123"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 2. Find/Register Patient
    print("Registering patient...")
    p_res = requests.post(f"{API}/api/patients/register", headers=headers, json={
        "national_id": "CH-URGENCY-002", "first_name": "Timeline", "last_name": "Tester", "date_of_birth": "1990-05-05", "gender": "male"
    })
    if p_res.status_code != 200:
        print(f"Patient Reg Failed: {p_res.status_code} - {p_res.text}")
        return
    patient_id = p_res.json()["id"]
    
    # 3. Create First Encounter (Outpatient)
    print("Creating encounter 1 (Outpatient)...")
    enc1_res = requests.post(f"{API}/api/clinical/create", headers=headers, json={
        "patient_id": patient_id, "encounter_type": "outpatient", "status": "completed"
    })
    if enc1_res.status_code != 200:
        print(f"Enc1 Failed: {enc1_res.status_code} - {enc1_res.text}")
        return
    enc1_id = enc1_res.json()["id"]
    print(f"Enc 1 ID: {enc1_id}, Prev: {enc1_res.json()['previous_encounter_id']}")

    # 4. Create Second Encounter (Triage)
    print("Creating encounter 2 (Triage)...")
    enc2_res = requests.post(f"{API}/api/clinical/create", headers=headers, json={
        "patient_id": patient_id, "encounter_type": "triage", "status": "active"
    })
    if enc2_res.status_code != 200:
        print(f"Enc2 Failed: {enc2_res.status_code} - {enc2_res.text}")
        return
    enc2_data = enc2_res.json()
    print(f"Enc 2 ID: {enc2_data['id']}, Prev: {enc2_data['previous_encounter_id']}")
    
    # Verify Link
    if enc2_data['previous_encounter_id'] == enc1_id:
        print("SUCCESS: Encounter chain linked correctly!")
    else:
        print("FAILED: Chain link missing.")

    # 6. Fetch Confirmation Preview (Optimized)
    print("\nFetching confirmation preview (Optimized for Reception)...")
    conf_res = requests.get(f"{API}/api/clinical/patients/{patient_id}/confirmation-preview", headers=headers)
    if conf_res.status_code != 200:
        print(f"Confirmation Preview Failed: {conf_res.status_code} - {conf_res.text}")
        return
    previews = conf_res.json()
    print(f"Found {len(previews)} recent encounters for verification:")
    for p in previews:
        print(f"- {p['date']} | {p['facility']} | {p['reason']}")

if __name__ == "__main__":
    test_longitudinal_chain()
