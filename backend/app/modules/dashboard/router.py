from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.modules.dashboard import service
from app.modules.dashboard.schemas import (
    DashboardSummary,
    RecentApplication,
    UpcomingInterview,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# ==========================
# DASHBOARD SUMMARY
# ==========================

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_dashboard_summary(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================
# RECENT APPLICATIONS
# ==========================

@router.get("/recent", response_model=list[RecentApplication])
def get_recent_applications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_recent_applications(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================
# UPCOMING INTERVIEWS
# ==========================

@router.get("/interviews", response_model=list[UpcomingInterview])
def get_upcoming_interviews(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_upcoming_interviews(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================
# STATUS COUNTS
# ==========================

@router.get("/status")
def get_status_counts(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_status_counts(
        db=db,
        user_id=current_user["user_id"]
    )