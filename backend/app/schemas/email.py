from pydantic import BaseModel, EmailStr
from typing import Optional, Any, Dict
from datetime import datetime

class EmailBase(BaseModel):
    sender_name: Optional[str] = None
    sender_email: str
    subject: str
    body_text: str

class EmailCreate(EmailBase):
    message_id: Optional[str] = None

class EmailResponse(EmailBase):
    id: str
    message_id: Optional[str] = None
    received_at: datetime
    status: str
    analysis_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EmailIngestRequest(BaseModel):
    sender_name: Optional[str] = None
    sender_email: str
    subject: str
    body_text: str
    message_id: Optional[str] = None

class EmailSyncRequest(BaseModel):
    source: str = "gmail" # "gmail" or "imap"
    query: Optional[str] = "is:unread proposal OR quote OR service"
