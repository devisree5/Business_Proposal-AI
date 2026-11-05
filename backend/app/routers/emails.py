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
@router.post("/webhook")
@router.post("/webhook/n8n")
async def gmail_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Automated Webhook endpoint for n8n Gmail Trigger (https://anvayuone.app.n8n.cloud)
    Automatically parses incoming customer emails, extracts requirements with AI, and registers deal in Sales Inbox!
    """
    try:
        raw_body = await request.json()
        # Handle if n8n sends a single object or a list of items
        payload = raw_body[0] if isinstance(raw_body, list) and len(raw_body) > 0 else raw_body

        from_raw = payload.get("from") or payload.get("sender_email") or payload.get("sender") or ""
        sender_email = "customer@client.in"
        sender_name = "Prospective Client"

        if isinstance(from_raw, dict):
            # n8n nested format: {"value": [{"address": "...", "name": "..."}]}
            if "value" in from_raw and isinstance(from_raw["value"], list) and len(from_raw["value"]) > 0:
                sender_email = from_raw["value"][0].get("address") or sender_email
                sender_name = from_raw["value"][0].get("name") or sender_name
            elif "text" in from_raw:
                from_raw = from_raw["text"]
        
        if isinstance(from_raw, str) and from_raw:
            import re
            email_match = re.search(r'<([^>]+)>', from_raw)
            if email_match:
                sender_email = email_match.group(1).strip()
                sender_name = from_raw.split('<')[0].strip(' "') or sender_email.split('@')[0].capitalize()
            elif "@" in from_raw:
                sender_email = from_raw.strip()
                sender_name = sender_email.split('@')[0].replace('.', ' ').title()

        if payload.get("from_name"):
            sender_name = payload["from_name"]
        elif payload.get("sender_name"):
            sender_name = payload["sender_name"]

        subject = payload.get("subject") or "Business Requirement & Proposal Request"
        body_text = payload.get("text") or payload.get("body") or payload.get("snippet") or payload.get("textAsHtml") or subject
        message_id = payload.get("messageId") or payload.get("message_id") or payload.get("id")
        thread_id = payload.get("threadId") or payload.get("thread_id")

        record, is_new = email_service.ingest_email(
            db,
            sender_email=sender_email,
            subject=subject,
            body_text=body_text,
            sender_name=sender_name,
            recipient_email=settings.GMAIL_SALES_EMAIL,
            message_id=message_id,
            thread_id=thread_id
        )

        # Auto-run AI requirement extraction for fresh inbound emails
        if is_new:
            try:
                analysis = ai_service.analyze_email(
                    sender_email=record.sender_email,
                    subject=record.subject,
                    body_text=record.body_text
                )
                record.analysis_json = analysis
                record.status = "analyzed"
                if analysis.get("lead_priority"):
                    record.lead_priority = analysis["lead_priority"]
                if analysis.get("priority_rationale"):
                    record.priority_rationale = analysis["priority_rationale"]
                db.commit()
                db.refresh(record)
            except Exception as e_ai:
                logger.warning(f"Auto-analysis on webhook ingest error: {e_ai}")

        return {
            "success": True,
            "is_new": is_new,
            "email_id": record.id,
            "client_name": record.sender_name,
            "sender_email": record.sender_email,
            "subject": record.subject,
            "lead_priority": record.lead_priority,
            "status": record.status,
            "company": settings.COMPANY_NAME,
            "bot": settings.BOT_NAME
        }
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
