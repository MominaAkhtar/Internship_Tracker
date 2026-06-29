from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ApplicationCreate(BaseModel):
    company_name: str
    position: str
    status: str = "Applied"
    notes: Optional[str] = None
    resume_version: Optional[str] = None
    interview_date: Optional[datetime] = None