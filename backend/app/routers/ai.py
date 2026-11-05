from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
from backend.app.services.ai_service import ai_service
from backend.app.schemas.ai import PolishTextRequest

router = APIRouter(prefix="/api/ai", tags=["AI"])

class RawAnalysisRequest(BaseModel):
    sender_email: str
    subject: str
    body_text: str

@router.post("/analyze-raw")
def analyze_raw_email(payload: RawAnalysisRequest):
    result = ai_service.analyze_email(
        sender_email=payload.sender_email,
        subject=payload.subject,
        body_text=payload.body_text
    )
    return result

@router.post("/polish")
def polish_text(payload: PolishTextRequest):
    enhanced = ai_service.polish_proposal_text(payload.text, payload.action)
    return {"original": payload.text, "action": payload.action, "polished": enhanced}
