import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from backend.app.database import Base

class EmailRecord(Base):
    __tablename__ = "emails"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String(255), unique=True, index=True, nullable=True) # Gmail Message-ID
    thread_id = Column(String(255), index=True, nullable=True) # Gmail Thread ID
    content_hash = Column(String(64), index=True, nullable=True) # SHA-256 for duplicate detection
    
    sender_name = Column(String(255), nullable=True)
    sender_email = Column(String(255), nullable=False, index=True)
    recipient_email = Column(String(255), default="anyaforgerrrr345@gmail.com")
    subject = Column(String(500), nullable=False)
    body_text = Column(Text, nullable=False)
    received_at = Column(DateTime, default=datetime.utcnow)
    
    # Status: 'new', 'analyzing', 'extracted', 'proposal_ready', 'sent'
    status = Column(String(50), default="new", index=True)
    
    # Lead Classification: 'High', 'Medium', 'Low'
    lead_priority = Column(String(20), default="Medium")
    priority_rationale = Column(String(500), nullable=True)
    
    # Structured AI extraction results
    analysis_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
