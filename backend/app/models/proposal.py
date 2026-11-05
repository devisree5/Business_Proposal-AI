import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, JSON, ForeignKey
from backend.app.database import Base

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String(50), primary_key=True) # e.g. PR-2025-001
    email_id = Column(String(36), ForeignKey("emails.id"), nullable=True)
    template_id = Column(String(50), default="modern") # 'modern', 'corporate', 'minimal'
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="draft") # 'draft', 'generated', 'sent', 'accepted', 'declined'
    
    # Client Details
    client_name = Column(String(255), nullable=True)
    client_company = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=False)
    client_phone = Column(String(100), nullable=True)
    client_address = Column(Text, nullable=True)
    
    # Sender Details
    sender_company = Column(String(255), nullable=False)
    sender_name = Column(String(255), nullable=True)
    sender_email = Column(String(255), nullable=False)
    sender_phone = Column(String(100), nullable=True)
    sender_address = Column(Text, nullable=True)
    sender_logo = Column(Text, nullable=True)
    accent_color = Column(String(20), default="#2563eb")
    
    # Proposal Meta
    created_date = Column(String(50), nullable=True)
    valid_until = Column(String(50), nullable=True)
    currency = Column(String(10), default="USD")
    
    # Proposal Content Sections
    project_overview = Column(Text, nullable=True)
    scope_of_work = Column(Text, nullable=True)
    deliverables = Column(JSON, default=list) # List of deliverable objects/strings
    timeline_milestones = Column(JSON, default=list) # List of milestone objects
    
    # Pricing Breakdown
    line_items = Column(JSON, default=list) # [{id, name, description, quantity, unit_price, total, matched_service_id, is_custom}]
    subtotal = Column(Float, default=0.0)
    discount_percent = Column(Float, default=0.0)
    tax_percent = Column(Float, default=10.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    
    # Terms & Conditions
    payment_terms = Column(Text, nullable=True)
    terms_and_conditions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Delivery tracking
    pdf_path = Column(String(500), nullable=True)
    sent_at = Column(DateTime, nullable=True)
    sent_to = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
