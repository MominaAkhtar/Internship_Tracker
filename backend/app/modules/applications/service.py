from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import timezone

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
# =========================
# UPDATE
# =========================
def deserialize_notes(raw_notes: str):
    result = {
        "location": "Remote",
        "priority": "Medium",
        "notes": ""
    }
    if not raw_notes:
        return result

    parts = raw_notes.split(" | ")
    for part in parts:
        if part.startswith("Location:"):
            result["location"] = part.replace("Location:", "").strip() or "Remote"
        elif part.startswith("Priority:"):
            result["priority"] = part.replace("Priority:", "").strip() or "Medium"
        elif part.startswith("Notes:"):
            result["notes"] = part.replace("Notes:", "").strip()

    # Fallback if the raw notes didn't follow the serialized pattern
    has_pattern = any(p.startswith("Location:") or p.startswith("Priority:") for p in parts)
    if not has_pattern:
        result["notes"] = raw_notes

    return result


def dates_equal(old, new):
    if old is None and new is None:
        return True
    if old is None or new is None:
        return False
    
    if new.tzinfo is None:
        new_aware = new.replace(tzinfo=timezone.utc)
    else:
        new_aware = new.astimezone(timezone.utc)
        
    old_as_utc = old.replace(tzinfo=timezone.utc)
    if old_as_utc == new_aware:
        return True
        
    old_as_local = old.astimezone(timezone.utc)
    if old_as_local == new_aware:
        return True
        
    return False


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
        new = update_data["company_name"]
        if old != new:
            app_obj.company_name = new

            create_activity_log(
                db,
                ActivityLogCreate(
                    user_id=user_id,
                    application_id=app_obj.id,
                    action_type=ActivityType.UPDATE_APPLICATION,
                    old_value=old,
                    new_value=new,
                    description=f"Company changed from '{old}' to '{new}'"
                )
            )

    # Position
    if "position" in update_data:
        old = app_obj.position
        new = update_data["position"]
        if old != new:
            app_obj.position = new

            create_activity_log(
                db,
                ActivityLogCreate(
                    user_id=user_id,
                    application_id=app_obj.id,
                    action_type=ActivityType.UPDATE_APPLICATION,
                    old_value=old,
                    new_value=new,
                    description=f"Position changed from '{old}' to '{new}'"
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
        new = update_data["status"]
        if old != new:
            app_obj.status = new

            create_activity_log(
                db,
                ActivityLogCreate(
                    user_id=user_id,
                    application_id=app_obj.id,
                    action_type=ActivityType.STATUS_CHANGED,
                    old_value=old,
                    new_value=new,
                    description=f"Status changed from '{old}' to '{new}'"
                )
            )

            create_notification(
                db,
                NotificationCreate(
                    user_id=user_id,
                    application_id=app_obj.id,
                    title="Status Changed",
                    message=f"Status changed to {new}.",
                    notification_type=NotificationType.STATUS_CHANGED
                )
            )

    # Notes
    if "notes" in update_data:
        old_notes_raw = app_obj.notes or ""
        new_notes_raw = update_data["notes"] or ""

        if old_notes_raw != new_notes_raw:
            old_parsed = deserialize_notes(old_notes_raw)
            new_parsed = deserialize_notes(new_notes_raw)

            # Location
            if old_parsed["location"] != new_parsed["location"]:
                create_activity_log(
                    db,
                    ActivityLogCreate(
                        user_id=user_id,
                        application_id=app_obj.id,
                        action_type=ActivityType.UPDATE_APPLICATION,
                        old_value=old_parsed["location"],
                        new_value=new_parsed["location"],
                        description=f"Location changed from '{old_parsed['location']}' to '{new_parsed['location']}'"
                    )
                )

            # Priority
            if old_parsed["priority"] != new_parsed["priority"]:
                create_activity_log(
                    db,
                    ActivityLogCreate(
                        user_id=user_id,
                        application_id=app_obj.id,
                        action_type=ActivityType.UPDATE_APPLICATION,
                        old_value=old_parsed["priority"],
                        new_value=new_parsed["priority"],
                        description=f"Priority changed from '{old_parsed['priority']}' to '{new_parsed['priority']}'"
                    )
                )

            # Notes text
            if old_parsed["notes"] != new_parsed["notes"]:
                create_activity_log(
                    db,
                    ActivityLogCreate(
                        user_id=user_id,
                        application_id=app_obj.id,
                        action_type=ActivityType.UPDATE_APPLICATION,
                        old_value=old_parsed["notes"] if old_parsed["notes"] else "None",
                        new_value=new_parsed["notes"] if new_parsed["notes"] else "None",
                        description="Updated application notes"
                    )
                )

            app_obj.notes = new_notes_raw

    # Resume Version
    if "resume_version" in update_data:
        old = app_obj.resume_version
        new = update_data["resume_version"]
        if old != new:
            app_obj.resume_version = new
            old_name = old.split('/')[-1] if old else "None"
            new_name = new.split('/')[-1] if new else "None"
            create_activity_log(
                db,
                ActivityLogCreate(
                    user_id=user_id,
                    application_id=app_obj.id,
                    action_type=ActivityType.UPDATE_APPLICATION,
                    old_value=old_name,
                    new_value=new_name,
                    description="Updated resume"
                )
            )
    # Interview Date
    if "interview_date" in update_data:
        old = app_obj.interview_date
        new = update_data["interview_date"]

        # Check if they are different
        is_diff = not dates_equal(old, new)

        if is_diff:
            app_obj.interview_date = new
            old_str = old.strftime("%B %d, %Y at %I:%M %p") if old else "None"
            new_str = new.strftime("%B %d, %Y at %I:%M %p") if new else "None"
            create_activity_log(
                db,
                ActivityLogCreate(
                    user_id=user_id,
                    application_id=app_obj.id,
                    action_type=ActivityType.UPDATE_APPLICATION,
                    old_value=old_str,
                    new_value=new_str,
                    description="Interview Date changed"
                )
            )

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