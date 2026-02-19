from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from ..models_oac import OacPolicyCreateRequest
import json
import uuid

router = APIRouter(prefix="/oac", tags=["ODRL Access Control Profile"])

# In-memory store for demo purposes (since we don't have a database)
# In a real app, this would persist to disk or DB
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from ..models_oac import OacPolicyCreateRequest
from ..services.oydid import run_oydid_command
from ..services.qdrant_service import qdrant_service
import json

router = APIRouter(prefix="/oac", tags=["ODRL Access Control Profile"])

@router.post("/policy")
async def create_oac_policy(policy: OacPolicyCreateRequest):
    """
    Create a new ODRL Access Control Policy (OAC) backed by a DID.
    The Policy content is stored as the DID Document (or payload).
    """
    try:
        # Prepare payload
        policy_dict = policy.dict(by_alias=True)
        
        # Use OYDID to create a DID with this policy as payload
        # Note: We ignore the incoming 'uid' if we seek to rely on the generated DID,
        # BUT ODRL requires the policy to contain its own UID.
        # Check if we can use the 'token' or just embed it.
        # For now, we register the policy content.
        
        result = run_oydid_command(["create", "--json-output"], input_data=policy_dict)
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"OYDID creation failed: {result.stderr}")
            
        did_data = json.loads(result.stdout)
        did = did_data.get("did")
        
        # We might want to update the policy to have the correct UID (the DID)
        # But OYDID 'create' hashes the content. If we change content, DID changes.
        # Circular dependency if UID is inside content.
        # ODRL implies UID is the ID of the policy.
        # If we accept the DID as the UID, we effectively say the Policy IS the DID Document.
        
        # For this implementation, we return the DID as the confirmed UID.
        # The stored payload will have the original UID (temporary), which might be mismatched.
        # Alternatively, we could do 2-step: create, get DID, update? No, that updates the log.
        
        # User instruction: "generate DID as for user".
        
        # Store in Qdrant
        try:
            qdrant_service.upsert_document(did, policy_dict)
        except Exception as e:
            print(f"Warning: Failed to store in Qdrant: {e}")
            
        return {
            "status": "created",
            "uid": did,
            "policy": did_data.get("doc", policy_dict)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/policy/{uid}")
async def get_oac_policy(uid: str):
    """Retrieve an OAC policy by its UID (which is a DID)."""
    # Use OYDID to read the DID
    result = run_oydid_command(["read", uid, "--json-output"])
    
    if result.returncode != 0:
        raise HTTPException(status_code=404, detail=f"Policy not found: {result.stderr}")
        
    try:
        did_doc = json.loads(result.stdout)
        # The policy is essentially the DID Document (or the payload within/mapped to it)
        # did_doc['doc'] usually contains the payload if it was created simply.
        return did_doc.get("doc", {})
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to decode OYDID response")

@router.get("/search")
async def search_oac_policies(q: str):
    """
    Search for OAC policies/DIDs in Qdrant based on keywords.
    Returns both DID and JSON-LD with similarity measure.
    """
    try:
        results = qdrant_service.search_documents(q)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
