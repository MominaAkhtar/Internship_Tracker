from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    Text,
    Enum as SqlEnum
)

from app.core.database import Base


class ActionType(str, Enum):
    CREATE_APPLICATION = "CREATE_APPLICATION"
    UPDATE_STATUS = "UPDATE_STATUS"
    UPDATE_NOTES = "UPDATE_NOTES"
    DELETE_APPLICATION = "DELETE_APPLICATION"


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
        ForeignKey("applications.id"),
        nullable=True
    )

    action_type = Column(
        SqlEnum(ActionType),
        nullable=False
    )

    old_value = Column(
        Text,
        nullable=True
    )

    new_value = Column(
        Text,
        nullable=True
    )

    description = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )