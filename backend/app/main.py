from fastapi import FastAPI

from app.core.database import Base, engine
from app.models import user, application  # IMPORTANT: loads tables

from app.modules.applications.router import router as applications_router

app = FastAPI()

# create tables
Base.metadata.create_all(bind=engine)

# include routers
app.include_router(applications_router)


@app.get("/")
def root():
    return {"message": "Internship Tracker running"}