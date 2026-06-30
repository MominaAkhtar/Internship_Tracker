from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.notifications.models import Notification
from app.modules.notifications.schemas import NotificationCreate


def create_notification(
    db: Session,
    data: NotificationCreate
):
    """
    Create a new notification.
    This function will be called by other modules.
    """

    notification = Notification(
        user_id=data.user_id,
        application_id=data.application_id,
        title=data.title,
        message=data.message,
        notification_type=data.notification_type
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def get_user_notifications(db: Session, user_id: int):
    """
    Return all notifications for the current user.
    """

    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def get_notification_by_id(
    db: Session,
    notification_id: int,
    user_id: int
):
    """
    Return one notification if it belongs to the user.
    """

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )

    return notification


def mark_notification_as_read(
    db: Session,
    notification_id: int,
    user_id: int
):
    """
    Mark one notification as read.
    """

    notification = get_notification_by_id(
        db,
        notification_id,
        user_id
    )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


def mark_all_notifications_as_read(
    db: Session,
    user_id: int
):
    """
    Mark every notification as read.
    """

    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read."
    }


def get_notification_count(
    db: Session,
    user_id: int
):
    """
    Return total and unread notification counts.
    """

    total = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .count()
    )

    unread = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        .count()
    )

    return {
        "total": total,
        "unread": unread
    }


def delete_notification(
    db: Session,
    notification_id: int,
    user_id: int
):
    """
    Delete a notification.
    """

    notification = get_notification_by_id(
        db,
        notification_id,
        user_id
    )

    db.delete(notification)
    db.commit()

    return {
        "message": "Notification deleted successfully."
    }