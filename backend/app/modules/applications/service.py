from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.applications.models import Application
from app.modules.applications.schemas import (
    ApplicationCreate,
    ApplicationUpdate
)

from app.modules.activity.service import create_activity_log
from app.modules.activity.schemas import ActivityLogCreate
from app.modules.activity.models import ActivityType

from app.modules.notifications.service import create_notification
from app.modules.notifications.schemas import NotificationCreate
from app.modules.notifications.models import NotificationType


# =========================
# CREATE APPLICATION
# =========================
def create_application(
    db: Session,
    user_id: int,
    data: ApplicationCreate
):
    new_app = Application(
        user_id=user_id,
        company_name=data.company_name,
        position=data.position,
        status=data.status,
        notes=data.notes,
        resume_version=data.resume_version,
        interview_date=data.interview_date
    )

    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    create_activity_log(
        db,
        ActivityLogCreate(
            user_id=user_id,
            application_id=new_app.id,
            action_type=ActivityType.CREATE_APPLICATION,
            description=f"Created application for {new_app.company_name}"
        )
    )

    create_notification(
        db,
        NotificationCreate(
            user_id=user_id,
            application_id=new_app.id,
            title="Application Added",
            message=f"Your application to {new_app.company_name} has been created.",
            notification_type=NotificationType.APPLICATION_ADDED
        )
    )

    return new_app


# =========================
# GET ALL
# =========================
def get_applications(db: Session, user_id: int):
    return (
        db.query(Application)
        .filter(Application.user_id == user_id)
        .all()
    )


# =========================
# GET ONE
# =========================
def get_application(db: Session, app_id: int, user_id: int):
    app_obj = (
        db.query(Application)
        .filter(
            Application.id == app_id,
            Application.user_id == user_id
        )
        .first()
    )

    if not app_obj:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return app_obj


# =========================
# UPDATE
# =========================
def update_application(
    db: Session,
    app_id: int,
    user_id: int,
    data: ApplicationUpdate
):
    app_obj = get_application(db, app_id, user_id)

    update_data = data.model_dump(exclude_unset=True)

    # Company Name
    if "company_name" in update_data:
        old = app_obj.company_name
        app_obj.company_name = update_data["company_name"]

        create_activity_log(
            db,
            ActivityLogCreate(
                user_id=user_id,
                application_id=app_obj.id,
                action_type=ActivityType.UPDATE_APPLICATION,
                old_value=old,
                new_value=app_obj.company_name,
                description=f"Company changed from '{old}' to '{app_obj.company_name}'"
            )
        )

    # Position
    if "position" in update_data:
        old = app_obj.position
        app_obj.position = update_data["position"]

        create_activity_log(
            db,
            ActivityLogCreate(
                user_id=user_id,
                application_id=app_obj.id,
                action_type=ActivityType.UPDATE_APPLICATION,
                old_value=old,
                new_value=app_obj.position,
                description=f"Position changed from '{old}' to '{app_obj.position}'"
            )
        )

        create_notification(
            db,
            NotificationCreate(
                user_id=user_id,
                application_id=app_obj.id,
                title="Application Updated",
                message=f"Company updated to {app_obj.company_name}.",
                notification_type=NotificationType.APPLICATION_UPDATED
            )
        )

    # Status
    if "status" in update_data:
        old = app_obj.status
        app_obj.status = update_data["status"]

        create_activity_log(
            db,
            ActivityLogCreate(
                user_id=user_id,
                application_id=app_obj.id,
                action_type=ActivityType.STATUS_CHANGED,
                old_value=old,
                new_value=app_obj.status,
                description=f"Status changed from '{old}' to '{app_obj.status}'"
            )
        )

        create_notification(
            db,
            NotificationCreate(
                user_id=user_id,
                application_id=app_obj.id,
                title="Status Changed",
                message=f"Status changed to {app_obj.status}.",
                notification_type=NotificationType.STATUS_CHANGED
            )
        )

    # Notes
    if "notes" in update_data:
        old = app_obj.notes
        app_obj.notes = update_data["notes"]

        create_activity_log(
            db,
            ActivityLogCreate(
                user_id=user_id,
                application_id=app_obj.id,
                action_type=ActivityType.UPDATE_APPLICATION,
                old_value=old,
                new_value=app_obj.notes,
                description="Updated application notes"
            )
        )

    # Resume Version
    if "resume_version" in update_data:
        app_obj.resume_version = update_data["resume_version"]

    # Interview Date
    if "interview_date" in update_data:
        app_obj.interview_date = update_data["interview_date"]

    db.commit()
    db.refresh(app_obj)

    return app_obj


# =========================
# DELETE
# =========================
def delete_application(db: Session, app_id: int, user_id: int):
    app_obj = get_application(db, app_id, user_id)

    create_activity_log(
        db,
        ActivityLogCreate(
            user_id=user_id,
            application_id=app_obj.id,
            action_type=ActivityType.DELETE_APPLICATION,
            description=f"Deleted application for {app_obj.company_name}"
        )
    )

    db.delete(app_obj)
    db.commit()

    return {
        "message": "Application deleted successfully"
    }