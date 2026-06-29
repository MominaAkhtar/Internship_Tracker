from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.activity_log import ActionType


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