from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from knowledge_based.website.routes.route import router as website_router
from db.supabase.connectDB import init_db
from knowledge_based.pdf.router.router import router as pdf_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "yep agent-core server running boi :)"}


app.include_router(website_router, prefix="/website")
app.include_router(pdf_router, prefix="/pdf")