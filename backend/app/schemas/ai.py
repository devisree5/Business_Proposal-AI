from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ExtractedContact(BaseModel):
    name: Optional[str] = "Customer Contact"
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None

class ExtractedRequirement(BaseModel):
    name: str
    description: Optional[str] = ""
    quantity: float = 1.0
    unit: Optional[str] = "unit"

class AIAnalysisResult(BaseModel):
    client_name: Optional[str] = "Prospective Client"
    client_company: str
    contact: ExtractedContact
    project_name: str
    project_description: str
    features_and_scope: List[str]
    quantities: List[ExtractedRequirement]
    expected_timeline: str
    budget: Optional[str] = None
    additional_requirements: List[str] = []
    missing_information: List[str] = []
    confidence_score: float = 0.95
    ai_model_used: str = "Gemini 1.5 Pro"

class PolishTextRequest(BaseModel):
    text: str
    action: str = "professional" # "professional", "persuasive", "executive", "shorten", "bullet_points"
