from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.modules.notifications.models import NotificationType


class NotificationCreate(BaseModel):
    user_id: int
    application_id: Optional[int] = None

    title: str
    message: str

    notification_type: NotificationType


class NotificationResponse(BaseModel):
    id: int

    user_id: int
    application_id: Optional[int]

    title: str
    message: str

    notification_type: NotificationType

    is_read: bool

    created_at: datetime

    class Config:
        from_attributes = True