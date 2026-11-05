import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.proposal import Proposal
from backend.app.models.activity import ActivityLog
from backend.app.config import settings
from backend.app.services.email_service import email_service

logger = logging.getLogger(__name__)

class MailerService:
    @staticmethod
    def send_proposal(
        db: Session,
        proposal: Proposal,
        recipient_email: str,
        custom_message: Optional[str] = None,
        pdf_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends the business proposal directly to customer via Gmail API.
        Creates an automatic 3-day follow-up reminder task.
        """
        subject = f"Business Proposal: {proposal.title} [Ref: {proposal.id}]"
        
        default_body = f"""Dear {proposal.client_name or 'Sir/Madam'},

Thank you for your enquiry with {proposal.sender_company}.

Please find attached our formal commercial proposal and statement of work for {proposal.title}.

Key Proposal Highlights:
• Proposal Reference: {proposal.id} (v{proposal.version})
• Project Scope: {proposal.project_overview[:120]}...
• Total Investment: ₹{proposal.total_amount:,.2f} INR (inclusive of 18% GST)
• Proposal Validity: {proposal.valid_until or '30 days from date of issue'}

{custom_message or 'Please review the attached PDF document. We would be pleased to schedule a brief discovery call to answer any technical or commercial queries.'}

Warm regards,
{proposal.sender_name or settings.BOT_NAME}
AI Sales Automation Bot | {proposal.sender_company or settings.COMPANY_NAME}
Hyderabad, India | {proposal.sender_phone or '+91 40 4859 2100'}
Sales Email: {settings.GMAIL_SALES_EMAIL}
"""

        # Dispatch via Gmail API
        delivery_res = email_service.send_via_gmail_api(
            to_email=recipient_email,
            subject=subject,
            body_text=default_body,
            pdf_path=pdf_path or proposal.pdf_path
        )

        now = datetime.utcnow()
        proposal.status = "sent"
        proposal.sent_at = now
        proposal.sent_to = recipient_email
        proposal.gmail_message_id = delivery_res.get("gmail_message_id")

        # Set Automatic 3-Day Follow-Up Reminder (Requested Feature!)
        proposal.follow_up_due_date = now + timedelta(days=3)
        proposal.follow_up_status = "pending"
        proposal.follow_up_notes = f"Follow-up scheduled with {proposal.client_name} ({recipient_email}) regarding {proposal.title}."

        # Add activity record
        activity = ActivityLog(
            action_type="proposal_sent",
            title=f"Proposal {proposal.id} sent via Gmail to {recipient_email}",
            description=f"Delivered via {delivery_res.get('mode', 'gmail_api')}. Total: ₹{proposal.total_amount:,.2f} INR. Automatic follow-up scheduled for {proposal.follow_up_due_date.strftime('%d/%m/%Y')}.",
            reference_id=proposal.id
        )
        db.add(activity)
        db.commit()

        return {
            "success": True,
            "mode": delivery_res.get("mode"),
            "recipient": recipient_email,
            "sent_at": proposal.sent_at.isoformat(),
            "status": "sent",
            "follow_up_due_date": proposal.follow_up_due_date.isoformat(),
            "gmail_message_id": proposal.gmail_message_id
        }

mailer_service = MailerService()
