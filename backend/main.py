from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from auth import check_auth_config

from fastapi import FastAPI

from database import init_database
from routers.profile import router as profile_router
from routers.experience import router as experience_router
from routers.project import router as project_router
from routers.auth import router as auth_router
from routers.media import router as media_router

from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    check_auth_config()
    await init_database()
    yield


app = FastAPI(
    title="Portfolio API",
    lifespan=lifespan
)

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Portfolio API is running"
    }


app.include_router(auth_router)
app.include_router(media_router)
app.include_router(profile_router)
app.include_router(experience_router)
app.include_router(project_router)