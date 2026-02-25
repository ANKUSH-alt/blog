from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.session import init_db
from app.models.base_models import User, Blog, Quiz, ChatHistory, UserDashboard, ContactMessage, OTPRecord

from app.api import auth, blogs, ai, dashboard, contact

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Beanie with all document models
    await init_db([User, Blog, Quiz, ChatHistory, UserDashboard, ContactMessage, OTPRecord])
    yield
    # Cleanup if necessary

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads/profiles", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(blogs.router)
app.include_router(ai.router)
app.include_router(dashboard.router)
app.include_router(contact.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Era Academy API"}
