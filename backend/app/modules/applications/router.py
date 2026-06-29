from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationResponse

router = APIRouter(prefix="/applications", tags=["Applications"])


# =========================
# CREATE APPLICATION
# =========================
@router.post("/", response_model=ApplicationResponse)
def create_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    app_obj = Application(
        user_id=current_user["user_id"],
        **data.dict()
    )

    db.add(app_obj)
    db.commit()
    db.refresh(app_obj)

    return app_obj


# =========================
# GET ALL (USER-SPECIFIC)
# =========================
@router.get("/", response_model=list[ApplicationResponse])
def get_applications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Application).filter(
        Application.user_id == current_user["user_id"]
    ).all()


# =========================
# GET SINGLE (USER-SPECIFIC)
# =========================
@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    app_obj = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user["user_id"]
    ).first()

    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    return app_obj


# =========================
# UPDATE (USER-SPECIFIC)
# =========================
@router.put("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: int,
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    app_obj = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user["user_id"]
    ).first()

    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    for key, value in data.dict().items():
        setattr(app_obj, key, value)

    db.commit()
    db.refresh(app_obj)

    return app_obj


# =========================
# DELETE (USER-SPECIFIC)
# =========================
@router.delete("/{app_id}")
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    app_obj = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user["user_id"]
    ).first()

    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app_obj)
    db.commit()

    return {"message": "Application deleted successfully"}