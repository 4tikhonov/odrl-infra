import requests
import json
import os

BASE_URL = "http://localhost:8001"
POLICY_FILE = "oac_example_offer.json"

def test_submit_example():
    print(f"--- Submitting {POLICY_FILE} ---")
    
    if not os.path.exists(POLICY_FILE):
        print(f"Error: {POLICY_FILE} not found.")
        return

    with open(POLICY_FILE, "r") as f:
        policy_data = json.load(f)

    # Change UID to avoid conflict if running multiple times (optional, but good for testing)
    # policy_data["odrl:uid"] = "ex:offer" + str(int(time.time())) 
    # For now, we stick to the file content as is, assuming the server doesn't persist across restarts 
    # or the user wants to test exactly this file.
    
    try:
        resp = requests.post(f"{BASE_URL}/api/oac/policy", json=policy_data)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("SUCCESS: Policy Created")
            print(json.dumps(resp.json(), indent=2))
        else:
            print(f"FAILURE: {resp.text}")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_submit_example()
