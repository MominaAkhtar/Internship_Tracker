from sqlalchemy.orm import Session

from app.modules.auth.models import User
from app.core.security import hash_password, verify_password, create_access_token


# =========================
# REGISTER SERVICE
# =========================

def register_user(db: Session, name: str, email: str, password: str):

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        return None  # router will handle error

    new_user = User(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================
# LOGIN SERVICE
# =========================

def login_user(db: Session, email: str, password: str):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email
        }
    )

    return token