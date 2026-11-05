import os
from pydantic_settings import BaseSettings
from typing import Optional

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "proposalgen.db").replace("\\", "/")

class Settings(BaseSettings):
    APP_NAME: str = "ProposalGen AI"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database - default always points to project root proposalgen.db regardless of working directory
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Gmail API & SMTP Configuration (Sales Inbox: anyaforgerrrr345@gmail.com)
    GMAIL_SALES_EMAIL: str = os.getenv("GMAIL_SALES_EMAIL", "anyaforgerrrr345@gmail.com")
    GMAIL_APP_PASSWORD: Optional[str] = os.getenv("GMAIL_APP_PASSWORD", None)
    GMAIL_CLIENT_ID: Optional[str] = os.getenv("GMAIL_CLIENT_ID", None)
    GMAIL_CLIENT_SECRET: Optional[str] = os.getenv("GMAIL_CLIENT_SECRET", None)
    GMAIL_REFRESH_TOKEN: Optional[str] = os.getenv("GMAIL_REFRESH_TOKEN", None)
    GMAIL_ACCESS_TOKEN: Optional[str] = os.getenv("GMAIL_ACCESS_TOKEN", None)
    
    # n8n Automation Integration (Cloud instance: https://anvayuone.app.n8n.cloud)
    N8N_CLOUD_URL: str = os.getenv("N8N_CLOUD_URL", "https://anvayuone.app.n8n.cloud")
    N8N_WEBHOOK_OUTBOUND_URL: Optional[str] = os.getenv("N8N_WEBHOOK_OUTBOUND_URL", None)
    WEBHOOK_SECRET: str = os.getenv("WEBHOOK_SECRET", "anvayuone-gmail-webhook-secret-2026")
    
    # IMAP & SMTP for live email operations
    IMAP_HOST: str = os.getenv("IMAP_HOST", "imap.gmail.com")
    IMAP_PORT: int = int(os.getenv("IMAP_PORT", "993"))
    IMAP_USER: Optional[str] = os.getenv("IMAP_USER", "anyaforgerrrr345@gmail.com")
    IMAP_PASSWORD: Optional[str] = os.getenv("IMAP_PASSWORD", os.getenv("GMAIL_APP_PASSWORD", None))
    
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", "anyaforgerrrr345@gmail.com")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", os.getenv("GMAIL_APP_PASSWORD", None))
    SMTP_FROM: str = os.getenv("SMTP_FROM", "anyaforgerrrr345@gmail.com")
    
    # Indian Company Profile - Anvayuone
    COMPANY_NAME: str = os.getenv("COMPANY_NAME", "Anvayuone")
    BOT_NAME: str = os.getenv("BOT_NAME", "Anvayuone bot")
    COMPANY_TAGLINE: str = "AI-Powered B2B Proposal Automation & Digital Engineering"
    COMPANY_EMAIL: str = os.getenv("COMPANY_EMAIL", "anyaforgerrrr345@gmail.com")
    COMPANY_PHONE: str = os.getenv("COMPANY_PHONE", "+91 40 4859 2100")
    COMPANY_MOBILE: str = os.getenv("COMPANY_MOBILE", "+91 98765 43210")
    COMPANY_WEBSITE: str = os.getenv("COMPANY_WEBSITE", "https://anvayuone.com")
    COMPANY_ADDRESS: str = os.getenv(
        "COMPANY_ADDRESS", 
        "Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081, India"
    )
    COMPANY_GSTIN: str = os.getenv("COMPANY_GSTIN", "36AAACN1234F1Z5")
    COMPANY_PAN: str = os.getenv("COMPANY_PAN", "AAACN1234F")
    
    # Banking details for NEFT/RTGS payments
    BANK_NAME: str = os.getenv("BANK_NAME", "HDFC Bank Ltd.")
    BANK_ACCOUNT_NAME: str = os.getenv("BANK_ACCOUNT_NAME", "Anvayuone")
    BANK_ACCOUNT_NUMBER: str = os.getenv("BANK_ACCOUNT_NUMBER", "50200012345678")
    BANK_IFSC: str = os.getenv("BANK_IFSC", "HDFC0001234")
    BANK_BRANCH: str = os.getenv("BANK_BRANCH", "Madhapur Branch, Hyderabad")
    
    # Financial Conventions
    CURRENCY: str = "INR"
    CURRENCY_SYMBOL: str = "₹"
    DEFAULT_GST_RATE: float = 18.0 # Standard Indian GST for IT & Software services
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
