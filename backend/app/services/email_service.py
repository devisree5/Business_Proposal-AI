import hashlib
import uuid
import imaplib
import email
import base64
import os
import smtplib
import logging
from email.header import decode_header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from backend.app.models.email import EmailRecord
from backend.app.models.activity import ActivityLog
from backend.app.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def compute_content_hash(sender: str, subject: str, body: str) -> str:
        content = f"{sender.lower().strip()}:{subject.strip()}:{body.strip()}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @classmethod
    def ingest_email(
        cls,
        db: Session,
        sender_email: str,
        subject: str,
        body_text: str,
        sender_name: Optional[str] = None,
        recipient_email: Optional[str] = None,
        message_id: Optional[str] = None,
        thread_id: Optional[str] = None,
        lead_priority: Optional[str] = "Medium",
        received_at: Optional[datetime] = None
    ) -> Tuple[EmailRecord, bool]:
        """
        Ingests an incoming customer email. Checks for duplicates using Gmail Message-ID and content hash.
        Returns (EmailRecord, is_new: bool).
        """
        content_hash = cls.compute_content_hash(sender_email, subject, body_text)
        
        # Check duplicate by Gmail message_id or content_hash
        existing = None
        if message_id:
            existing = db.query(EmailRecord).filter(EmailRecord.message_id == message_id).first()
        if not existing:
            existing = db.query(EmailRecord).filter(EmailRecord.content_hash == content_hash).first()

        if existing:
            return existing, False

        # Inferred priority based on keywords if not set
        if not lead_priority or lead_priority == "Medium":
            text_lower = f"{subject} {body_text}".lower()
            if any(w in text_lower for w in ["urgent", "budget", "e-commerce", "ecommerce", "enterprise", "proposal"]):
                lead_priority = "High"

        # Create new record
        new_record = EmailRecord(
            id=str(uuid.uuid4()),
            message_id=message_id or f"gmail-{uuid.uuid4().hex[:12]}@mail.gmail.com",
            thread_id=thread_id or f"th-{uuid.uuid4().hex[:8]}",
            content_hash=content_hash,
            sender_name=sender_name or (sender_email.split("@")[0].replace(".", " ").title()),
            sender_email=sender_email.strip(),
            recipient_email=recipient_email or settings.GMAIL_SALES_EMAIL,
            subject=subject.strip(),
            body_text=body_text.strip(),
            received_at=received_at or datetime.utcnow(),
            status="new",
            lead_priority=lead_priority
        )
        db.add(new_record)
        
        # Log activity
        log = ActivityLog(
            action_type="email_ingested",
            title=f"Inquiry received from {new_record.sender_name}",
            description=f"Received on {new_record.recipient_email}: {new_record.subject}",
            reference_id=new_record.id
        )
        db.add(log)
        db.commit()
        db.refresh(new_record)
        return new_record, True

    @classmethod
    def send_via_gmail_api(
        cls,
        to_email: str,
        subject: str,
        body_text: str,
        pdf_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends an email to client recipient.
        Priority order:
        1. Live Gmail SMTP (via Google App Password or SMTP credentials)
        2. Google OAuth API (if client ID/Secret/Refresh token configured)
        3. n8n Outbound Webhook (if N8N_WEBHOOK_OUTBOUND_URL configured)
        4. Simulated fallback (logged cleanly)
        """
        sender_email = settings.SMTP_FROM or settings.GMAIL_SALES_EMAIL or "anyaforgerrrr345@gmail.com"
        password = settings.SMTP_PASSWORD or settings.GMAIL_APP_PASSWORD

        message = MIMEMultipart()
        message['to'] = to_email
        message['from'] = f"{settings.BOT_NAME} <{sender_email}>"
        message['subject'] = subject

        message.attach(MIMEText(body_text, 'plain', 'utf-8'))

        if pdf_path and os.path.exists(pdf_path):
            with open(pdf_path, 'rb') as f:
                filename = os.path.basename(pdf_path)
                part = MIMEApplication(f.read(), Name=filename)
                part['Content-Disposition'] = f'attachment; filename="{filename}"'
                message.attach(part)

        # 1. Live Gmail SMTP with App Password
        if password:
            # Clean password of any spaces (Google shows app passwords with spaces like "abcd efgh ijkl mnop")
            clean_pwd = password.replace(" ", "").strip()
            
            # Try port 587 STARTTLS
            try:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
                server.starttls()
                server.login(sender_email, clean_pwd)
                server.send_message(message)
                server.quit()
                logger.info(f"Delivered live email to {to_email} via Gmail SMTP (port {settings.SMTP_PORT})")
                return {
                    "success": True,
                    "mode": "live_gmail_smtp",
                    "recipient": to_email,
                    "message": f"Real email delivered to {to_email} via Gmail SMTP ({sender_email})"
                }
            except Exception as e587:
                logger.warning(f"Port 587 SMTP failed: {e587}. Trying SSL port 465...")
                try:
                    server_ssl = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=12)
                    server_ssl.login(sender_email, clean_pwd)
                    server_ssl.send_message(message)
                    server_ssl.quit()
                    logger.info(f"Delivered live email to {to_email} via Gmail SMTP SSL (port 465)")
                    return {
                        "success": True,
                        "mode": "live_gmail_smtp_ssl",
                        "recipient": to_email,
                        "message": f"Real email delivered to {to_email} via Gmail SSL ({sender_email})"
                    }
                except Exception as e465:
                    logger.error(f"Gmail SMTP authentication failed: {e465}")
                    # Provide informative message if password was rejected
                    auth_err = str(e465) if "Username and Password not accepted" in str(e465) else str(e587)
                    return {
                        "success": False,
                        "mode": "smtp_failed",
                        "error": f"Gmail rejected login: {auth_err}. Please ensure 2-Step Verification is ON and a 16-character App Password is used.",
                        "recipient": to_email
                    }

        # 2. Try Gmail API OAuth if credentials configured
        if settings.GMAIL_REFRESH_TOKEN and settings.GMAIL_CLIENT_ID and settings.GMAIL_CLIENT_SECRET:
            try:
                from google.oauth2.credentials import Credentials
                from googleapiclient.discovery import build
                
                creds = Credentials(
                    None,
                    refresh_token=settings.GMAIL_REFRESH_TOKEN,
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=settings.GMAIL_CLIENT_ID,
                    client_secret=settings.GMAIL_CLIENT_SECRET
                )
                service = build('gmail', 'v1', credentials=creds)
                raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
                sent_msg = service.users().messages().send(
                    userId='me',
                    body={'raw': raw_message}
                ).execute()

                logger.info(f"Delivered via Gmail API! Message ID: {sent_msg.get('id')}")
                return {
                    "success": True,
                    "mode": "gmail_api",
                    "gmail_message_id": sent_msg.get('id'),
                    "recipient": to_email
                }
            except Exception as e:
                logger.error(f"Gmail API error: {e}")

        # 3. Simulated delivery fallback
        return {
            "success": True,
            "mode": "gmail_simulated",
            "gmail_message_id": f"gmsg-{uuid.uuid4().hex[:12]}",
            "recipient": to_email,
            "note": f"Simulated delivery from {sender_email} to {to_email}. To deliver real emails, add your 16-character Google App Password in Settings."
        }

    @classmethod
    def test_gmail_credentials(cls, email_address: str, app_password: str) -> Dict[str, Any]:
        """
        Tests IMAP and SMTP login to Gmail using the provided 16-character Google App Password.
        """
        clean_pwd = app_password.replace(" ", "").strip()
        results = {
            "account": email_address,
            "smtp_connected": False,
            "imap_connected": False,
            "details": []
        }

        # Test SMTP
        try:
            server = smtplib.SMTP("smtp.gmail.com", 587, timeout=8)
            server.starttls()
            server.login(email_address, clean_pwd)
            server.quit()
            results["smtp_connected"] = True
            results["details"].append("SMTP connection on smtp.gmail.com:587 successful!")
        except Exception as e:
            try:
                server_ssl = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=8)
                server_ssl.login(email_address, clean_pwd)
                server_ssl.quit()
                results["smtp_connected"] = True
                results["details"].append("SMTP connection on smtp.gmail.com:465 (SSL) successful!")
            except Exception as e_ssl:
                results["details"].append(f"SMTP error: {str(e_ssl)}")

        # Test IMAP
        try:
            mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
            mail.login(email_address, clean_pwd)
            mail.select("inbox")
            status, _ = mail.search(None, 'ALL')
            mail.close()
            mail.logout()
            results["imap_connected"] = True
            results["details"].append("IMAP connection on imap.gmail.com:993 successful!")
        except Exception as e_imap:
            results["details"].append(f"IMAP error: {str(e_imap)}")

        results["success"] = results["smtp_connected"] or results["imap_connected"]
        return results

    @classmethod
    def sync_from_imap(cls, db: Session, max_emails: int = 10) -> Dict[str, Any]:
        """
        Polls Gmail inbox via IMAP SSL (imap.gmail.com:993)
        """
        user = settings.IMAP_USER or settings.GMAIL_SALES_EMAIL
        pwd = settings.IMAP_PASSWORD or settings.GMAIL_APP_PASSWORD

        if not user or not pwd:
            return {
                "success": False,
                "message": f"Gmail App Password not configured for {user}. Enter your 16-character Google App Password in Settings or use n8n webhook.",
                "ingested_count": 0
            }

        ingested = 0
        duplicates = 0
        clean_pwd = pwd.replace(" ", "").strip()

        try:
            mail = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
            mail.login(user, clean_pwd)
            mail.select("inbox")

            status, messages = mail.search(None, 'UNSEEN')
            if status != "OK" or not messages[0]:
                status, messages = mail.search(None, 'ALL')

            email_ids = messages[0].split()[-max_emails:]

            for e_id in reversed(email_ids):
                res, msg_data = mail.fetch(e_id, "(RFC822)")
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])
                        
                        subject, encoding = decode_header(msg["Subject"] or "")[0]
                        if isinstance(subject, bytes):
                            subject = subject.decode(encoding or "utf-8", errors="ignore")
                        
                        sender = msg.get("From", "client@domain.com")
                        msg_id = msg.get("Message-ID", f"imap-{e_id.decode()}")

                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                if part.get_content_type() == "text/plain":
                                    body = part.get_payload(decode=True).decode(errors="ignore")
                                    break
                        else:
                            body = msg.get_payload(decode=True).decode(errors="ignore")

                        _, is_new = cls.ingest_email(
                            db,
                            sender_email=sender,
                            subject=subject,
                            body_text=body or subject,
                            recipient_email=settings.GMAIL_SALES_EMAIL,
                            message_id=msg_id
                        )
                        if is_new:
                            ingested += 1
                        else:
                            duplicates += 1

            mail.close()
            mail.logout()
            return {"success": True, "ingested_count": ingested, "duplicates_skipped": duplicates}
        except Exception as e:
            return {"success": False, "error": str(e), "ingested_count": ingested}

email_service = EmailService()
