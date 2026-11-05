import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "ProposalGen AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./proposalgen.db")
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Gmail API OAuth 2.0
    GMAIL_CLIENT_ID: Optional[str] = os.getenv("GMAIL_CLIENT_ID", None)
    GMAIL_CLIENT_SECRET: Optional[str] = os.getenv("GMAIL_CLIENT_SECRET", None)
    GMAIL_REFRESH_TOKEN: Optional[str] = os.getenv("GMAIL_REFRESH_TOKEN", None)
    
    # IMAP Configuration
    IMAP_HOST: Optional[str] = os.getenv("IMAP_HOST", None)
    IMAP_PORT: int = int(os.getenv("IMAP_PORT", "993"))
    IMAP_USER: Optional[str] = os.getenv("IMAP_USER", None)
    IMAP_PASSWORD: Optional[str] = os.getenv("IMAP_PASSWORD", None)
    
    # SMTP / Outbound Email
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST", None)
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", None)
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", None)
    SMTP_FROM: str = os.getenv("SMTP_FROM", "proposals@proposalgen.ai")
    
    # Company Profile Defaults
    COMPANY_NAME: str = os.getenv("COMPANY_NAME", "ProposalGen Solutions Inc.")
    COMPANY_EMAIL: str = os.getenv("COMPANY_EMAIL", "sales@proposalgen.ai")
    COMPANY_PHONE: str = os.getenv("COMPANY_PHONE", "+1 (800) 555-0199")
    COMPANY_WEBSITE: str = os.getenv("COMPANY_WEBSITE", "https://proposalgen.ai")
    COMPANY_ADDRESS: str = os.getenv("COMPANY_ADDRESS", "100 Innovation Way, Suite 400, San Francisco, CA 94107")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
