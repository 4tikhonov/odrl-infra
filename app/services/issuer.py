import os
import json
import subprocess

ISSUER_DID_FILE = "issuer_did.json"

_issuer_did = None

def get_issuer_did():
    global _issuer_did
    if _issuer_did:
        return _issuer_did
        
    if os.path.exists(ISSUER_DID_FILE):
        with open(ISSUER_DID_FILE, "r") as f:
            data = json.load(f)
            _issuer_did = data["did"]
            print(f"Loaded Issuer DID: {_issuer_did}")
    else:
        print("Creating Issuer DID...", flush=True)
        # Initialize with a basic DID
        create_proc = subprocess.run(
            ["oydid", "create", "--json-output"], 
            input='{"type": "Issuer"}', 
            capture_output=True, 
            text=True
        )
        if create_proc.returncode == 0:
            try:
                data = json.loads(create_proc.stdout)
                _issuer_did = data["did"]
                # Save DID info
                with open(ISSUER_DID_FILE, "w") as f:
                    json.dump(data, f)
                print(f"Created Issuer DID: {_issuer_did}", flush=True)
            except Exception as e:
                print(f"Failed to parse issuer creation: {e}")
        else:
            print(f"Failed to create issuer DID: {create_proc.stderr}")
            
    return _issuer_did
