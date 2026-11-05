import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, Integer, Boolean, DateTime, JSON, ForeignKey
from backend.app.database import Base

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String(50), primary_key=True) # e.g. PR-2025-001
    version = Column(Integer, default=1) # Version tracking: 1, 2, 3...
    parent_proposal_id = Column(String(50), nullable=True) # Reference to v1 if revised
    
    email_id = Column(String(36), ForeignKey("emails.id"), nullable=True)
    template_id = Column(String(50), default="modern") # 'modern', 'corporate', 'minimal'
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="draft") # 'draft', 'generated', 'sent', 'accepted', 'declined'
    
    # Client Details (Indian Customer)
    client_name = Column(String(255), nullable=True)
    client_company = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=False)
    client_phone = Column(String(100), nullable=True)
    client_address = Column(Text, nullable=True)
    client_gstin = Column(String(50), nullable=True)
    
    # Provider Details (Hyderabad Development Hub)
    sender_company = Column(String(255), default="Anvayuone")
    sender_name = Column(String(255), default="Anvayuone bot")
    sender_email = Column(String(255), default="anyaforgerrrr345@gmail.com")
    sender_phone = Column(String(100), default="+91 40 4859 2100")
    sender_address = Column(Text, default="Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081")
    sender_gstin = Column(String(50), default="36AAACN1234F1Z5")
    sender_pan = Column(String(50), default="AAACN1234F")
    sender_logo = Column(Text, nullable=True)
    accent_color = Column(String(20), default="#2563eb")
    
    # Banking details
    bank_name = Column(String(100), default="HDFC Bank Ltd.")
    bank_account = Column(String(100), default="50200012345678")
    bank_ifsc = Column(String(50), default="HDFC0001234")
    bank_branch = Column(String(100), default="Madhapur Branch, Hyderabad")
    
    # Proposal Meta
    created_date = Column(String(50), nullable=True) # DD/MM/YYYY format
    valid_until = Column(String(50), nullable=True)
    currency = Column(String(10), default="INR")
    currency_symbol = Column(String(5), default="₹")
    
    # Content Sections
    project_overview = Column(Text, nullable=True)
    scope_of_work = Column(Text, nullable=True)
    deliverables = Column(JSON, default=list) # [{title, description}]
    timeline_milestones = Column(JSON, default=list) # [{phase, title, duration, deliverables}]
    
    # Pricing Breakdown in INR + GST
    line_items = Column(JSON, default=list) # [{id, name, description, quantity, unit_price, total, matched_service_id, is_custom}]
    subtotal = Column(Float, default=0.0)
    discount_percent = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    
    # GST Configuration (18% default)
    gst_rate = Column(Float, default=18.0)
    is_interstate = Column(Boolean, default=False) # False -> CGST (9%) + SGST (9%), True -> IGST (18%)
    cgst_amount = Column(Float, default=0.0)
    sgst_amount = Column(Float, default=0.0)
    igst_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0) # Total GST
    total_amount = Column(Float, default=0.0) # Total in INR
    
    # Commercial Terms
    payment_terms = Column(Text, default="50% Advance with Purchase Order, 30% upon UAT deployment, 20% upon final production sign-off. Taxes applicable as per GST norms.")
    terms_and_conditions = Column(Text, default="1. Proposal validity: 30 days from issuance.\n2. Scope adjustments will be documented in a mutual Change Request.\n3. Source code ownership transferred to client upon 100% final settlement.\n4. Dispute jurisdiction subject to Hyderabad courts only.")
    notes = Column(Text, nullable=True)
    
    # Delivery tracking via Gmail API
    pdf_path = Column(String(500), nullable=True)
    sent_at = Column(DateTime, nullable=True)
    sent_to = Column(String(255), nullable=True)
    gmail_message_id = Column(String(255), nullable=True)
    
    # Automatic 3-Day Follow-up Reminder Tracking
    follow_up_due_date = Column(DateTime, nullable=True)
    follow_up_status = Column(String(50), default="none") # 'none', 'pending', 'reminded', 'resolved'
    follow_up_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
