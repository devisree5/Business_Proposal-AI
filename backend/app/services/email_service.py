import hashlib
import uuid
import imaplib
import email
from email.header import decode_header
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from backend.app.models.email import EmailRecord
from backend.app.models.activity import ActivityLog
from backend.app.config import settings

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
        message_id: Optional[str] = None,
        received_at: Optional[datetime] = None
    ) -> Tuple[EmailRecord, bool]:
        """
        Ingests an incoming email. Checks for duplicates using message_id and content hash.
        Returns (EmailRecord, is_new: bool).
        """
        content_hash = cls.compute_content_hash(sender_email, subject, body_text)
        
        # Check duplicate by message_id or content_hash
        existing = None
        if message_id:
            existing = db.query(EmailRecord).filter(EmailRecord.message_id == message_id).first()
        if not existing:
            existing = db.query(EmailRecord).filter(EmailRecord.content_hash == content_hash).first()

        if existing:
            # Duplicate found!
            return existing, False

        # Create new record
        new_record = EmailRecord(
            id=str(uuid.uuid4()),
            message_id=message_id or f"msg-{uuid.uuid4().hex[:12]}@ingest.local",
            content_hash=content_hash,
            sender_name=sender_name or (sender_email.split("@")[0].replace(".", " ").title()),
            sender_email=sender_email.strip(),
            subject=subject.strip(),
            body_text=body_text.strip(),
            received_at=received_at or datetime.utcnow(),
            status="new"
        )
        db.add(new_record)
        
        # Log activity
        log = ActivityLog(
            action_type="email_ingested",
            title=f"Inbound Request from {new_record.sender_name}",
            description=f"Received: {new_record.subject}",
            reference_id=new_record.id
        )
        db.add(log)
        db.commit()
        db.refresh(new_record)
        return new_record, True

    @classmethod
    def sync_from_imap(cls, db: Session, max_emails: int = 10) -> Dict[str, Any]:
        """
        Connects to IMAP server, queries inbox, extracts B2B inquiries and avoids duplicates.
        """
        if not settings.IMAP_HOST or not settings.IMAP_USER or not settings.IMAP_PASSWORD:
            return {
                "success": False,
                "message": "IMAP credentials not fully configured in environment. Using smart simulation mode.",
                "ingested_count": 0
            }

        ingested = 0
        duplicates = 0
        try:
            mail = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
            mail.login(settings.IMAP_USER, settings.IMAP_PASSWORD)
            mail.select("inbox")

            status, messages = mail.search(None, '(OR SUBJECT "proposal" SUBJECT "quote")')
            if status != "OK" or not messages[0]:
                status, messages = mail.search(None, 'UNSEEN')

            email_ids = messages[0].split()[-max_emails:]

            for e_id in reversed(email_ids):
                res, msg_data = mail.fetch(e_id, "(RFC822)")
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])
                        
                        subject, encoding = decode_header(msg["Subject"] or "")[0]
                        if isinstance(subject, bytes):
                            subject = subject.decode(encoding or "utf-8", errors="ignore")
                        
                        sender = msg.get("From", "unknown@client.com")
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
