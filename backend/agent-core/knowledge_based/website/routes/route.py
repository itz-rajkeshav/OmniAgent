from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..crawl.crawl import crawl_website
from ..embedding.embed import embed_websiteText
from urllib.parse import urlparse
router = APIRouter()

class WebsiteEmbedRequest(BaseModel):
    url: str


class CrawlRequest(BaseModel):
    url: str
    max_pages: int = 5

# later convert the route into the /embedding/upsert
@router.post("/embedding")
async def embed_website(request: WebsiteEmbedRequest):
    website_text = ""
    try:
        results = crawl_website(request.url)
        title = results[0].get("title") if results else None

        for page in results:
            if page.get("text"):
                website_text += page["text"] + "\n\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to crawl website: {str(e)}")

    if not website_text.strip():
        raise HTTPException(status_code=422, detail="No text extracted from the website")

    try:
        embed_result = embed_websiteText(website_text)
        if embed_result.get("status") == "error":
            return {
                "status": "error",
                "message": embed_result["message"]
            }
        return {
            "status": "success",
            "message": "Website embedded successfully",
            "title": title,
            "chunks": embed_result["chunks"],
            "embeddings": embed_result["embeddings"],
            "total_chunks": embed_result["total_chunks"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to embed website: {str(e)}")


@router.post("/crawl")
async def crawl_only(request: CrawlRequest):
    try:
        results = crawl_website(request.url, max_pages=request.max_pages)
        return {
            "status": "success",
            "pages": len(results),
            "results": [
                {"url": r["url"], "title": r.get("title"), "text_preview": (r.get("text") or "")[:500]}
                for r in results
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crawl failed: {str(e)}")


    