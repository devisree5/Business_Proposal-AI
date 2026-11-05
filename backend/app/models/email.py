import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from backend.app.database import Base

class EmailRecord(Base):
    __tablename__ = "emails"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String(255), unique=True, index=True, nullable=True)
    content_hash = Column(String(64), index=True, nullable=True) # for deduplication
    
    sender_name = Column(String(255), nullable=True)
    sender_email = Column(String(255), nullable=False, index=True)
    subject = Column(String(500), nullable=False)
    body_text = Column(Text, nullable=False)
    received_at = Column(DateTime, default=datetime.utcnow)
    
    # Status: 'new', 'analyzing', 'extracted', 'proposal_generated', 'archived'
    status = Column(String(50), default="new", index=True)
    
    # Structured AI extraction results
    analysis_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
