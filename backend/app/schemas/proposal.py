from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class LineItemSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    unit_type: Optional[str] = "unit"
    quantity: float = 1.0
    unit_price: float = 0.0 # INR
    total: float = 0.0
    matched_service_id: Optional[str] = None
    is_custom: bool = False

class MilestoneSchema(BaseModel):
    phase: str
    title: str
    duration: str
    deliverables: str

class ProposalBase(BaseModel):
    template_id: str = "modern" # modern, corporate, minimal
    title: str
    version: int = 1
    parent_proposal_id: Optional[str] = None
    
    # Client Details
    client_name: Optional[str] = None
    client_company: str
    client_email: str
    client_phone: Optional[str] = None
    client_address: Optional[str] = None
    client_gstin: Optional[str] = None
    
    # Provider Details (Hyderabad IT Hub)
    sender_company: str = "Nexura Technologies Pvt. Ltd."
    sender_name: Optional[str] = "Anya Sharma"
    sender_email: str = "anyaforgerrrr345@gmail.com"
    sender_phone: Optional[str] = "+91 40 4859 2100"
    sender_address: Optional[str] = "Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081"
    sender_gstin: Optional[str] = "36AAACN1234F1Z5"
    sender_pan: Optional[str] = "AAACN1234F"
    accent_color: str = "#2563eb"
    
    created_date: Optional[str] = None
    valid_until: Optional[str] = None
    currency: str = "INR"
    currency_symbol: str = "₹"
    
    # Content
    project_overview: Optional[str] = None
    scope_of_work: Optional[str] = None
    deliverables: List[Any] = []
    timeline_milestones: List[MilestoneSchema] = []
    
    # Financials
    line_items: List[LineItemSchema] = []
    subtotal: float = 0.0
    discount_percent: float = 0.0
    discount_amount: float = 0.0
    
    # GST
    gst_rate: float = 18.0
    is_interstate: bool = False
    cgst_amount: float = 0.0
    sgst_amount: float = 0.0
    igst_amount: float = 0.0
    tax_amount: float = 0.0
    total_amount: float = 0.0
    
    # Commercial Terms
    payment_terms: Optional[str] = "50% Advance with Purchase Order, 30% upon UAT deployment, 20% upon final sign-off. Taxes applicable as per GST norms."
    terms_and_conditions: Optional[str] = "1. Proposal valid for 30 calendar days.\n2. Scope additions handled via written change request.\n3. Dispute jurisdiction subject to Hyderabad courts only."
    notes: Optional[str] = None

class ProposalCreate(ProposalBase):
    email_id: Optional[str] = None

class ProposalUpdate(ProposalBase):
    status: Optional[str] = None

class ProposalResponse(ProposalBase):
    id: str
    email_id: Optional[str] = None
    status: str
    pdf_path: Optional[str] = None
    sent_at: Optional[datetime] = None
    sent_to: Optional[str] = None
    gmail_message_id: Optional[str] = None
    follow_up_due_date: Optional[datetime] = None
    follow_up_status: Optional[str] = "none"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SendProposalRequest(BaseModel):
    recipient_email: str
    recipient_name: Optional[str] = None
    subject: Optional[str] = None
    custom_message: Optional[str] = None
    send_via_gmail_api: bool = True
