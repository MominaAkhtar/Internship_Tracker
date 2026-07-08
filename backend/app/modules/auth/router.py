from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.modules.auth.schemas import RegisterRequest, LoginRequest
from app.modules.auth import service
from app.modules.auth.models import User

from app.core.database import get_db
from app.core.security import get_current_user

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
            "email": db_user.email
        }
    }