import os
import json
from qdrant_client import QdrantClient
from qdrant_client.http import models
from fastembed import TextEmbedding
from typing import List, Dict, Any

class QdrantService:
    def __init__(self):
        self.qdrant_host = os.getenv("QDRANT_HOST", "localhost")
        self.qdrant_port = int(os.getenv("QDRANT_PORT", 6333))
        self.collection_name = "dids"
        self.client = QdrantClient(host=self.qdrant_host, port=self.qdrant_port)
        self.encoder = TextEmbedding()
        self._ensure_collection()

    def _ensure_collection(self):
        try:
            self.client.get_collection(self.collection_name)
        except Exception:
            # Create collection if it doesn't exist
            # Get embedding dimension
            example_embedding = list(self.encoder.embed(["test"]))[0]
            dimension = len(example_embedding)
            
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=dimension,
                    distance=models.Distance.COSINE
                )
            )
            print(f"Created Qdrant collection: {self.collection_name}")

    def upsert_document(self, did: str, payload: Dict[str, Any]):
        # Convert payload to a text string for embedding
        # We'll use a simple approach: stringify the JSON
        # For better results, we could extract specific fields like 'name', 'description'
        
        text_content = self._extract_text_content(payload)
        embeddings = list(self.encoder.embed([text_content]))[0]
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=self._did_to_id(did),
                    vector=embeddings.tolist(),
                    payload={
                        "did": did,
                        "json_ld": payload,
                        "text": text_content
                    }
                )
            ]
        )
        print(f"Upserted DID {did} to Qdrant")

    def search_documents(self, query_text: str, limit: int = 5) -> List[Dict[str, Any]]:
        try:
            query_vector = list(self.encoder.embed([query_text]))[0]
            
            # Use query_points which is the modern and more robust API
            search_result = self.client.query_points(
                collection_name=self.collection_name,
                query=query_vector.tolist(),
                limit=limit,
                with_payload=True
            ).points
            
            results = []
            for hit in search_result:
                results.append({
                    "did": hit.payload.get("did"),
                    "json_ld": hit.payload.get("json_ld"),
                    "score": hit.score
                })
            return results
        except AttributeError as e:
            # Diagnostic logging
            print(f"ERROR: QdrantClient missing attribute. Available attributes: {dir(self.client)}")
            # Fallback to search if query_points is somehow missing (unlikely but safe)
            if hasattr(self.client, "search"):
                search_result = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_vector.tolist(),
                    limit=limit,
                    with_payload=True
                )
                results = []
                for hit in search_result:
                    results.append({
                        "did": hit.payload.get("did"),
                        "json_ld": hit.payload.get("json_ld"),
                        "score": hit.score
                    })
                return results
            raise e

    def _extract_text_content(self, payload: Dict[str, Any]) -> str:
        # Extract meaningful text from the payload for embedding
        # This handles the example structure provided by the user
        parts = []
        if "name" in payload:
            parts.append(payload["name"])
        if "description" in payload:
            parts.append(payload["description"])
        if "type" in payload:
            parts.append(payload["type"])
        
        # Add nested unit info if present
        unit = payload.get("unit")
        if unit and isinstance(unit, dict):
            if "name" in unit:
                parts.append(f"unit: {unit['name']}")
            if "symbol" in unit:
                parts.append(f"symbol: {unit['symbol']}")
            if "description" in unit:
                parts.append(unit["description"])

        if not parts:
            # Fallback to full JSON string if no specific fields found
            return json.dumps(payload)
        
        return " ".join(parts)

    def _did_to_id(self, did: str) -> str:
        # Qdrant IDs can be UUIDs or integers. 
        # Since DID strings can be long, let's use a hash as a simple unique ID or just use a UUID generator seeded by DID.
        import hashlib
        import uuid
        hash_val = hashlib.md5(did.encode()).hexdigest()
        return str(uuid.UUID(hash_val))

# Global instance
qdrant_service = QdrantService()
