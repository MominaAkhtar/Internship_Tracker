from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.auth import RegisterRequest, LoginRequest
from app.models import User
from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Auth"])


# =========================
# REGISTER
# =========================

@router.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)):

    # check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # create new user
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

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

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(
        data={
            "user_id": db_user.id,
            "email": db_user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =========================
# GET CURRENT USER
# =========================

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {
        "success": True,
        "data": user
    }