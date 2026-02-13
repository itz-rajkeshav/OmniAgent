from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from knowledge_based.website.routes.route import router as website_router

app = FastAPI()


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