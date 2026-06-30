from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.modules.auth.models import User

from app.modules.activity.schemas import ActivityLogResponse
from app.modules.activity.service import (
    get_user_activity_logs,
    get_activity_log_by_id
)

router = APIRouter(
    prefix="/activity-logs",
    tags=["Activity Logs"]
)


@router.get(
    "/",
    response_model=List[ActivityLogResponse]
)
def get_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_activity_logs(db, current_user["user_id"])


@router.get(
    "/{log_id}",
    response_model=ActivityLogResponse
)
def get_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = get_activity_log_by_id(
        db,
        log_id,
        current_user["user_id"]
    )

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Activity log not found."
        )

    return log