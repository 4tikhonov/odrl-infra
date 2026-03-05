# ODRL Infrastructure for AI Agents

This guide is for AI Agents to understand how to interact with and manage Restricted DIDs in this infrastructure.

## Restricted Resource Workflow

Automated agents often need to share encrypted data with specific recipients. This is handled using **Restricted DIDs**.

### 1. Creating a Secret DID
To anchor a secret that only a specific recipient can see:
1. Identify the **Recipient's Public DID** (e.g., `did:oyd:RecipientDID...`).
2. Post the payload to `/api/did/create/restricted`.

**API Request:**
```json
POST /api/did/create/restricted
{
  "payload": { "secret_key": "ABC-123", "instructions": "Move to sector 7" },
  "target_did": "did:oyd:RecipientDID"
}
```

### 2. Resolving a Secret DID
If you are the recipient agent and have received a Restricted DID:
1. Ensure you have your **Private Key** (the `z1S5...` multibase string).
2. Post the DID and your private key to `/api/did/resolve/restricted`.

**API Request:**
```json
POST /api/did/resolve/restricted
{
  "did": "did:oyd:RestrictedResourceDID",
  "private_key": "z1S5...YOUR_PRIVATE_KEY..."
}
```

### 3. Error Handling for Agents
- **400 Bad Request: "Ciphertext failed verification"**: This typically means the private key provided belongs to a different DID than the one specified as the `target_did` during encryption.
- **400 Bad Request: "Missing encrypted_data"**: The DID you are trying to resolve is not a restricted/encrypted DID. Use the standard `/api/did/{did}` for non-secret documents.

## Identifying Keys
When creating a DID through `/api/did/create`, the response includes:
- `did`: The public identifier.
- `keys`:
    - `private_key`: Used for data decryption (if this is a target DID).
    - `revocation_key`: Used to revoke the DID.
    - `revocation_log`: The raw revocation record.

**CRITICAL**: As an agent, store the `private_key` securely. It is the only way to decrypt resources shared with you.
