import os
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
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
    prop_data["status"] = "generated"
    
    now = datetime.utcnow()
    if not prop_data.get("created_date"):
        prop_data["created_date"] = now.strftime("%B %d, %Y")
    if not prop_data.get("valid_until"):
        # default 30 days
        prop_data["valid_until"] = (now.replace(day=now.day)).strftime("%B %d, %Y") # or formatted

    # Convert complex lists to dicts for JSON storage
    if "line_items" in prop_data:
        prop_data["line_items"] = [item.model_dump() if hasattr(item, "model_dump") else item for item in prop_data["line_items"]]
    if "timeline_milestones" in prop_data:
        prop_data["timeline_milestones"] = [m.model_dump() if hasattr(m, "model_dump") else m for m in prop_data["timeline_milestones"]]

    prop = Proposal(**prop_data)
    db.add(prop)

    # If linked to email, update email status
    if payload.email_id:
        email = db.query(EmailRecord).filter(EmailRecord.id == payload.email_id).first()
        if email:
            email.status = "proposal_generated"

    # Add activity
    db.add(ActivityLog(
        action_type="proposal_generated",
        title=f"Proposal #{prop.id} generated",
        description=f"Created for {prop.client_company} (${prop.total_amount:,.2f})",
        reference_id=prop.id
    ))
    db.commit()
    db.refresh(prop)
    return prop

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
    
    # Prepare dict representation
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

    # If PDF not yet generated or missing, generate it on demand
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
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    # Ensure PDF exists before emailing
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
