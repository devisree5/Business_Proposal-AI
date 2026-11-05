from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.database import get_db
from backend.app.models.email import EmailRecord
from backend.app.models.activity import ActivityLog
from backend.app.schemas.email import EmailResponse, EmailIngestRequest, EmailSyncRequest
from backend.app.services.email_service import email_service
from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/api/emails", tags=["Emails"])

@router.get("", response_model=List[EmailResponse])
def get_emails(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(EmailRecord)
    if status and status != "all":
        query = query.filter(EmailRecord.status == status)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (EmailRecord.subject.ilike(search_filter)) |
            (EmailRecord.sender_name.ilike(search_filter)) |
            (EmailRecord.sender_email.ilike(search_filter)) |
            (EmailRecord.body_text.ilike(search_filter))
        )
    return query.order_by(EmailRecord.received_at.desc()).all()

@router.get("/{email_id}", response_model=EmailResponse)
def get_email(email_id: str, db: Session = Depends(get_db)):
    email = db.query(EmailRecord).filter(EmailRecord.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email record not found")
    return email

@router.post("/ingest")
def ingest_email(payload: EmailIngestRequest, db: Session = Depends(get_db)):
    record, is_new = email_service.ingest_email(
        db,
        sender_email=payload.sender_email,
        subject=payload.subject,
        body_text=payload.body_text,
        sender_name=payload.sender_name,
        message_id=payload.message_id
    )
    return {
        "success": True,
        "is_new": is_new,
        "email": record,
        "message": "Email ingested successfully" if is_new else "Duplicate email detected - retrieved existing record"
    }

@router.post("/sync")
def sync_emails(payload: Optional[EmailSyncRequest] = None, db: Session = Depends(get_db)):
    res = email_service.sync_from_imap(db)
    return res

@router.post("/{email_id}/analyze")
def analyze_email(email_id: str, db: Session = Depends(get_db)):
    email = db.query(EmailRecord).filter(EmailRecord.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email record not found")

    email.status = "analyzing"
    db.commit()

    try:
        analysis = ai_service.analyze_email(
            sender_email=email.sender_email,
            subject=email.subject,
            body_text=email.body_text
        )
        email.analysis_json = analysis
        email.status = "extracted"
        
        # Log activity
        db.add(ActivityLog(
            action_type="email_analyzed",
            title=f"Email from {analysis.get('client_company', email.sender_name)} analyzed",
            description=f"Extracted requirements with {int(analysis.get('confidence_score', 0.95)*100)}% confidence",
            reference_id=email.id
        ))
        db.commit()
        db.refresh(email)
        return {
            "success": True,
            "email_id": email.id,
            "status": email.status,
            "analysis": analysis
        }
    except Exception as e:
        email.status = "new"
        db.commit()
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@router.delete("/{email_id}")
def delete_email(email_id: str, db: Session = Depends(get_db)):
    email = db.query(EmailRecord).filter(EmailRecord.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    db.delete(email)
    db.commit()
    return {"success": True, "message": "Email deleted"}
