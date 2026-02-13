from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)

    return chunks


def embed_websiteText(website_data):


    if not website_data:
        return {
            "status": "error",
            "message": "No website data provided"
        }

    try:
        chunks = chunk_text(website_data)

        if not chunks:
            return {
                "status": "error",
                "message": "No chunks created from website data"
            }

        embeddings = []
        for chunk in chunks:
            embedding = model.encode(chunk)
            embeddings.append(embedding.tolist())

        return {
            "status": "success",
            "message": "Website embedded successfully",
            "chunks": chunks,
            "embeddings": embeddings,
            "total_chunks": len(chunks)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }