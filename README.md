# ODRL Infrastructure (DID-based)

This repository implements a **DID-based Open Digital Resource Language (ODRL)** infrastructure. It leverages **Decentralized Identifiers (DIDs)** and **Verifiable Credentials (VCs)** to create, sign, and verify digital policies and access rights.

Built with **FastAPI** and **Docker**, utilizing [OYDID](https://github.com/OwnYourData/oydid) for the underlying DID operations.

## Features

### 1. ODRL Access Control
Implements the ODRL Information Model using DIDs for identity and VCs for attributes.
-   **Universal Identity**: Assigners, Assignees, and Assets are identified by DIDs.
-   **Policy Management**: Create and store ODRL policies (Offers, Agreements, Privacy Policies, Requests).
-   **Verification**: Cryptographically verify that a requestor meets the requirements of a policy using Verifiable Credentials.

### 2. Verifiable Credentials (VCs)
Issue and verify credentials to prove identity and attributes for ODRL policies.
-   **Google Account**: Prove ownership of a Google email.
-   **GitHub Account**: Prove ownership of a GitHub handle.
-   **SSH Keys**: Link an SSH public key to a DID.
-   **ORCID**: Link an ORCID iD to a DID.

### 3. DID Management
Full lifecycle management for OYDID (Listen-to-Yourself) DIDs.
-   **CRUD**: Create, Read, Update, Revoke DIDs.
-   **Bookmarks**: Create DIDs from URLs (with RDF Turtle support for Semantic Web resources).
-   **Resolution**: Resolve DIDs to retrieve documents and metadata.

## API Documentation

The API provides the following endpoints. You can also view interactive documentation at `/docs` when running the service.

### 1. ODRL Access Control (`/oac`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/oac/policy` | **Create ODRL Policy**. Accepts ODRL policies (Offer, Agreement, Request) in JSON-LD format. |
| `GET` | `/oac/policy/{uid}` | **Get ODRL Policy**. Retrieves a previously stored policy by its `odrl:uid`. |

### 2. Verifiable Credentials (`/vc`)

Issue W3C Verifiable Credentials to prove identity or properties.

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/vc/google` | **Google Account VC**. Proves ownership of a Google email. | `{"token": "id_token", "subject_did": "did:oyd:..."}` |
| `POST` | `/vc/github` | **GitHub Account VC**. Proves ownership of a GitHub username. | `{"token": "access_token", "subject_did": "did:oyd:..."}` |
| `POST` | `/vc/orcid` | **ORCID VC**. Proves ownership of an ORCID iD. | `{"token": "access_token", "orcid": "...", "subject_did": "did:oyd:..."}` |
| `POST` | `/vc/ssh` | **SSH Key VC**. Links an SSH public key to a DID. | `{"username": "...", "public_key": "...", "signature": "...", "subject_did": "..."}` |

### 3. DID Operations (`/did`)

Manage the lifecycle of OYDID Data Resources.

| Method | Endpoint | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/did/create` | **Create DID**. Creates a new DID with a given JSON payload. | Body: `{"payload": {...}, "options": {...}}` |
| `GET` | `/did/create_from_url` | **Bookmark DID**. Creates a DID from a URL, extracting title and metadata. | `?url=...` (Supports `.ttl` for RDF) |
| `GET` | `/did/share/{did}` | **Resolve/Share**. Resolves a DID and returns its payload (e.g., bookmark data). | `?language=fr` (or `did:oyd:...@fr`) |
| `GET` | `/did/{did}` | **Read DID**. Resolves the full DID Document. | Path: `did` |
| `POST` | `/did/update` | **Update DID**. Updates the payload of an existing DID. | Body: `{"did": "...", "payload": {...}}` |
| `DELETE` | `/did/revoke/{did}` | **Revoke DID**. Revokes a DID, making it invalid. | Path: `did` |

### 4. Utilities

-   `GET /health`: Service health check.

## Getting Started

### Prerequisites
-   Docker & Docker Compose
-   Git

### Running the Service
1.  **Clone the repository** (ensure submodules are initialized):
    ```bash
    git clone --recurse-submodules https://github.com/4tikhonov/odrl-infra.git
    cd odrl-infra
    ```
    *If you already cloned without submodules:*
    ```bash
    git submodule update --init --recursive
    ```

2.  **Build and Run**:
    ```bash
    docker-compose up --build
    ```

The API will be available at `http://localhost:8001`.
Interactive documentation and testing (Swagger UI): `http://localhost:8001/docs`.

## Architecture
-   **FastAPI**: Provides the REST API layer.
-   **OYDID**: Submodule handling all core DID and VC operations.
-   **Docker**: Encapsulates the runtime environment (Python + Ruby for OYDID CLI).
