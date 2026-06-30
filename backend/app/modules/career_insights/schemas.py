from pydantic import BaseModel


# ==========================
# FEATURE 1 - Career Overview
# ==========================

class CareerOverview(BaseModel):
    total_applications: int
    total_interviews: int
    total_offers: int
    total_rejections: int

    success_rate: float

    most_common_status: str | None
    most_active_month: str | None

    average_response_time: float | None


# ==========================
# FEATURE 2 - Status Analysis
# ==========================

class StatusCount(BaseModel):
    status: str
    count: int


class StatusAnalysis(BaseModel):
    statuses: list[StatusCount]
    recommendation: str


# ==========================
# FEATURE 3 - Company Analysis
# ==========================

class CompanyPerformance(BaseModel):
    company_name: str
    applications: int
    interviews: int
    offers: int


class CompanyAnalysis(BaseModel):
    companies: list[CompanyPerformance]
    recommendation: str


# ==========================
# FEATURE 4 - Response Time Analysis
# ==========================

class ResponseTimeAnalysis(BaseModel):
    average_interview_response: float | None
    average_offer_response: float | None
    average_rejection_response: float | None

    recommendation: str


# ==========================
# FEATURE 5 - Monthly Trends
# ==========================

class MonthlyTrend(BaseModel):
    month: str
    applications: int


class MonthlyTrendAnalysis(BaseModel):
    trends: list[MonthlyTrend]
    recommendation: str


# ==========================
# FEATURE 6 - Weekly Consistency
# ==========================

class WeeklyApplicationCount(BaseModel):
    week: str
    applications: int


class WeeklyConsistencyAnalysis(BaseModel):
    weeks: list[WeeklyApplicationCount]
    recommendation: str