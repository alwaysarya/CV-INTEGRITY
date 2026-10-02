"""Auth API — Login, Signup, Profile"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import jwt
import hashlib
from pathlib import Path
import json

router = APIRouter(prefix="/api/auth", tags=["auth"])
SECRET_KEY = "cv-integrity-secret-change-in-production"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24
USERS_FILE = Path("outputs/users.json")
USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
security = HTTPBearer(auto_error=False)

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "user"

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

def load_users():
    if USERS_FILE.exists():
        try:
            return json.loads(USERS_FILE.read_text())
        except Exception:
            return {}
    return {}

def save_users(users):
    USERS_FILE.write_text(json.dumps(users, indent=2))

def hash_password(pwd):
    return hashlib.sha256((pwd + "cv-salt").encode()).hexdigest()

def create_token(email):
    return jwt.encode({"email": email, "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)}, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]).get("email")
    except Exception:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    email = verify_token(credentials.credentials)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    users = load_users()
    if email not in users:
        raise HTTPException(status_code=401, detail="User not found")
    return {"email": email, **users[email]}

@router.post("/signup")
async def signup(req: SignupRequest):
    users = load_users()
    if req.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    users[req.email] = {"email": req.email, "name": req.name, "role": req.role, "password_hash": hash_password(req.password), "bio": "", "avatar": "", "created_at": datetime.utcnow().isoformat()}
    save_users(users)
    return {"status": "success", "token": create_token(req.email), "user": {"email": req.email, "name": req.name, "role": req.role}}

@router.post("/login")
async def login(req: LoginRequest):
    users = load_users()
    user = users.get(req.email)
    if not user or user["password_hash"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"status": "success", "token": create_token(req.email), "user": {"email": user["email"], "name": user["name"], "role": user["role"]}}

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"status": "success", "user": user}

@router.put("/profile")
async def update_profile(req: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    users = load_users()
    email = user["email"]
    if req.name is not None: users[email]["name"] = req.name
    if req.bio is not None: users[email]["bio"] = req.bio
    if req.avatar is not None: users[email]["avatar"] = req.avatar
    save_users(users)
    return {"status": "success", "user": users[email]}
