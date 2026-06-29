from fastapi import FastAPI

from app.modules.auth.routes import router as auth_router

app = FastAPI(title="Internship Tracker")

app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "API is running"}