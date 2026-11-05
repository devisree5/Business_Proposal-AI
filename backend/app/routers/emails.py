from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.database import get_db
from backend.app.models.email import EmailRecord
from backend.app.models.activity import ActivityLog
from backend.app.schemas.email import EmailResponse, EmailIngestRequest, EmailPriorityUpdate
from backend.app.services.email_service import email_service
from backend.app.services.ai_service import ai_service
from backend.app.config import settings

router = APIRouter(prefix="/api/emails", tags=["Emails"])

@router.get("", response_model=List[EmailResponse])
def get_emails(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(EmailRecord)
    if status and status != "all":
        query = query.filter(EmailRecord.status == status)
    if priority and priority != "all":
        query = query.filter(EmailRecord.lead_priority == priority)
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
    record = db.query(EmailRecord).filter(EmailRecord.id == email_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Email record not found")
    return record

@router.post("/ingest")
def ingest_email(payload: EmailIngestRequest, db: Session = Depends(get_db)):
    """
    Ingests an email into the sales inbox (checks Gmail Message-ID and content hash for deduplication).
    """
    record, is_new = email_service.ingest_email(
        db,
        sender_email=payload.sender_email,
        subject=payload.subject,
        body_text=payload.body_text,
        sender_name=payload.sender_name,
        recipient_email=payload.recipient_email or settings.GMAIL_SALES_EMAIL,
        message_id=payload.message_id,
        thread_id=payload.thread_id
    )
    return {
        "success": True,
        "is_new": is_new,
        "email": record,
        "message": "Email ingested into Sales Inbox" if is_new else "Duplicate email detected - retrieved existing record"
    }

@router.post("/webhook/gmail")
async def gmail_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Automated Webhook endpoint for n8n Gmail Trigger or Google Cloud Pub/Sub.
    Automatically parses incoming Gmail messages without manual sync buttons!
    """
    try:
        body = await request.json()
        sender_email = body.get("from") or body.get("sender_email") or "customer@client.in"
        sender_name = body.get("from_name") or body.get("sender_name")
        subject = body.get("subject", "Business Enquiry")
        body_text = body.get("body") or body.get("text") or body.get("snippet", "")
        message_id = body.get("message_id") or body.get("id")

        record, is_new = email_service.ingest_email(
            db,
            sender_email=sender_email,
            subject=subject,
            body_text=body_text,
            sender_name=sender_name,
            recipient_email=settings.GMAIL_SALES_EMAIL,
            message_id=message_id
        )

        return {"success": True, "is_new": is_new, "email_id": record.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook ingestion error: {str(e)}")

@router.post("/sync")
def sync_emails(db: Session = Depends(get_db)):
    res = email_service.sync_from_imap(db)
    return res

@router.put("/{email_id}/priority")
def update_email_priority(email_id: str, payload: EmailPriorityUpdate, db: Session = Depends(get_db)):
    """
    Allows sales employee to override AI's suggested lead priority (High/Medium/Low)
    """
    record = db.query(EmailRecord).filter(EmailRecord.id == email_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Email record not found")
    record.lead_priority = payload.lead_priority
    db.commit()
    db.refresh(record)
    return {"success": True, "lead_priority": record.lead_priority}

@router.post("/{email_id}/analyze")
def analyze_email(email_id: str, db: Session = Depends(get_db)):
    """
    Executes AI extraction with Gemini / Heuristic engine
    """
    email_rec = db.query(EmailRecord).filter(EmailRecord.id == email_id).first()
    if not email_rec:
        raise HTTPException(status_code=404, detail="Email record not found")

    email_rec.status = "analyzing"
    db.commit()

    try:
        analysis = ai_service.analyze_email(
            sender_email=email_rec.sender_email,
            subject=email_rec.subject,
            body_text=email_rec.body_text
        )
        email_rec.analysis_json = analysis
        email_rec.status = "analyzed"
        if analysis.get("lead_priority"):
            email_rec.lead_priority = analysis["lead_priority"]
        if analysis.get("priority_rationale"):
            email_rec.priority_rationale = analysis["priority_rationale"]
        
        db.add(ActivityLog(
            action_type="email_analyzed",
            title=f"Enquiry from {analysis.get('client_company', email_rec.sender_name)} analyzed",
            description=f"Extracted {len(analysis.get('features_and_scope', []))} features. Priority: {email_rec.lead_priority}",
            reference_id=email_rec.id
        ))
        db.commit()
        db.refresh(email_rec)
        return {
            "success": True,
            "email_id": email_rec.id,
            "status": email_rec.status,
            "analysis": analysis
        }
    except Exception as e:
        email_rec.status = "new"
        db.commit()
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@router.delete("/{email_id}")
def delete_email(email_id: str, db: Session = Depends(get_db)):
    email_rec = db.query(EmailRecord).filter(EmailRecord.id == email_id).first()
    if not email_rec:
        raise HTTPException(status_code=404, detail="Email not found")
    db.delete(email_rec)
    db.commit()
    return {"success": True, "message": "Email deleted from inbox"}
