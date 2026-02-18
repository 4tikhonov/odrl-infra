from pydantic import BaseModel
from typing import Dict, Any, Optional

class DidCreateRequest(BaseModel):
    payload: Dict[str, Any]

class DidUpdateRequest(BaseModel):
    did: str
    payload: Dict[str, Any]

class GoogleVcRequest(BaseModel):
    token: str
    subject_did: str

class SshVcRequest(BaseModel):
    public_key: str
    signature: str
    subject_did: str
    username: Optional[str] = "oydid-user" # Principal for ssh-keygen -I

class GitHubVcRequest(BaseModel):
    token: str
    subject_did: str

class OrcidVcRequest(BaseModel):
    token: str
    orcid: str
    subject_did: str
