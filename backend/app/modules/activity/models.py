from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    Text,
    Enum
)
from datetime import datetime
import enum

from app.core.database import Base


class ActivityType(str, enum.Enum):
    CREATE_APPLICATION = "CREATE_APPLICATION"
    UPDATE_APPLICATION = "UPDATE_APPLICATION"
    STATUS_CHANGED = "STATUS_CHANGED"
    DELETE_APPLICATION = "DELETE_APPLICATION"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"


class ActivityLog(Base):
    __tablename__ = "activity_logs"

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

    action_type = Column(
        Enum(ActivityType),
        nullable=False
    )

    old_value = Column(Text)

    new_value = Column(Text)

    description = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )