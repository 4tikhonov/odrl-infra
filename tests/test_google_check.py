import requests
import json
import unittest
from unittest.mock import patch, MagicMock

# We need to mock the google verification in the running service?
# No, we can't easily mock inside the running container from outside.
# But we can try to get a real token or modify app.py to accept a debug token.
# Or we can run a unit test against app.py LOCALLY if we had the dependencies.

# Better approach for now: 
# modify app.py to allow a "DEBUG_TOKEN" if an env var is set,
# OR just rely on the fact that if we send a bad token, we get a 400.
# If we get a 400 "Invalid Google Token", it means the endpoint is reachable and logic is running.

def test_google_vc_endpoint():
    print("Testing Google VC Endpoint...")
    url = "http://localhost:8001/vc/google"
    
    # 1. Test with invalid token
    payload = {
        "token": "invalid_token",
        "subject_did": "did:oyd:123"
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Response Status: {response.status_code}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 400 and "Invalid Google Token" in response.text:
            print("SUCCESS: Endpoint validates token.")
        else:
            print("FAILURE: Unexpected response for invalid token.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_google_vc_endpoint()
