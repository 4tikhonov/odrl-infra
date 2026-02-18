from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Union, Literal, Dict, Any

# Enums and Constants
OAC_CONTEXT = "https://w3id.org/oac/context.json" # Placeholder context
ODRL_CONTEXT = "http://www.w3.org/ns/odrl.jsonld"

# Base Classes
class OacBaseModel(BaseModel):
    pass

# Constraints
class OacConstraint(OacBaseModel):
    leftOperand: str = Field(..., description="The left operand of the constraint (e.g., oac:Purpose)")
    operator: str = Field(..., description="The operator (e.g., odrl:isA, odrl:eq)")
    rightOperand: Union[str, List[str]] = Field(..., description="The right operand (e.g., dpv:ResearchAndDevelopment)")
    title: Optional[str] = None
    
# Permissions
class OacPermission(OacBaseModel):
    assigner: Optional[str] = Field(None, description="The entity assigning the permission")
    assignee: Optional[str] = Field(None, description="The entity receiving the permission")
    target: str = Field(..., description="The target asset (e.g., oac:Behavioral)")
    action: str = Field(..., description="The action allowed (e.g., oac:Read)")
    constraint: Optional[List[OacConstraint]] = Field(None, description="Constraints on the permission")
    hasContext: Optional[str] = Field(None, description="DPV context (e.g., dpv:Optional)")

# Policies
class OacPolicy(OacBaseModel):
    context: Union[str, List[str]] = Field(default=[ODRL_CONTEXT], alias="@context")
    type: str = Field(..., description="Type of policy: Preference, Requirement, Offer, Request, Agreement")
    uid: str = Field(..., alias="did:oyd", description="Unique identifier for the policy")
    profile: Optional[str] = Field(default="oac:", alias="odrl:profile")
    description: Optional[str] = Field(None, alias="dcterms:description")
    creator: Optional[str] = Field(None, alias="dcterms:creator")
    issued: Optional[str] = Field(None, alias="dcterms:issued")
    permission: List[OacPermission] = Field(..., alias="odrl:permission")
    source: Optional[Union[str, List[str]]] = Field(None, alias="dcterms:source")

    class Config:
        populate_by_name = True

# Specific Requests for Validation (simplified wrapper if needed, but OacPolicy handles the JSON-LD structure)
class OacPolicyCreateRequest(OacPolicy):
    pass
