from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Boolean,
    Enum
)
from datetime import datetime
import enum

from app.core.database import Base


class NotificationType(str, enum.Enum):
    APPLICATION_ADDED = "APPLICATION_ADDED"
    APPLICATION_UPDATED = "APPLICATION_UPDATED"
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED"
    INTERVIEW_REMINDER = "INTERVIEW_REMINDER"
    OFFER_RECEIVED = "OFFER_RECEIVED"
    REJECTION_RECEIVED = "REJECTION_RECEIVED"
    DEADLINE_REMINDER = "DEADLINE_REMINDER"
    STATUS_CHANGED = "STATUS_CHANGED"
    GENERAL_NOTIFICATION = "GENERAL_NOTIFICATION"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    application_id = Column(
        Integer,
        ForeignKey("applications.id", ondelete="SET NULL"),
        nullable=True
    )

    title = Column(
        String,
        nullable=False
    )

    message = Column(
        String,
        nullable=False
    )

    notification_type = Column(
        Enum(NotificationType),
        nullable=False
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )