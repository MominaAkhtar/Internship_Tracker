from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
import shutil
import uuid
import os

from app.core.database import get_db
from app.core.security import get_current_user

from app.modules.applications import service
from app.modules.applications.schemas import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
)

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


# =========================
# UPLOAD RESUME
# =========================
@router.post("/upload-resume")
def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "doc", "txt"]:
        raise HTTPException(status_code=400, detail="Only document files are allowed (pdf, docx, doc, txt)")
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", "resumes", filename)
    
    # Save file
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save resume file: {str(e)}")
        
    return {
        "success": True,
        "message": "Resume uploaded successfully",
        "resume_path": f"/uploads/resumes/{filename}",
        "original_name": file.filename
    }


# =========================
# CREATE APPLICATION
# =========================
@router.post("/", response_model=ApplicationResponse)
def create_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.create_application(
        db=db,
        user_id=current_user["user_id"],
        data=data
    )


# =========================
# GET ALL
# =========================
@router.get("/", response_model=list[ApplicationResponse])
def get_applications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_applications(
        db=db,
        user_id=current_user["user_id"]
    )


# =========================
# GET ONE
# =========================
@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.get_application(
        db=db,
        app_id=app_id,
        user_id=current_user["user_id"]
    )


# =========================
# UPDATE
# =========================
@router.put("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: int,
    data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.update_application(
        db=db,
        app_id=app_id,
        user_id=current_user["user_id"],
        data=data
    )


# =========================
# DELETE
# =========================
@router.delete("/{app_id}")
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return service.delete_application(
        db=db,
        app_id=app_id,
        user_id=current_user["user_id"]
    )