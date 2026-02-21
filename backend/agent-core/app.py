from contextlib import asynccontextmanager
import asyncio
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from knowledge_based.website.routes.route import router as website_router
from db.supabase.connectDB import init_db
from knowledge_based.pdf.router.router import router as pdf_router
from rpc.server import serve as grpc_serve, stop as grpc_stop

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()

    loop = asyncio.get_running_loop()
    try:
        grpc_server = await loop.run_in_executor(None, grpc_serve)
        logger.info("gRPC server started on port 50051 alongside agent-core")
    except Exception as e:
        logger.exception("Failed to start gRPC server: %s", e)
        raise

    yield

    await loop.run_in_executor(None, grpc_stop, grpc_server)
    logger.info("gRPC server stopped")


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