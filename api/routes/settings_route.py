"""
Settings API — save/load user preferences
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from pathlib import Path
from datetime import datetime
import json

router = APIRouter(prefix="/api/settings", tags=["settings"])

SETTINGS_FILE = Path("outputs/settings.json")
SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)


class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_alerts: Optional[bool] = None
    auto_refresh: Optional[bool] = None
    refresh_interval: Optional[int] = None
    extra: Optional[Dict[str, Any]] = None


def load_settings():
    if SETTINGS_FILE.exists():
        try:
            return json.loads(SETTINGS_FILE.read_text())
        except Exception:
            pass
    # Default settings
    return {
        "theme": "dark",
        "language": "en",
        "notifications_enabled": True,
        "email_alerts": False,
        "auto_refresh": True,
        "refresh_interval": 30,
        "updated_at": datetime.utcnow().isoformat(),
    }


def save_settings(data):
    data["updated_at"] = datetime.utcnow().isoformat()
    SETTINGS_FILE.write_text(json.dumps(data, indent=2))
    return data


@router.get("")
async def get_settings():
    return {"status": "success", "settings": load_settings()}


@router.put("")
async def update_settings(req: SettingsUpdate):
    settings = load_settings()
    
    if req.theme is not None:
        settings["theme"] = req.theme
    if req.language is not None:
        settings["language"] = req.language
    if req.notifications_enabled is not None:
        settings["notifications_enabled"] = req.notifications_enabled
    if req.email_alerts is not None:
        settings["email_alerts"] = req.email_alerts
    if req.auto_refresh is not None:
        settings["auto_refresh"] = req.auto_refresh
    if req.refresh_interval is not None:
        settings["refresh_interval"] = req.refresh_interval
    if req.extra is not None:
        settings["extra"] = req.extra
    
    updated = save_settings(settings)
    return {"status": "success", "settings": updated}
