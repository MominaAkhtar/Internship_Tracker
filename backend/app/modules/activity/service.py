from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.modules.activity.schemas import ActivityLogCreate


def create_activity_log(db: Session, data: ActivityLogCreate):
    """
    Create a new activity log entry.
    This function will be called by other modules
    (Applications, Notifications, etc.)
    """

    log = ActivityLog(
        user_id=data.user_id,
        application_id=data.application_id,
        action_type=data.action_type,
        old_value=data.old_value,
        new_value=data.new_value,
        description=data.description,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def get_user_activity_logs(db: Session, user_id: int):
    """
    Return all activity logs belonging to a user.
    """

    return (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .all()
    )


def get_activity_log_by_id(db: Session, log_id: int, user_id: int):
    """
    Return a single activity log if it belongs to the user.
    """

    return (
        db.query(ActivityLog)
        .filter(
            ActivityLog.id == log_id,
            ActivityLog.user_id == user_id
        )
        .first()
    )