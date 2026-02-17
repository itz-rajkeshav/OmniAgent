from qdrant_client import QdrantClient
import os

qdrant_url = os.getenv("Qdrant_APIURL")
qdrant_api_key = os.getenv("Qdrant_APIKEY")


client = QdrantClient(
    url=qdrant_url,
    api_key=qdrant_api_key,
)