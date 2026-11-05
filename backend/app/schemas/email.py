from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class EmailBase(BaseModel):
    sender_name: Optional[str] = None
    sender_email: str
    recipient_email: Optional[str] = "anyaforgerrrr345@gmail.com"
    subject: str
    body_text: str

class EmailCreate(EmailBase):
    message_id: Optional[str] = None
    thread_id: Optional[str] = None
    lead_priority: Optional[str] = "Medium"

class EmailResponse(EmailBase):
    id: str
    message_id: Optional[str] = None
    thread_id: Optional[str] = None
    received_at: datetime
    status: str
    lead_priority: Optional[str] = "Medium"
    priority_rationale: Optional[str] = None
    analysis_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EmailIngestRequest(BaseModel):
    sender_name: Optional[str] = None
    sender_email: str
    recipient_email: Optional[str] = "anyaforgerrrr345@gmail.com"
    subject: str
    body_text: str
    message_id: Optional[str] = None
    thread_id: Optional[str] = None

class EmailPriorityUpdate(BaseModel):
    lead_priority: str
