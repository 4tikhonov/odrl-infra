from fastapi import APIRouter, HTTPException
from ..models import GoogleVcRequest, SshVcRequest, GitHubVcRequest, OrcidVcRequest
from ..services.oydid import run_oydid_command
from ..services.issuer import get_issuer_did
import json
import subprocess
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/vc", tags=["Verifiable Credentials"])

@router.post("/google")
async def issue_google_vc(request: GoogleVcRequest):
    """Issue a VC for a Google Account"""
    issuer_did = get_issuer_did()
    if not issuer_did:
        raise HTTPException(status_code=500, detail="Issuer DID not initialized")

    # 1. Verify Google Token
    try:
        id_info = id_token.verify_oauth2_token(
            request.token, 
            google_requests.Request(), 
            clock_skew_in_seconds=10
        )
        email = id_info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Token does not contain email")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google Token: {str(e)}")

    # 2. Create VC Payload
    vc_payload = {
        "sub": request.subject_did,
        "vc": {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential", "EmailCredential"],
            "credentialSubject": {
                "id": request.subject_did,
                "email": email,
                "provider": "google"
            }
        }
    }
    
    # 3. Issue VC
    cmd = ["vc", "--issuer", issuer_did, "--json-output"]
    result = run_oydid_command(cmd, input_data=vc_payload["vc"])
    
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Failed to issue VC: {result.stderr}")
        
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"raw_output": result.stdout}

@router.post("/github")
async def issue_github_vc(request: GitHubVcRequest):
    """Issue a VC for a GitHub Account"""
    issuer_did = get_issuer_did()
    if not issuer_did:
        raise HTTPException(status_code=500, detail="Issuer DID not initialized")

    # 1. Verify GitHub Token
    try:
        headers = {"Authorization": f"Bearer {request.token}", "Accept": "application/vnd.github.v3+json"}
        response = requests.get("https://api.github.com/user", headers=headers)
        
        if response.status_code != 200:
             raise HTTPException(status_code=400, detail=f"Invalid GitHub Token: {response.text}")
        
        user_data = response.json()
        username = user_data.get("login")
        profile_url = user_data.get("html_url")
        
        if not username:
             raise HTTPException(status_code=400, detail="Could not retrieve GitHub username")

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"GitHub verification failed: {str(e)}")

    # 2. Create VC Payload
    vc_payload = {
        "sub": request.subject_did,
        "vc": {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential", "GitHubCredential"],
            "credentialSubject": {
                "id": request.subject_did,
                "username": username,
                "profile": profile_url,
                "provider": "github"
            }
        }
    }
    
    # 3. Issue VC
    cmd = ["vc", "--issuer", issuer_did, "--json-output"]
    result = run_oydid_command(cmd, input_data=vc_payload["vc"])
    
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Failed to issue VC: {result.stderr}")
        
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"raw_output": result.stdout}

@router.post("/orcid")
async def issue_orcid_vc(request: OrcidVcRequest):
    """Issue a VC for an ORCID iD"""
    issuer_did = get_issuer_did()
    if not issuer_did:
        raise HTTPException(status_code=500, detail="Issuer DID not initialized")

    # 1. Verify ORCID Token
    try:
        headers = {"Authorization": f"Bearer {request.token}", "Accept": "application/json"}
        url = f"https://pub.orcid.org/v3.0/{request.orcid}/record"
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
             raise HTTPException(status_code=400, detail=f"Invalid ORCID Token or ID: {response.text}")
        
        data = response.json()
        try:
            name = data.get("person", {}).get("name", {}).get("credit-name", {}).get("value")
        except:
            name = None
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"ORCID verification failed: {str(e)}")

    # 2. Create VC Payload
    vc_payload = {
        "sub": request.subject_did,
        "vc": {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential", "OrcidCredential"],
            "credentialSubject": {
                "id": request.subject_did,
                "orcid": request.orcid,
                "name": name,
                "provider": "orcid"
            }
        }
    }
    
    # 3. Issue VC
    cmd = ["vc", "--issuer", issuer_did, "--json-output"]
    result = run_oydid_command(cmd, input_data=vc_payload["vc"])
    
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Failed to issue VC: {result.stderr}")
        
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"raw_output": result.stdout}

@router.post("/ssh")
async def issue_ssh_vc(request: SshVcRequest):
    """Issue a VC for an SSH Key"""
    issuer_did = get_issuer_did()
    if not issuer_did:
        raise HTTPException(status_code=500, detail="Issuer DID not initialized")

    principal = request.username
    allowed_signers_content = f"{principal} {request.public_key}"
    
    try:
        import tempfile
        import os
        # Need to ensure temp files are cleaned up or use context managers carefully
        # In Docker /tmp is usually available
        
        with tempfile.NamedTemporaryFile(mode='w', prefix="allowed_") as f_allowed, \
             tempfile.NamedTemporaryFile(mode='w', prefix="sig_") as f_sig, \
             tempfile.NamedTemporaryFile(mode='w', prefix="data_") as f_data:
            
            f_allowed.write(allowed_signers_content)
            f_allowed.flush()
            
            f_sig.write(request.signature)
            f_sig.flush()
            
            f_data.write(request.subject_did)
            f_data.flush()
            
            cmd = [
                "ssh-keygen", "-Y", "verify",
                "-f", f_allowed.name,
                "-I", principal,
                "-n", "oydid",
                "-s", f_sig.name
            ]
            
            with open(f_data.name, 'r') as f_data_read:
                verify_proc = subprocess.run(
                    cmd,
                    stdin=f_data_read,
                    capture_output=True,
                    text=True
                )
            
            if verify_proc.returncode != 0:
                print(f"SSH Verify Error: {verify_proc.stderr}")
                raise HTTPException(status_code=400, detail=f"Signature verification failed: {verify_proc.stderr.strip()}")

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Verification process error: {str(e)}")

    vc_payload = {
        "sub": request.subject_did,
        "vc": {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential", "SshKeyCredential"],
            "credentialSubject": {
                "id": request.subject_did,
                "sshPublicKey": request.public_key
            }
        }
    }
    
    cmd = ["vc", "--issuer", issuer_did, "--json-output"]
    result = run_oydid_command(cmd, input_data=vc_payload["vc"])
    
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Failed to issue VC: {result.stderr}")
        
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"raw_output": result.stdout}
