from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.applications.models import Application
from app.modules.applications.schemas import ApplicationCreate


def create_application(db: Session, user_id: int, data: ApplicationCreate):
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

    return new_app


def get_applications(db: Session, user_id: int):
    return db.query(Application).filter(
        Application.user_id == user_id
    ).all()


def get_application(db: Session, app_id: int, user_id: int):
    app_obj = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == user_id
    ).first()

    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    return app_obj


def update_application(
    db: Session,
    app_id: int,
    user_id: int,
    data: ApplicationCreate
):
    app_obj = get_application(db, app_id, user_id)

    for key, value in data.dict().items():
        setattr(app_obj, key, value)

    db.commit()
    db.refresh(app_obj)

    return app_obj


def delete_application(db: Session, app_id: int, user_id: int):
    app_obj = get_application(db, app_id, user_id)

    db.delete(app_obj)
    db.commit()

    return {"message": "Application deleted successfully"}