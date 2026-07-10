from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.modules.auth.router import router as auth_router
from app.modules.applications.router import router as applications_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.activity.router import router as activity_router
from app.modules.notifications.router import router as notification_router
from app.modules.career_insights.router import router as career_insights_router

app = FastAPI(title="Internship Tracker")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(applications_router)
app.include_router(dashboard_router)
app.include_router(activity_router)
app.include_router(notification_router)
app.include_router(career_insights_router)

# Ensure uploads directories exist
os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("uploads/resumes", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
def root():
    return {"message": "API is running"}