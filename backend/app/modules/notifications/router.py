from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user

from app.modules.notifications.schemas import NotificationResponse
from app.modules.notifications.service import (
    get_user_notifications,
    get_notification_by_id,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    get_notification_count,
    delete_notification
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ===========================
# Get All Notifications
# ===========================
@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_user_notifications(
        db,
        current_user["user_id"]
    )


# ===========================
# Notification Count
# ===========================
@router.get("/count")
def notification_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_notification_count(
        db,
        current_user["user_id"]
    )


# ===========================
# Mark All Read
# ===========================
@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return mark_all_notifications_as_read(
        db,
        current_user["user_id"]
    )


# ===========================
# Get Single Notification
# ===========================
@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_notification_by_id(
        db,
        notification_id,
        current_user["user_id"]
    )


# ===========================
# Mark One Notification Read
# ===========================
@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return mark_notification_as_read(
        db,
        notification_id,
        current_user["user_id"]
    )


# ===========================
# Delete Notification
# ===========================
@router.delete("/{notification_id}")
def delete(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return delete_notification(
        db,
        notification_id,
        current_user["user_id"]
    )