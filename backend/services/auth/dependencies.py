import hashlib
import json
import base64
import time
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from services.auth.models import User, NATIONAL_ROLES

security = HTTPBearer()

SECRET_KEY = "echronibook-national-emr-secret-2026"


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed


def create_token(user_id: int, role: str, institution_id: int | None) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "institution_id": institution_id,
        "exp": int(time.time()) + 86400  # 24 hours
    }
    payload_bytes = json.dumps(payload).encode()
    token = base64.urlsafe_b64encode(payload_bytes).decode()
    sig = hashlib.sha256((token + SECRET_KEY).encode()).hexdigest()[:16]
    return f"{token}.{sig}"


def decode_token(token: str) -> dict:
    try:
        parts = token.rsplit(".", 1)
        if len(parts) != 2:
            raise ValueError("Invalid token format")
        payload_b64, sig = parts
        expected_sig = hashlib.sha256((payload_b64 + SECRET_KEY).encode()).hexdigest()[:16]
        if sig != expected_sig:
            raise ValueError("Invalid signature")
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    payload = decode_token(credentials.credentials)
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


def require_role(*roles):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return dependency


def is_national_user(user: User) -> bool:
    return user.role in NATIONAL_ROLES
