"""
Qdrant semantic search for RAG: encode query with same model as ingestion, filter by user_id, return top-k chunks.
"""
import logging
from sentence_transformers import SentenceTransformer

from db.qdrant.connectDB import client as qdrant_client
from db.qdrant.qdrant_client import (
    collection_name,
    ensure_payload_indexes,
    get_user_all_sources,
)
from qdrant_client.models import Filter, FieldCondition, MatchValue

logger = logging.getLogger(__name__)

# Same model as knowledge_based/pdf/embedding/embedding.py and website embedding
_EMBEDDING_MODEL = "all-MiniLM-L6-v2"
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(_EMBEDDING_MODEL)
    return _model


def search_knowledge(user_id: str, query_text: str, top_k: int = 5) -> list[str]:
    """
    Search the user's knowledge base for chunks relevant to query_text.
    Returns a list of text chunks (strings). Returns [] if user has no sources, collection missing, or on error.
    """
    if not user_id or not query_text or not query_text.strip():
        return []

    try:
        sources = get_user_all_sources(user_id)
        if not sources:
            return []

        collections = qdrant_client.get_collections().collections
        if not any(c.name == collection_name for c in collections):
            return []

        ensure_payload_indexes()
        model = _get_model()
        query_vector = model.encode(query_text.strip()).tolist()

        hits = qdrant_client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            query_filter=Filter(
                must=[
                    FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                ]
            ),
            limit=top_k,
        )

        chunks = []
        for h in hits:
            if h.payload and "text" in h.payload:
                chunks.append(str(h.payload["text"]).strip())
        return chunks
    except Exception as e:
        logger.exception("Knowledge search failed for user_id=%s: %s", user_id, e)
        return []
