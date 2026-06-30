from fastapi import FastAPI

from app.modules.auth.router import router as auth_router
from app.modules.applications.router import router as applications_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.activity.router import router as activity_router

app = FastAPI(title="Internship Tracker")

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(applications_router, prefix="/applications", tags=["Applications"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(activity_router)


@app.get("/")
def root():
    return {"message": "API is running"}