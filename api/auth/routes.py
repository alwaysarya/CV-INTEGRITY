"""
Auth Routes — register, login, refresh, me, logout
"""
from fastapi import APIRouter, HTTPException, status, Depends, Body
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from . import database as db
from .jwt_handler import (
    create_access_token,
    create_refresh_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ===== Request models =====
class RegisterInput(BaseModel):
    username: str = Field(..., min_length=3, max_length=32)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginInput(BaseModel):
    username: str
    password: str


class RefreshInput(BaseModel):
    refresh_token: str


# ===== Helpers =====
def user_to_dict(u: Dict[str, Any]) -> Dict[str, Any]:
    """Strip sensitive fields"""
    return {
        "id": u["id"],
        "username": u["username"],
        "email": u["email"],
        "role": u["role"],
        "is_verified": bool(u["is_verified"]),
        "is_active": bool(u["is_active"]),
        "created_at": u["created_at"],
        "last_login_at": u.get("last_login_at"),
    }


# ===== Endpoints =====
@router.post("/register")
async def register(data: RegisterInput):
    """Create new user account"""
    # Check existing
    if db.get_user_by_username(data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.get_user_by_email(data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = db.create_user(data.username, data.email, data.password, role="analyst")
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create user")

    return {
        "status": "success",
        "message": "Account created. Please log in.",
        "user": user_to_dict(user),
    }


@router.post("/login")
async def login(data: LoginInput):
    """Authenticate user, return access + refresh tokens"""
    user = db.get_user_by_username(data.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account disabled")

    if not db.verify_password(data.password, user["password_hash"]):
        db.record_failed_attempt(user["id"])
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Success
    db.update_last_login(user["id"])
    access_token = create_access_token(user["id"], user["username"], user["role"])
    refresh_token = create_refresh_token()
    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    db.save_refresh_token(user["id"], refresh_token, expires_at)

    return {
        "status": "success",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "expires_in": 900,  # seconds (15 min)
        "user": user_to_dict(user),
    }


@router.post("/refresh")
async def refresh(data: RefreshInput):
    """Exchange refresh token for new access token"""
    stored = db.get_refresh_token(data.refresh_token)
    if not stored:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Check expiry
    expires = datetime.fromisoformat(stored["expires_at"].replace("Z", "+00:00"))
    if expires < datetime.now(timezone.utc):
        db.revoke_refresh_token(data.refresh_token)
        raise HTTPException(status_code=401, detail="Refresh token expired")

    user = db.get_user_by_id(stored["user_id"])
    if not user or not user["is_active"]:
        raise HTTPException(status_code=401, detail="User not found or disabled")

    access_token = create_access_token(user["id"], user["username"], user["role"])
    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": 900,
    }


@router.post("/logout")
async def logout(data: RefreshInput):
    """Revoke refresh token"""
    db.revoke_refresh_token(data.refresh_token)
    return {"status": "success", "message": "Logged out"}


@router.get("/me")
async def me(user: Dict[str, Any] = Depends(get_current_user)):
    """Return current authenticated user"""
    full = db.get_user_by_id(user["user_id"])
    if not full:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "user": user_to_dict(full)}


@router.post("/logout-all")
async def logout_all(user: Dict[str, Any] = Depends(get_current_user)):
    """Revoke all refresh tokens for current user"""
    db.revoke_all_user_tokens(user["user_id"])
    return {"status": "success", "message": "All sessions revoked"}
