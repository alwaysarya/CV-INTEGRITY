"""
Auth API — Proper Security Implementation
- bcrypt password hashing
- JWT access tokens (15 min)
- Refresh tokens (7 days) stored in SQLite
- Session revocation
- Failed attempt tracking
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime, timedelta, timezone
import jwt
import secrets
import sqlite3
import bcrypt
from pathlib import Path

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = "cv-integrity-dev-secret-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MIN = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

DB_PATH = Path(__file__).parent.parent.parent / "database" / "data" / "users.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

security = HTTPBearer(auto_error=False)


# ===== Database helpers =====
def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'analyst',
                bio TEXT DEFAULT '',
                avatar TEXT DEFAULT '',
                failed_attempts INTEGER NOT NULL DEFAULT 0,
                locked_until TEXT,
                created_at TEXT NOT NULL,
                last_login_at TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                revoked INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                email TEXT,
                action TEXT NOT NULL,
                ip TEXT,
                user_agent TEXT,
                success INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()


init_db()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')


def verify_password(password: str, hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hash.encode('utf-8'))
    except Exception:
        return False


def audit(user_id: Optional[int], email: str, action: str, ip: str, ua: str, success: bool = True) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO audit_log (user_id, email, action, ip, user_agent, success, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, email, action, ip, ua, 1 if success else 0, datetime.utcnow().isoformat())
        )
        conn.commit()


def create_access_token(user_id: int, email: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode({
        "sub": str(user_id),
        "email": email,
        "role": role,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MIN),
    }, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def save_refresh_token(user_id: int, token: str) -> None:
    expires_at = (datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).isoformat()
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (user_id, token, expires_at, datetime.utcnow().isoformat())
        )
        conn.commit()


def get_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM refresh_tokens WHERE token = ? AND revoked = 0", (token,)).fetchone()
        return dict(row) if row else None


def revoke_refresh_token(token: str) -> None:
    with get_conn() as conn:
        conn.execute("UPDATE refresh_tokens SET revoked = 1 WHERE token = ?", (token,))
        conn.commit()


def user_dict(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "role": row["role"],
        "bio": row.get("bio") or "",
        "avatar": row.get("avatar") or "",
        "created_at": row["created_at"],
        "last_login_at": row.get("last_login_at"),
    }


# ===== Request models =====
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=2, max_length=80)
    role: str = "analyst"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None


# ===== Dependency: current user =====
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")

    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (int(payload["sub"]),)).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return user_dict(dict(row))


# ===== Routes =====
@router.post("/signup")
async def signup(req: SignupRequest, request: Request):
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "")

    with get_conn() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if existing:
        audit(None, req.email, "signup", ip, ua, success=False)
        raise HTTPException(status_code=400, detail="Email already registered")

    pw_hash = hash_password(req.password)
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (req.email, req.name, pw_hash, req.role, datetime.utcnow().isoformat())
        )
        conn.commit()
        user_id = cur.lastrowid
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    audit(user_id, req.email, "signup", ip, ua, success=True)

    access = create_access_token(user_id, req.email, req.role)
    refresh = create_refresh_token()
    save_refresh_token(user_id, refresh)

    return {
        "status": "success",
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "Bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MIN * 60,
        "user": user_dict(dict(row)),
    }


@router.post("/login")
async def login(req: LoginRequest, request: Request):
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "")

    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()

    if not row:
        audit(None, req.email, "login", ip, ua, success=False)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = dict(row)

    # Lockout check
    if user.get("locked_until"):
        locked_until = datetime.fromisoformat(user["locked_until"])
        if locked_until > datetime.utcnow():
            remaining = int((locked_until - datetime.utcnow()).total_seconds() / 60) + 1
            raise HTTPException(status_code=403, detail=f"Account locked. Try again in {remaining} min.")
        else:
            with get_conn() as conn:
                conn.execute("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?", (user["id"],))
                conn.commit()
            user["failed_attempts"] = 0
            user["locked_until"] = None

    # Verify password
    if not verify_password(req.password, user["password_hash"]):
        failed = (user["failed_attempts"] or 0) + 1
        locked_until = None
        if failed >= MAX_FAILED_ATTEMPTS:
            locked_until = (datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
        with get_conn() as conn:
            conn.execute(
                "UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?",
                (failed, locked_until, user["id"])
            )
            conn.commit()
        audit(user["id"], req.email, "login", ip, ua, success=False)

        if locked_until:
            raise HTTPException(status_code=403, detail=f"Account locked for {LOCKOUT_MINUTES} min after too many failed attempts")
        remaining = MAX_FAILED_ATTEMPTS - failed
        raise HTTPException(status_code=401, detail=f"Invalid credentials · {remaining} attempt(s) remaining")

    # Success
    with get_conn() as conn:
        conn.execute(
            "UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = ? WHERE id = ?",
            (datetime.utcnow().isoformat(), user["id"])
        )
        conn.commit()

    access = create_access_token(user["id"], user["email"], user["role"])
    refresh = create_refresh_token()
    save_refresh_token(user["id"], refresh)

    audit(user["id"], req.email, "login", ip, ua, success=True)

    return {
        "status": "success",
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "Bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MIN * 60,
        "user": user_dict(user),
    }


@router.post("/refresh")
async def refresh(req: RefreshRequest):
    stored = get_refresh_token(req.refresh_token)
    if not stored:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    expires = datetime.fromisoformat(stored["expires_at"])
    if expires < datetime.now(timezone.utc):
        revoke_refresh_token(req.refresh_token)
        raise HTTPException(status_code=401, detail="Refresh token expired")

    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (stored["user_id"],)).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="User not found")

    user = dict(row)
    access = create_access_token(user["id"], user["email"], user["role"])

    return {
        "status": "success",
        "access_token": access,
        "token_type": "Bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MIN * 60,
    }


@router.post("/logout")
async def logout(req: RefreshRequest):
    revoke_refresh_token(req.refresh_token)
    return {"status": "success", "message": "Logged out"}


@router.get("/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return {"status": "success", "user": user}


@router.put("/profile")
async def update_profile(req: ProfileUpdateRequest, user: Dict[str, Any] = Depends(get_current_user)):
    fields = []
    values = []
    if req.name is not None:
        fields.append("name = ?"); values.append(req.name)
    if req.bio is not None:
        fields.append("bio = ?"); values.append(req.bio)
    if req.avatar is not None:
        fields.append("avatar = ?"); values.append(req.avatar)

    if fields:
        values.append(user["id"])
        with get_conn() as conn:
            conn.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", values)
            conn.commit()

    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return {"status": "success", "user": user_dict(dict(row))}


@router.get("/audit-log")
async def get_audit_log(user: Dict[str, Any] = Depends(get_current_user)):
    """Return recent auth events for current user"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT action, ip, user_agent, success, created_at FROM audit_log WHERE user_id = ? ORDER BY id DESC LIMIT 50",
            (user["id"],)
        ).fetchall()
    return {"status": "success", "events": [dict(r) for r in rows]}
