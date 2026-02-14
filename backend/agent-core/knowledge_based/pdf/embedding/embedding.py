import io
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader

model = SentenceTransformer("all-MiniLM-L6-v2")


def extract_pdf_text(pdf_bytes: bytes) -> str:
    stream = io.BytesIO(pdf_bytes)
    reader = PdfReader(stream)
    text = ""

    for page_num, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            text += f"\n--- Page {page_num + 1} ---\n"
            text += page_text

    return text

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)

    return chunks

def embed_pdf(pdf_bytes: bytes):
    text = extract_pdf_text(pdf_bytes)
    chunks = chunk_text(text)
    embeddings = []
    for chunk in chunks:
        embedding = model.encode(chunk)
        embeddings.append(embedding.tolist())

    return {
        "status":"success",
        "message":"PDF embedded successfully",
        "chunks":chunks,
        "embeddings":embeddings,
        "total_chunks":len(chunks),
    }
