from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class LineItemSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    unit_type: Optional[str] = "unit"
    quantity: float = 1.0
    unit_price: float = 0.0
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
    client_name: Optional[str] = None
    client_company: str
    client_email: str
    client_phone: Optional[str] = None
    client_address: Optional[str] = None
    
    sender_company: str = "ProposalGen Solutions Inc."
    sender_name: Optional[str] = "Sarah Jenkins"
    sender_email: str = "sarah.jenkins@proposalgen.ai"
    sender_phone: Optional[str] = "+1 (800) 555-0199"
    sender_address: Optional[str] = "100 Innovation Way, Suite 400, San Francisco, CA"
    sender_logo: Optional[str] = None
    accent_color: str = "#2563eb"
    
    created_date: Optional[str] = None
    valid_until: Optional[str] = None
    currency: str = "USD"
    
    project_overview: Optional[str] = None
    scope_of_work: Optional[str] = None
    deliverables: List[Any] = []
    timeline_milestones: List[MilestoneSchema] = []
    
    line_items: List[LineItemSchema] = []
    subtotal: float = 0.0
    discount_percent: float = 0.0
    tax_percent: float = 10.0
    tax_amount: float = 0.0
    total_amount: float = 0.0
    
    payment_terms: Optional[str] = "30% Upon Kickoff, 40% Mid-Project Milestone, 30% Final Delivery & Acceptance"
    terms_and_conditions: Optional[str] = "Proposals are valid for 30 calendar days from issuance. Changes in scope will be handled through written change orders."
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
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SendProposalRequest(BaseModel):
    recipient_email: str
    recipient_name: Optional[str] = None
    subject: Optional[str] = None
    custom_message: Optional[str] = None
    cc_sender: bool = True
