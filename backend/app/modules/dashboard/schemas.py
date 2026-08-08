from pydantic import BaseModel
from datetime import datetime


class DashboardSummary(BaseModel):
    total_applications: int
    applied: int
    interview: int
    offer: int
    rejected: int
    upcoming_interviews: int


class RecentApplication(BaseModel):
    company_name: str
    position: str
    status: str
    created_at: datetime

class UpcomingInterview(BaseModel):
    company_name: str
    position: str
    status: str
    interview_date: datetime

    class Config:
        from_attributes = True    

    class Config:
        from_attributes = True