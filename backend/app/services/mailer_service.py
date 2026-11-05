import smtplib
import os
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.proposal import Proposal
from backend.app.models.activity import ActivityLog
from backend.app.config import settings

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
        Sends the proposal to the client with optional PDF attachment.
        If SMTP credentials are provided, delivers via real SMTP server.
        Otherwise records delivery with timestamp and tracking status.
        """
        subject = f"Business Proposal: {proposal.title} [Ref: {proposal.id}]"
        
        default_body = f"""Dear {proposal.client_name or 'Client'},

Thank you for your inquiry. Please find attached our formal proposal for {proposal.project_overview[:100]}...

Key Highlights:
• Proposal ID: {proposal.id}
• Total Investment: ${proposal.total_amount:,.2f} {proposal.currency}
• Validity: {proposal.valid_until or '30 days from issue'}

{custom_message or 'Please review the attached document and let us know if you have any questions or would like to schedule a review call.'}

Warm regards,
{proposal.sender_name or 'Solutions Team'}
{proposal.sender_company}
{proposal.sender_email} | {proposal.sender_phone or '+1 (800) 555-0199'}
"""

        delivery_mode = "simulated"
        error_detail = None

        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                msg = MIMEMultipart()
                msg['From'] = settings.SMTP_FROM or settings.SMTP_USER
                msg['To'] = recipient_email
                msg['Subject'] = subject
                msg.attach(MIMEText(default_body, 'plain'))

                if pdf_path and os.path.exists(pdf_path) and pdf_path.endswith(".pdf"):
                    with open(pdf_path, "rb") as f:
                        part = MIMEApplication(f.read(), Name=os.path.basename(pdf_path))
                        part['Content-Disposition'] = f'attachment; filename="{os.path.basename(pdf_path)}"'
                        msg.attach(part)

                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
                server.quit()
                delivery_mode = "smtp"
            except Exception as e:
                logger.error(f"SMTP delivery failed: {e}")
                delivery_mode = "simulated_fallback"
                error_detail = str(e)

        # Update proposal state
        proposal.status = "sent"
        proposal.sent_at = datetime.utcnow()
        proposal.sent_to = recipient_email

        # Add activity record
        activity = ActivityLog(
            action_type="proposal_sent",
            title=f"Proposal {proposal.id} sent to {recipient_email}",
            description=f"Status: Sent via {delivery_mode}. Value: ${proposal.total_amount:,.2f}",
            reference_id=proposal.id
        )
        db.add(activity)
        db.commit()

        return {
            "success": True,
            "delivery_mode": delivery_mode,
            "recipient": recipient_email,
            "sent_at": proposal.sent_at.isoformat(),
            "status": "sent",
            "error_detail": error_detail
        }

mailer_service = MailerService()
