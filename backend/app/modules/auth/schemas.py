from pydantic import BaseModel, EmailStr


# =========================
# REGISTER SCHEMA
# =========================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


# =========================
# LOGIN SCHEMA
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================
# TOKEN RESPONSE
# =========================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# =========================
# FORGOT & RESET PASSWORD
# =========================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str