from fastapi import APIRouter, UploadFile, File, HTTPException
from ..embedding.embedding import embed_pdf
router = APIRouter()

@router.post("/embedding")
async def PdfEmbedRequest(file: UploadFile = File(...)):
    try:
        file_name = file.filename
        pdf_bytes = await file.read()
        embed_result = embed_pdf(pdf_bytes)
        if embed_result.get("status") == "error":
            return {
                "status": "error",
                "message": embed_result["message"]
            }
        return {
            "status": "success",
            "message": "PDF embedded successfully",
            "chunks": embed_result["chunks"],
            "file_name": file_name,
            "embeddings": embed_result["embeddings"],
            "total_chunks": embed_result["total_chunks"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to embed PDF: {str(e)}")