from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .connectDB import get_db
from .crud.userSource_crud import get_user_sources, delete_user_source

router = APIRouter()


class DeleteUserSourceRequest(BaseModel):
    user_id: str
    source_id: str
    source_title: str


@router.get("/get-userSource")
async def get_user_source(user_id: str, db: Session = Depends(get_db)):
    try:
        sources = get_user_sources(db, user_id)
        return {
            "status": "success",
            "sources": [
                {
                    "id": source.id,
                    "user_id": source.user_id,
                    "source_id": source.source_id,
                    "source_type": source.source_type,
                    "source_title": source.source_title,
                    "created_at": source.created_at.isoformat() if source.created_at else None,
                    "updated_at": source.updated_at.isoformat() if source.updated_at else None,
                }
                for source in sources
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete-userSource")
async def delete_user_source_route(request: DeleteUserSourceRequest, db: Session = Depends(get_db)):
    try:
        deleted = delete_user_source(
            db=db,
            user_id=request.user_id,
            source_id=request.source_id,
            source_title=request.source_title,
        )
        if not deleted:
            raise HTTPException(status_code=404, detail="Source not found")
        return {"status": "success", "message": "Source deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))