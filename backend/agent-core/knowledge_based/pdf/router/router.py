from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..embedding.embedding import embed_pdf
from db.qdrant.qdrant_client import upsert_embedding

router = APIRouter()


@router.post("/embedding")
async def pdf_embed(file: UploadFile = File(...)):
    try:
        file_name = file.filename
        pdf_bytes = await file.read()
        embed_result = embed_pdf(pdf_bytes)
        if embed_result.get("status") == "error":
            return {"status": "error", "message": embed_result["message"]}
        return {
            "status": "success",
            "message": "PDF embedded successfully",
            "chunks": embed_result["chunks"],
            "file_name": file_name,
            "pdf_id": embed_result["pdf_id"],
            "embeddings": embed_result["embeddings"],
            "total_chunks": embed_result["total_chunks"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/embedding/upsert")
async def pdf_embed_upsert(
    file: UploadFile = File(...),
    user_id: str = Form(...),
):
    try:
        pdf_bytes = await file.read()
        source_title = file.filename
        embed_result = embed_pdf(pdf_bytes)
        if embed_result.get("status") == "error":
            raise HTTPException(status_code=400, detail=embed_result.get("message", "Embed failed"))
        result = upsert_embedding(
            user_id=user_id,
            source_id=embed_result["pdf_id"],
            source_title=source_title,
            chunks=embed_result["chunks"],
            embeddings=embed_result["embeddings"],
            source_type="pdf",
        )
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message", "Upsert failed"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))