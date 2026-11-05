from pydantic import BaseModel
from typing import Optional, List

class PricingServiceBase(BaseModel):
    code: str
    name: str
    category: str
    description: Optional[str] = None
    unit_type: str = "fixed" # fixed, hourly, per_user, monthly, milestone
    default_rate: float
    default_quantity: float = 1.0
    keywords: List[str] = []
    is_active: bool = True

class PricingServiceCreate(PricingServiceBase):
    pass

class PricingServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    unit_type: Optional[str] = None
    default_rate: Optional[float] = None
    default_quantity: Optional[float] = None
    keywords: Optional[List[str]] = None
    is_active: Optional[bool] = None

class PricingServiceResponse(PricingServiceBase):
    id: str

    class Config:
        from_attributes = True

class MatchRequirementItem(BaseModel):
    requirement_name: str
    description: Optional[str] = ""
    quantity: float = 1.0
    unit: Optional[str] = "unit"

class MatchRequirementsRequest(BaseModel):
    requirements: List[MatchRequirementItem]
    client_budget: Optional[str] = None

class MatchedLineItem(BaseModel):
    id: str
    name: str
    description: str
    unit_type: str
    quantity: float
    unit_price: float
    total: float
    matched_service_id: Optional[str] = None
    matched_service_code: Optional[str] = None
    is_custom: bool = False
    confidence: float = 1.0
    match_status: str = "matched" # "matched" or "unmatched_custom"

class PricingCalculationResponse(BaseModel):
    items: List[MatchedLineItem]
    subtotal: float
    discount_percent: float
    tax_percent: float
    tax_amount: float
    total_amount: float
    currency: str = "USD"
    has_unmatched_items: bool = False
