from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import shutil
import uuid

from app.modules.auth.schemas import RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.modules.auth import service
from app.modules.auth.models import User

from app.core.database import get_db
from app.core.security import get_current_user

import os
from datetime import datetime
from app.core.security import create_access_token, create_reset_token, decode_token, hash_password

router = APIRouter(prefix="/auth", tags=["Auth"])


# =========================
# REGISTER
# =========================

@router.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)):

    new_user = service.register_user(
        db=db,
        name=user.name,
        email=user.email,
        password=user.password
    )

    if not new_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    return {
        "success": True,
        "message": "User registered successfully",
        "data": {
            "id": new_user.id,
            "email": new_user.email
        }
    }


# =========================
# LOGIN
# =========================

@router.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):

    token = service.login_user(
        db=db,
        email=user.email,
        password=user.password
    )

    if not token:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =========================
# GET CURRENT USER
# =========================

@router.get("/me")
def get_me(user=Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user["user_id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "success": True,
        "data": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "profile_picture": db_user.profile_picture
        }
    }


# =========================
# UPLOAD PROFILE PICTURE
# =========================
@router.post("/me/profile-picture")
def upload_profile_picture(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.id == user["user_id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="Only image files are allowed (jpg, jpeg, png, webp)")
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", "avatars", filename)
    
    # Save file
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile picture: {str(e)}")
        
    # Update DB
    db_user.profile_picture = f"/uploads/avatars/{filename}"
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    
    return {
        "success": True,
        "message": "Profile picture updated successfully",
        "profile_picture": db_user.profile_picture
    }


# =========================
# FORGOT PASSWORD
# =========================

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email")
        
    # Generate secure reset token expiring in 15 mins. Include current password hash to prevent token reuse.
    token = create_reset_token(data={
        "user_id": user.id,
        "email": user.email,
        "purpose": "reset_password",
        "pwd_hash": user.password_hash
    })

    # No email step -- return the token directly so the frontend can open
    # the reset-password popup immediately.
    return {
        "success": True,
        "message": "Verified. You can reset your password now.",
        "token": token
    }


# =========================
# RESET PASSWORD
# =========================

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.token)
    if payload == "expired":
        raise HTTPException(status_code=400, detail="Expired token")
    if not payload or payload.get("purpose") != "reset_password":
        raise HTTPException(status_code=400, detail="Invalid token")
        
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Verify the password has not already been changed (i.e. check against pwd_hash in payload)
    if payload.get("pwd_hash") != user.password_hash:
        raise HTTPException(status_code=400, detail="Used token")
        
    # Update password
    user.password_hash = hash_password(req.new_password)
    db.commit()
    
    return {
        "success": True,
        "message": "Password updated successfully"
    }
