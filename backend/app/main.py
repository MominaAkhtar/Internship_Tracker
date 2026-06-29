from fastapi import FastAPI

from app.modules.auth.routes import router as auth_router
from app.modules.applications.router import router as applications_router

app = FastAPI(title="Internship Tracker")

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(applications_router, prefix="/applications", tags=["Applications"])


@app.get("/")
def root():
    return {"message": "API is running"}