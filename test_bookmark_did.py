import requests
import json

BASE_URL = "http://localhost:8001"
TEST_URL = "http://example.com"

def test_bookmark_did():
    print("--- Testing Bookmark DID Methods ---")
    
    # 1. Create DID from URL
    print(f"\n[GET] /did/create_from_url?url={TEST_URL}")
    try:
        resp = requests.get(f"{BASE_URL}/did/create_from_url", params={"url": TEST_URL})
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            did = data.get("did")
            stored_payload = data.get("stored_payload")
            print(f"SUCCESS: Created DID: {did}")
            print(f"Payload: {json.dumps(stored_payload, indent=2)}")
            
            if stored_payload.get("url") == TEST_URL and "Example Domain" in stored_payload.get("title"):
                print("VALIDATION: URL and Title match.")
            else:
                print("FAILURE: Payload content mismatch.")
        else:
            print(f"FAILURE: {resp.text}")
            return
    except Exception as e:
        print(f"ERROR: {e}")
        return

    # 2. Create DID with Token (Valid)
    print(f"\n[GET] /did/create_from_url?url={TEST_URL}&token=did:oyd:123")
    try:
        resp = requests.get(f"{BASE_URL}/did/create_from_url", params={"url": TEST_URL, "token": "did:oyd:123"})
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            stored = data.get("stored_payload")
            if stored.get("token") == "did:oyd:123":
                print("VALIDATION: Token stored correctly.")
            else:
                print("FAILURE: Token missing or incorrect.")
        else:
             print(f"FAILURE: {resp.text}")
    except Exception as e:
        print(f"ERROR: {e}")

    # 3. Create DID with Invalid Token
    print(f"\n[GET] /did/create_from_url?url={TEST_URL}&token=invalid")
    try:
        resp = requests.get(f"{BASE_URL}/did/create_from_url", params={"url": TEST_URL, "token": "invalid"})
        print(f"Status: {resp.status_code}")
        if resp.status_code == 400:
             print("VALIDATION: Caught invalid token.")
        else:
             print(f"FAILURE: Should have failed 400, got {resp.status_code}")
    except Exception as e:
        print(f"ERROR: {e}")

    # 4. Share DID with Parameters
    # We use the did from first step
    print(f"\n[GET] /did/share/{did}?language=en&token=did:oyd:123")
    try:
        resp = requests.get(f"{BASE_URL}/did/share/{did}", params={"language": "en", "token": "did:oyd:123"})
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
             print("SUCCESS: Share endpoint accepts new parameters.")
        else:
             print(f"FAILURE: {resp.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_bookmark_did()
