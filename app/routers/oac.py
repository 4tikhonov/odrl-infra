from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from ..models_oac import OacPolicyCreateRequest
import json
import uuid

router = APIRouter(prefix="/oac", tags=["ODRL Access Control Profile"])

# In-memory store for demo purposes (since we don't have a database)
# In a real app, this would persist to disk or DB
oac_policies = {}

@router.post("/policy")
async def create_oac_policy(policy: OacPolicyCreateRequest):
    """
    Create a new ODRL Access Control Policy (OAC).
    
    Accepts OAC policy definitions: Preference, Requirement, Offer, Request, Agreement.
    Examples in spec: https://besteves4.github.io/odrl-access-control-profile/oac.html#examples
    """
    try:
        # Since we use Aliases for JSON-LD properties (e.g., @context, odrl:uid), 
        # Pydantic handles validation.
        
        # We can perform additional/semantic validation here if needed.
        
        # Store policy
        # If uid is not unique, we overwrite or error? Let's error.
        uid = policy.uid
        if uid in oac_policies:
             raise HTTPException(status_code=409, detail=f"Policy with UID {uid} already exists.")
             
        oac_policies[uid] = policy.dict(by_alias=True)
        
        return {
            "status": "created",
            "uid": uid,
            "policy": oac_policies[uid]
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/policy/{uid}")
async def get_oac_policy(uid: str):
    """Retrieve an OAC policy by its UID."""
    if uid not in oac_policies:
        raise HTTPException(status_code=404, detail="Policy not found")
    return oac_policies[uid]
