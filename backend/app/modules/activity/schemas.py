from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class ActionType(str, Enum):
    CREATE_APPLICATION = "CREATE_APPLICATION"
    UPDATE_STATUS = "UPDATE_STATUS"
    UPDATE_NOTES = "UPDATE_NOTES"
    DELETE_APPLICATION = "DELETE_APPLICATION"


class ActivityLogCreate(BaseModel):
    user_id: int
    application_id: Optional[int] = None

    action_type: ActionType

    old_value: Optional[str] = None
    new_value: Optional[str] = None

    description: str


class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    application_id: Optional[int]

    action_type: ActionType

    old_value: Optional[str]
    new_value: Optional[str]

    description: str

    created_at: datetime

    class Config:
        from_attributes = True