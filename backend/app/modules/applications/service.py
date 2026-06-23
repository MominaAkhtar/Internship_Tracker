from sqlalchemy.orm import Session
from app.models.application import Application
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