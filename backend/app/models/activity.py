import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from backend.app.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    action_type = Column(String(50), nullable=False) # 'proposal_generated', 'email_analyzed', 'pricing_calculated', 'proposal_sent', etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    reference_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
