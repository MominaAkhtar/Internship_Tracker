from fastapi import FastAPI
from app.core.database import Base, engine
from app.models import application  # important: registers model

app = FastAPI()



@app.get("/")
def root():
    return {"message": "Internship Tracker running 🚀"}