from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.app.config import settings

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class SettingsPayload(BaseModel):
    gemini_api_key: Optional[str] = None
    company_name: Optional[str] = None
    company_email: Optional[str] = None
    company_phone: Optional[str] = None
    company_address: Optional[str] = None
    company_website: Optional[str] = None

@router.get("")
def get_system_settings():
    return {
        "gemini": {
            "is_configured": bool(settings.GEMINI_API_KEY),
            "masked_key": f"{settings.GEMINI_API_KEY[:4]}...{settings.GEMINI_API_KEY[-4:]}" if settings.GEMINI_API_KEY else None,
            "model": settings.GEMINI_MODEL
        },
        "gmail": {
            "is_configured": bool(settings.GMAIL_CLIENT_ID and settings.GMAIL_CLIENT_SECRET),
            "client_id_set": bool(settings.GMAIL_CLIENT_ID)
        },
        "imap": {
            "is_configured": bool(settings.IMAP_HOST and settings.IMAP_USER),
            "host": settings.IMAP_HOST
        },
        "smtp": {
            "is_configured": bool(settings.SMTP_HOST and settings.SMTP_USER),
            "host": settings.SMTP_HOST,
            "from_email": settings.SMTP_FROM
        },
        "company_profile": {
            "name": settings.COMPANY_NAME,
            "email": settings.COMPANY_EMAIL,
            "phone": settings.COMPANY_PHONE,
            "address": settings.COMPANY_ADDRESS,
            "website": settings.COMPANY_WEBSITE
        }
    }

@router.post("")
def update_system_settings(payload: SettingsPayload):
    if payload.gemini_api_key:
        settings.GEMINI_API_KEY = payload.gemini_api_key
        # reconfigure gemini in ai_service
        from backend.app.services.ai_service import ai_service
        try:
            from google import genai
            ai_service.api_key = payload.gemini_api_key
            ai_service.client = genai.Client(api_key=payload.gemini_api_key)
        except Exception:
            pass
    
    if payload.company_name:
        settings.COMPANY_NAME = payload.company_name
    if payload.company_email:
        settings.COMPANY_EMAIL = payload.company_email
    if payload.company_phone:
        settings.COMPANY_PHONE = payload.company_phone
    if payload.company_address:
        settings.COMPANY_ADDRESS = payload.company_address
    if payload.company_website:
        settings.COMPANY_WEBSITE = payload.company_website

    return {"success": True, "message": "Settings updated successfully"}
