import requests
import json

BASE_URL = "http://localhost:8001"

def test_oac_policy():
    print("--- Starting OAC Policy Test ---")
    
    # 1. Create Preference Policy
    print("\n[POST] /oac/policy (Preference)")
    preference_policy = {
        "@context": "https://w3id.org/oac/context.json",
        "type": "Preference",
        "odrl:uid": "ex:preference1",
        "dcterms:creator": "ex:userA",
        "odrl:permission": [
            {
                "assigner": "ex:userA",
                "target": "oac:Behavioral",
                "action": "oac:Read",
                "constraint": [
                    {
                        "leftOperand": "oac:Purpose",
                        "operator": "odrl:isA",
                        "rightOperand": "dpv:ResearchAndDevelopment"
                    }
                ]
            }
        ]
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/oac/policy", json=preference_policy)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("SUCCESS: Created Preference Policy")
            print(json.dumps(resp.json(), indent=2))
        else:
            print(f"FAILURE: {resp.text}")
    except Exception as e:
        print(f"ERROR: {e}")

    # 2. Get Created Policy
    print("\n[GET] /oac/policy/ex:preference1")
    try:
        resp = requests.get(f"{BASE_URL}/oac/policy/ex:preference1")
        if resp.status_code == 200:
            print("SUCCESS: Retrieved Policy")
        else:
            print(f"FAILURE: {resp.text}")
    except Exception as e:
        print(f"ERROR: {e}")

    # 3. Create Invalid Policy (Missing required field)
    print("\n[POST] /oac/policy (Invalid)")
    invalid_policy = {
        "type": "Preference",
        # Missing uid
        "odrl:permission": []
    }
    try:
        resp = requests.post(f"{BASE_URL}/oac/policy", json=invalid_policy)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 422:
            print("SUCCESS: Validation caught missing UID")
        else:
            print(f"FAILURE: Unexpected status {resp.status_code}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_oac_policy()
