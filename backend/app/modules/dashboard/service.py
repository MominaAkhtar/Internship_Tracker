from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.applications.models import Application
from app.modules.dashboard.schemas import (
    DashboardSummary,
)


def get_dashboard_summary(db: Session, user_id: int):
    total = db.query(func.count(Application.id)).filter(
        Application.user_id == user_id
    ).scalar()

    applied = db.query(func.count(Application.id)).filter(
        Application.user_id == user_id,
        Application.status == "Applied"
    ).scalar()

    interview = db.query(func.count(Application.id)).filter(
        Application.user_id == user_id,
        Application.status == "Interview"
    ).scalar()

    offer = db.query(func.count(Application.id)).filter(
        Application.user_id == user_id,
        Application.status == "Offer"
    ).scalar()

    rejected = db.query(func.count(Application.id)).filter(
        Application.user_id == user_id,
        Application.status == "Rejected"
    ).scalar()

    upcoming_interviews = db.query(func.count(Application.id)).filter(
        Application.user_id == user_id,
        Application.interview_date != None,
        Application.interview_date >= datetime.utcnow()
    ).scalar()

    return DashboardSummary(
        total_applications=total,
        applied=applied,
        interview=interview,
        offer=offer,
        rejected=rejected,
        upcoming_interviews=upcoming_interviews
    )


def get_recent_applications(db: Session, user_id: int):
    return (
        db.query(Application)
        .filter(Application.user_id == user_id)
        .order_by(Application.created_at.desc())
        .limit(5)
        .all()
    )


def get_upcoming_interviews(db: Session, user_id: int):
    return (
        db.query(Application)
        .filter(
            Application.user_id == user_id,
            Application.interview_date != None,
            Application.interview_date >= datetime.utcnow()
        )
        .order_by(Application.interview_date.asc())
        .all()
    )


def get_status_counts(db: Session, user_id: int):
    statuses = (
        db.query(
            Application.status,
            func.count(Application.id)
        )
        .filter(
            Application.user_id == user_id
        )
        .group_by(Application.status)
        .all()
    )

    result = {}

    for status, count in statuses:
        result[status] = count

    return result