import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from backend.app.database import get_db
from backend.app.models.proposal import Proposal
from backend.app.models.email import EmailRecord
from backend.app.models.activity import ActivityLog
from backend.app.schemas.proposal import (
    ProposalResponse,
    ProposalCreate,
    ProposalUpdate,
    SendProposalRequest
)
from backend.app.services.pdf_service import pdf_service
from backend.app.services.mailer_service import mailer_service
from backend.app.services.email_service import email_service
from backend.app.config import settings

router = APIRouter(prefix="/api/proposals", tags=["Proposals"])

def generate_proposal_id(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(Proposal).count() + 1
    return f"PR-{year}-{count:03d}"

@router.get("", response_model=List[ProposalResponse])
def get_proposals(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Proposal)
    if status and status != "all":
        query = query.filter(Proposal.status == status)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Proposal.id.ilike(search_filter)) |
            (Proposal.title.ilike(search_filter)) |
            (Proposal.client_company.ilike(search_filter)) |
            (Proposal.client_name.ilike(search_filter))
        )
    return query.order_by(Proposal.created_at.desc()).all()

@router.get("/follow-ups")
def get_follow_up_tasks(db: Session = Depends(get_db)):
    """
    Returns proposals sent > 3 days ago with no response (Automatic Follow-Up Reminder feature)
    """
    now = datetime.utcnow()
    # Find all sent proposals where follow-up is pending or due
    due_proposals = db.query(Proposal).filter(
        Proposal.status == "sent",
        Proposal.follow_up_status.in_(["pending", "reminded"])
    ).all()
    
    return [
        {
            "proposal_id": p.id,
            "version": p.version,
            "client_name": p.client_name,
            "client_company": p.client_company,
            "client_email": p.client_email,
            "total_amount": p.total_amount,
            "sent_at": p.sent_at.isoformat() if p.sent_at else None,
            "due_date": p.follow_up_due_date.isoformat() if p.follow_up_due_date else (now.isoformat()),
            "days_since_sent": (now - p.sent_at).days if p.sent_at else 3,
            "status": p.follow_up_status
        }
        for p in due_proposals
    ]

@router.get("/{proposal_id}", response_model=ProposalResponse)
def get_proposal(proposal_id: str, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return prop

@router.post("", response_model=ProposalResponse)
def create_proposal(payload: ProposalCreate, db: Session = Depends(get_db)):
    new_id = generate_proposal_id(db)
    prop_data = payload.model_dump()
    prop_data["id"] = new_id
    prop_data["version"] = 1
    prop_data["status"] = "generated"
    
    now = datetime.utcnow()
    if not prop_data.get("created_date"):
        prop_data["created_date"] = now.strftime("%d/%m/%Y")
    if not prop_data.get("valid_until"):
        prop_data["valid_until"] = (now + timedelta(days=30)).strftime("%d/%m/%Y")

    if "line_items" in prop_data:
        prop_data["line_items"] = [item.model_dump() if hasattr(item, "model_dump") else item for item in prop_data["line_items"]]
    if "timeline_milestones" in prop_data:
        prop_data["timeline_milestones"] = [m.model_dump() if hasattr(m, "model_dump") else m for m in prop_data["timeline_milestones"]]

    prop = Proposal(**prop_data)
    db.add(prop)

    # Link to email record and mark as proposal_ready
    if payload.email_id:
        email = db.query(EmailRecord).filter(EmailRecord.id == payload.email_id).first()
        if email:
            email.status = "proposal_ready"

    db.add(ActivityLog(
        action_type="proposal_generated",
        title=f"Proposal #{prop.id} (v1) created",
        description=f"Generated for {prop.client_company} (₹{prop.total_amount:,.2f} INR)",
        reference_id=prop.id
    ))
    db.commit()
    db.refresh(prop)
    return prop

@router.post("/{proposal_id}/revise", response_model=ProposalResponse)
def create_revised_version(proposal_id: str, db: Session = Depends(get_db)):
    """
    Proposal Version Tracking: Preserves original version and branches into v2, v3, etc.
    """
    original = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Original proposal not found")

    revised_version = original.version + 1
    revised_id = f"{original.id.split('-v')[0]}-v{revised_version}"

    prop_dict = {c.name: getattr(original, c.name) for c in original.__table__.columns if c.name not in ["created_at", "updated_at"]}
    prop_dict["id"] = revised_id
    prop_dict["version"] = revised_version
    prop_dict["parent_proposal_id"] = original.id
    prop_dict["status"] = "draft"
    prop_dict["pdf_path"] = None

    revised_prop = Proposal(**prop_dict)
    db.add(revised_prop)

    db.add(ActivityLog(
        action_type="proposal_generated",
        title=f"Revision {revised_id} created",
        description=f"Branched from {original.id} for price/scope negotiation",
        reference_id=revised_id
    ))
    db.commit()
    db.refresh(revised_prop)
    return revised_prop

@router.put("/{proposal_id}", response_model=ProposalResponse)
def update_proposal(proposal_id: str, payload: ProposalUpdate, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    update_dict = payload.model_dump(exclude_unset=True)
    if "line_items" in update_dict:
        update_dict["line_items"] = [item.model_dump() if hasattr(item, "model_dump") else item for item in update_dict["line_items"]]
    if "timeline_milestones" in update_dict:
        update_dict["timeline_milestones"] = [m.model_dump() if hasattr(m, "model_dump") else m for m in update_dict["timeline_milestones"]]

    for key, val in update_dict.items():
        setattr(prop, key, val)

    prop.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prop)
    return prop

@router.delete("/{proposal_id}")
def delete_proposal(proposal_id: str, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    db.delete(prop)
    db.commit()
    return {"success": True, "message": "Proposal deleted"}

@router.get("/{proposal_id}/preview-html", response_class=HTMLResponse)
def preview_proposal_html(
    proposal_id: str,
    template: Optional[str] = None,
    db: Session = Depends(get_db)
):
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    prop_data = {c.name: getattr(prop, c.name) for c in prop.__table__.columns}
    active_template = template or prop.template_id or "modern"
    html_content = pdf_service.render_html(prop_data, active_template)
    return HTMLResponse(content=html_content)

@router.post("/{proposal_id}/generate-pdf")
def generate_proposal_pdf(
    proposal_id: str,
    template: Optional[str] = None,
    db: Session = Depends(get_db)
):
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    prop_data = {c.name: getattr(prop, c.name) for c in prop.__table__.columns}
    active_template = template or prop.template_id or "modern"
    pdf_path = pdf_service.generate_pdf(prop_data, active_template)
    
    prop.pdf_path = pdf_path
    db.commit()

    return {
        "success": True,
        "proposal_id": prop.id,
        "template": active_template,
        "pdf_path": pdf_path,
        "download_url": f"/api/proposals/{prop.id}/download-pdf"
    }

@router.get("/{proposal_id}/download-pdf")
def download_proposal_pdf(proposal_id: str, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    pdf_path = prop.pdf_path
    if not pdf_path or not os.path.exists(pdf_path):
        prop_data = {c.name: getattr(prop, c.name) for c in prop.__table__.columns}
        pdf_path = pdf_service.generate_pdf(prop_data, prop.template_id or "modern")
        prop.pdf_path = pdf_path
        db.commit()

    filename = f"{prop.id}_{prop.client_company.replace(' ', '_')}_Proposal.pdf"
    if pdf_path.endswith(".html"):
        return FileResponse(pdf_path, media_type="text/html", filename=filename.replace(".pdf", ".html"))
    return FileResponse(pdf_path, media_type="application/pdf", filename=filename)

@router.post("/{proposal_id}/send")
def send_proposal_email(
    proposal_id: str,
    payload: SendProposalRequest,
    db: Session = Depends(get_db)
):
    """
    Sends the approved proposal to customer email (rahul@abcsolutions.in) via Gmail API.
    """
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if not prop.pdf_path or not os.path.exists(prop.pdf_path):
        prop_data = {c.name: getattr(prop, c.name) for c in prop.__table__.columns}
        prop.pdf_path = pdf_service.generate_pdf(prop_data, prop.template_id)
        db.commit()

    result = mailer_service.send_proposal(
        db,
        proposal=prop,
        recipient_email=payload.recipient_email,
        custom_message=payload.custom_message,
        pdf_path=prop.pdf_path
    )
    return result

@router.post("/{proposal_id}/send-follow-up")
def send_follow_up_email(proposal_id: str, db: Session = Depends(get_db)):
    """
    Sends an automated follow-up email if customer hasn't responded after 3 days.
    """
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    subject = f"Gentle Follow-Up: Proposal for {prop.title} [Ref: {prop.id}]"
    body = f"""Dear {prop.client_name or 'Sir/Madam'},

I hope this email finds you well.

I am writing to follow up on the business proposal for '{prop.title}' (Ref: {prop.id}) sent on {prop.sent_at.strftime('%d/%m/%Y') if prop.sent_at else 'recently'}.

We would love to know if you had a chance to review the scope and pricing (₹{prop.total_amount:,.2f} INR). Please let us know if you have any questions or if you'd like to adjust any milestones to fit your 60-day launch schedule.

Warm regards,
{prop.sender_name or 'Anya Sharma'}
{prop.sender_company} | {settings.GMAIL_SALES_EMAIL}
"""

    res = email_service.send_via_gmail_api(
        to_email=prop.client_email,
        subject=subject,
        body_text=body,
        pdf_path=prop.pdf_path
    )

    prop.follow_up_status = "reminded"
    db.add(ActivityLog(
        action_type="follow_up_sent",
        title=f"Follow-up email delivered to {prop.client_name}",
        description=f"Checked in regarding {prop.id} via {res.get('mode')}",
        reference_id=prop.id
    ))
    db.commit()
    return {"success": True, "message": f"Follow-up email dispatched to {prop.client_email}"}
