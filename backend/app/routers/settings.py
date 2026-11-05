from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.app.config import settings
from backend.app.services.email_service import email_service

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class SettingsPayload(BaseModel):
    gemini_api_key: Optional[str] = None
    gmail_app_password: Optional[str] = None
    company_name: Optional[str] = None
    bot_name: Optional[str] = None
    company_email: Optional[str] = None
    company_phone: Optional[str] = None
    company_address: Optional[str] = None
    company_website: Optional[str] = None
    company_gstin: Optional[str] = None
    company_pan: Optional[str] = None
    company_bank_account: Optional[str] = None
    company_bank_ifsc: Optional[str] = None

class TestGmailPayload(BaseModel):
    email: Optional[str] = None
    app_password: Optional[str] = None

class SendTestEmailPayload(BaseModel):
    recipient_email: str
    custom_message: Optional[str] = None

@router.get("")
def get_system_settings():
    pwd = settings.GMAIL_APP_PASSWORD or settings.SMTP_PASSWORD
    return {
        "gemini": {
            "is_configured": bool(settings.GEMINI_API_KEY),
            "masked_key": f"{settings.GEMINI_API_KEY[:4]}...{settings.GEMINI_API_KEY[-4:]}" if settings.GEMINI_API_KEY else None,
            "model": settings.GEMINI_MODEL
        },
        "gmail": {
            "sales_account": settings.GMAIL_SALES_EMAIL,
            "is_configured": bool(pwd),
            "app_password_configured": bool(pwd),
            "masked_password": f"•••• •••• •••• {pwd[-4:]}" if pwd and len(pwd) >= 4 else None,
            "smtp_host": settings.SMTP_HOST,
            "imap_host": settings.IMAP_HOST
        },
        "n8n": {
            "cloud_url": settings.N8N_CLOUD_URL,
            "inbound_webhook_path": "/api/emails/webhook/gmail",
            "webhook_full_url": "http://localhost:8000/api/emails/webhook/gmail",
            "status": "ready_for_trigger"
        },
        "company_profile": {
            "name": settings.COMPANY_NAME,
            "bot_name": settings.BOT_NAME,
            "email": settings.COMPANY_EMAIL,
            "phone": settings.COMPANY_PHONE,
            "address": settings.COMPANY_ADDRESS,
            "website": settings.COMPANY_WEBSITE,
            "gstin": settings.COMPANY_GSTIN,
            "pan": settings.COMPANY_PAN,
            "bank_name": settings.BANK_NAME,
            "bank_account": settings.BANK_ACCOUNT_NUMBER,
            "bank_ifsc": settings.BANK_IFSC
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
    
    if payload.gmail_app_password:
        clean_pwd = payload.gmail_app_password.strip()
        settings.GMAIL_APP_PASSWORD = clean_pwd
        settings.SMTP_PASSWORD = clean_pwd
        settings.IMAP_PASSWORD = clean_pwd

    if payload.company_name:
        settings.COMPANY_NAME = payload.company_name
    if payload.bot_name:
        settings.BOT_NAME = payload.bot_name
    if payload.company_email:
        settings.COMPANY_EMAIL = payload.company_email
        settings.GMAIL_SALES_EMAIL = payload.company_email
        settings.SMTP_USER = payload.company_email
        settings.IMAP_USER = payload.company_email
        settings.SMTP_FROM = payload.company_email
    if payload.company_phone:
        settings.COMPANY_PHONE = payload.company_phone
    if payload.company_address:
        settings.COMPANY_ADDRESS = payload.company_address
    if payload.company_website:
        settings.COMPANY_WEBSITE = payload.company_website
    if payload.company_gstin:
        settings.COMPANY_GSTIN = payload.company_gstin
    if payload.company_pan:
        settings.COMPANY_PAN = payload.company_pan
    if payload.company_bank_account:
        settings.BANK_ACCOUNT_NUMBER = payload.company_bank_account
    if payload.company_bank_ifsc:
        settings.BANK_IFSC = payload.company_bank_ifsc

    return {"success": True, "message": "Settings updated successfully"}

@router.post("/test-gmail")
def test_gmail_connection(payload: TestGmailPayload):
    """
    Tests live IMAP and SMTP connection to Gmail using provided or saved credentials.
    """
    email_acc = payload.email or settings.GMAIL_SALES_EMAIL
    pwd = payload.app_password or settings.GMAIL_APP_PASSWORD or settings.SMTP_PASSWORD
    if not pwd:
        raise HTTPException(
            status_code=400, 
            detail="No App Password provided. Please enter your 16-character Google App Password."
        )

    result = email_service.test_gmail_credentials(email_acc, pwd)
    return result

@router.post("/send-test-email")
def send_test_email(payload: SendTestEmailPayload):
    """
    Sends an actual live email from company sales inbox (anyaforgerrrr345@gmail.com)
    to any personal email address provided by the user.
    """
    subject = f"Test Verification Email from {settings.BOT_NAME} ({settings.COMPANY_NAME})"
    body = f"""Hello,

This is a live test email sent directly from {settings.COMPANY_NAME} sales inbox ({settings.GMAIL_SALES_EMAIL}).

Sender: {settings.BOT_NAME}
System: Anvayuone AI-Powered Proposal Engine
Time: {settings.COMPANY_NAME} Sales System Active

If you are reading this email, your Gmail integration with {settings.GMAIL_SALES_EMAIL} is functioning successfully!

Warm regards,
{settings.BOT_NAME}
{settings.COMPANY_NAME} | Hyderabad, India
"""
    result = email_service.send_via_gmail_api(
        to_email=payload.recipient_email,
        subject=subject,
        body_text=body,
        pdf_path=None
    )
    return result
