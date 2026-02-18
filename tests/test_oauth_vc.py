import requests
import unittest
from unittest.mock import MagicMock, patch
import json

# Since we cannot easily mock the internal requests of the running service from outside,
# we will just test that the endpoints are reachable and return the expected 400s 
# (simulating invalid tokens) or we can try to use a mock server?
# 
# Simpler approach:
# 1. Call /vc/github with invalid token -> Expect 400 "Invalid GitHub Token"
# 2. Call /vc/orcid with invalid token -> Expect 400 "Invalid ORCID Token"
#
# This proves the routing and basic logic is in place.

def test_oauth_endpoints():
    print("Testing OAuth VC Endpoints...")
    
    # GitHub
    print("\n[GitHub]")
    url_github = "http://localhost:8001/api/vc/github"
    payload_github = {
        "token": "invalid_gh_token",
        "subject_did": "did:oyd:123"
    }
    try:
        resp = requests.post(url_github, json=payload_github)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        if resp.status_code == 400 and "Invalid GitHub Token" in resp.text:
            print("SUCCESS: GitHub endpoint active and validating.")
        else:
            print("FAILURE: Unexpected response for GitHub.")
    except Exception as e:
        print(f"Error: {e}")

    # ORCID
    print("\n[ORCID]")
    url_orcid = "http://localhost:8001/api/vc/orcid"
    payload_orcid = {
        "token": "invalid_orcid_token",
        "orcid": "0000-0000-0000-0000",
        "subject_did": "did:oyd:123"
    }
    try:
        resp = requests.post(url_orcid, json=payload_orcid)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        if resp.status_code == 400 and "Invalid ORCID Token" in resp.text:
            print("SUCCESS: ORCID endpoint active and validating.")
        else:
            print("FAILURE: Unexpected response for ORCID.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_oauth_endpoints()
