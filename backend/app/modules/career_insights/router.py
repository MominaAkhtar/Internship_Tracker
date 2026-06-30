from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.modules.career_insights import service
from app.modules.career_insights.schemas import (
    CareerOverview,
    StatusAnalysis,
    CompanyAnalysis,
    ResponseTimeAnalysis,
    MonthlyTrendAnalysis,
    WeeklyConsistencyAnalysis,
)

router = APIRouter(
    prefix="/career-insights",
    tags=["Career Insights"]
)


# ==========================================
# FEATURE 1 - CAREER OVERVIEW
# ==========================================

@router.get("/overview", response_model=CareerOverview)
def get_career_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_career_overview(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================================
# FEATURE 2 - STATUS ANALYSIS
# ==========================================

@router.get("/status-analysis", response_model=StatusAnalysis)
def get_status_analysis(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_status_analysis(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================================
# FEATURE 3 - COMPANY SUCCESS ANALYSIS
# ==========================================

@router.get("/company-analysis", response_model=CompanyAnalysis)
def get_company_analysis(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_company_analysis(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================================
# FEATURE 4 - RESPONSE TIME ANALYSIS
# ==========================================

@router.get("/response-time", response_model=ResponseTimeAnalysis)
def get_response_time_analysis(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_response_time_analysis(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================================
# FEATURE 5 - MONTHLY TRENDS
# ==========================================

@router.get("/monthly-trends", response_model=MonthlyTrendAnalysis)
def get_monthly_trends(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_monthly_trends(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================================
# FEATURE 6 - APPLICATION CONSISTENCY
# ==========================================

@router.get("/weekly-consistency", response_model=WeeklyConsistencyAnalysis)
def get_weekly_consistency(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_weekly_consistency(
        db=db,
        user_id=current_user["user_id"]
    )