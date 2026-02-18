import requests
import json
import subprocess
import os

def test_ssh_vc_endpoint():
    print("Testing SSH VC Endpoint...")
    url = "http://localhost:8001/vc/ssh"
    
    # 1. Generate a temporary SSH key
    key_file = "test_ssh_key"
    pub_key_file = f"{key_file}.pub"
    
    # Clean up previous runs
    if os.path.exists(key_file): os.remove(key_file)
    if os.path.exists(pub_key_file): os.remove(pub_key_file)
    
    try:
        # Generate key (ed25519) with empty passphrase
        subprocess.run(
            ["ssh-keygen", "-t", "ed25519", "-f", key_file, "-N", "", "-C", "oydid-user"],
            check=True,
            capture_output=True
        )
        
        with open(pub_key_file, "r") as f:
            public_key = f.read().strip()
            
        print(f"Generated Key: {public_key}")
        
        # 2. Sign the Subject DID
        subject_did = "did:oyd:1234567890" # Mock DID
        
        # To sign with ssh-keygen -Y sign, we need to pipe data in
        # Usage: ssh-keygen -Y sign -f key_file -n namespace file
        # We can use a temp file for data
        data_file = "data_to_sign"
        with open(data_file, "w") as f:
            f.write(subject_did)
            
        subprocess.run(
            ["ssh-keygen", "-Y", "sign", "-f", key_file, "-n", "oydid", data_file],
            check=True,
            capture_output=True
        )
        
        sig_file = f"{data_file}.sig"
        with open(sig_file, "r") as f:
            signature = f.read().strip()
            
        print(f"Signature generated.")
        
        # 3. Call API
        payload = {
            "public_key": public_key,
            "signature": signature,
            "subject_did": subject_did,
            "username": "oydid-user" # Must match -C or be acceptable principal? 
                # Actually ssh-keygen -Y sign uses the key comment or identity?
                # The verification checks against allowed_signers which maps PRINCIPAL to KEY.
                # In verification we say: verify this signature for PRINCIPAL using allowed_signers.
                # So we must pass the principal name we want to verify against, 
                # and allowed_signers must map that principal to the public key we pass.
        }
        
        response = requests.post(url, json=payload)
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS: VC Issued.")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"FAILURE: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Cleanup
        for f in [key_file, pub_key_file, "data_to_sign", "data_to_sign.sig"]:
            if os.path.exists(f): 
                os.remove(f)

if __name__ == "__main__":
    test_ssh_vc_endpoint()
