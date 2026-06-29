from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ApplicationCreate(BaseModel):
    company_name: str
    position: str
    status: Optional[str] = "Applied"
    notes: Optional[str] = None
    resume_version: Optional[str] = None
    interview_date: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    id: int
    company_name: str
    position: str
    status: str
    notes: Optional[str] = None
    resume_version: Optional[str] = None
    interview_date: Optional[datetime] = None

    class Config:
        from_attributes = True