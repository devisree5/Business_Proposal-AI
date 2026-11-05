from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.models.pricing import PricingService
from backend.app.models.email import EmailRecord
from backend.app.models.proposal import Proposal
from backend.app.models.activity import ActivityLog
from backend.app.services.email_service import EmailService

DEFAULT_CATALOGUE = [
    {
        "code": "LIC-ENT",
        "name": "Enterprise Professional License",
        "category": "Software Licensing",
        "description": "Annual enterprise seat license with advanced permissions, SSO, and admin console",
        "unit_type": "per_user",
        "default_rate": 240.0,
        "default_quantity": 50.0,
        "keywords": ["license", "licenses", "seat", "seats", "user", "users", "subscription"]
    },
    {
        "code": "CLD-ARCH",
        "name": "Cloud Infrastructure & High-Availability Architecture",
        "category": "Cloud & DevOps",
        "description": "Multi-region redundant cloud environment setup with Terraform and Kubernetes orchestration",
        "unit_type": "fixed",
        "default_rate": 6500.0,
        "default_quantity": 1.0,
        "keywords": ["cloud", "aws", "azure", "gcp", "infrastructure", "kubernetes", "terraform", "hosting"]
    },
    {
        "code": "APP-CUSTOM",
        "name": "Custom Web Application Engineering",
        "category": "Software Engineering",
        "description": "Full-stack web application development, responsive design, backend API & integration",
        "unit_type": "fixed",
        "default_rate": 12500.0,
        "default_quantity": 1.0,
        "keywords": ["custom", "web application", "app", "portal", "platform", "software", "solution", "dashboard"]
    },
    {
        "code": "SEC-AUDIT",
        "name": "Enterprise Security Audit & Compliance Assessment",
        "category": "Security & Compliance",
        "description": "End-to-end vulnerability scanning, penetration testing, and SOC2/GDPR compliance verification",
        "unit_type": "fixed",
        "default_rate": 4500.0,
        "default_quantity": 1.0,
        "keywords": ["security", "audit", "compliance", "soc2", "gdpr", "penetration", "vulnerability"]
    },
    {
        "code": "API-INT",
        "name": "Enterprise API & Systems Integration",
        "category": "Software Engineering",
        "description": "Seamless two-way integration with CRM, ERP, payment gateways, and third-party webhooks",
        "unit_type": "fixed",
        "default_rate": 3500.0,
        "default_quantity": 1.0,
        "keywords": ["api", "integration", "crm", "erp", "webhook", "endpoints", "sync"]
    },
    {
        "code": "AI-LLM",
        "name": "Custom AI & LLM Automation Workflow",
        "category": "AI & Automation",
        "description": "Implementation of intelligent agents, RAG pipeline, and automated document generation",
        "unit_type": "fixed",
        "default_rate": 8000.0,
        "default_quantity": 1.0,
        "keywords": ["ai", "llm", "generative", "rag", "agents", "automation", "gemini", "gpt"]
    },
    {
        "code": "UI-DESIGN",
        "name": "B2B UI/UX Design System & Prototyping",
        "category": "Design & UX",
        "description": "Figma component system, user journey mapping, and high-fidelity interactive prototypes",
        "unit_type": "fixed",
        "default_rate": 4000.0,
        "default_quantity": 1.0,
        "keywords": ["design", "ui", "ux", "prototype", "figma", "interface", "branding"]
    },
    {
        "code": "DB-MIG",
        "name": "Database Migration & Data Optimization",
        "category": "Cloud & DevOps",
        "description": "Zero-downtime database migration, indexing, partitioning, and schema restructuring",
        "unit_type": "fixed",
        "default_rate": 3200.0,
        "default_quantity": 1.0,
        "keywords": ["database", "migration", "postgres", "sql", "data", "schema", "etl"]
    },
    {
        "code": "SLA-247",
        "name": "24/7 Dedicated Enterprise Support SLA",
        "category": "Support & Maintenance",
        "description": "Round-the-clock priority incident response (15-min SLA), dedicated account manager",
        "unit_type": "monthly",
        "default_rate": 1500.0,
        "default_quantity": 12.0,
        "keywords": ["support", "sla", "maintenance", "24/7", "monitoring", "uptime"]
    },
    {
        "code": "TRN-ONBOARD",
        "name": "Enterprise Training & User Onboarding",
        "category": "Consulting & Enablement",
        "description": "Hands-on team workshops, administrator training sessions, and customized documentation",
        "unit_type": "fixed",
        "default_rate": 2000.0,
        "default_quantity": 1.0,
        "keywords": ["training", "onboarding", "workshop", "documentation", "enablement"]
    }
]

SAMPLE_EMAILS = [
    {
        "sender_name": "Marcus Vance",
        "sender_email": "marcus.vance@acmecorp.com",
        "subject": "Request for Proposal - Enterprise Licenses & Cloud Setup",
        "body_text": """Hi Sales Team,

We are currently evaluating solutions to upgrade our company infrastructure. We need a formal proposal for 500 professional user licenses for our global team.

In addition, we require high-availability cloud architecture setup on AWS with automated CI/CD pipelines and role-based access control. Security is critical, so we will also require an Enterprise Security Audit & Compliance assessment before rollout.

Our target timeline is to commence within the next 4 weeks and complete deployment before Q4. We have an allocated budget of approximately $50,000 to $65,000 for this initiative.

Could you please send over a detailed itemized quote and project timeline?

Best regards,
Marcus Vance
VP of Engineering | Acme Corporation
+1 (415) 882-9011""",
        "status": "new",
        "minutes_ago": 2
    },
    {
        "sender_name": "Elena Rostova",
        "sender_email": "elena.r@globaltech.io",
        "subject": "Inquiry: Custom Solution for Remote Teams",
        "body_text": """Hello,

Global Tech Ltd is looking for a custom solution for our distributed remote teams across 6 timezones.

We require a custom full-stack web application with responsive dashboard, team collaboration features, and seamless two-way API integration with our existing CRM and Slack. We also require a complete B2B UI/UX design system in Figma.

Could you provide a breakdown of costs and delivery milestones? We are hoping for a 6 to 8 week turnaround.

Thanks,
Elena Rostova
Director of Operations, Global Tech Ltd
elena.r@globaltech.io""",
        "status": "new",
        "minutes_ago": 8
    },
    {
        "sender_name": "David Miller",
        "sender_email": "david.m@moderntools.com",
        "subject": "Cloud Services & Infrastructure Migration Quote",
        "body_text": """Hi team,

Can you send a proposal for your cloud services? We are planning a full database migration from legacy on-prem MySQL to managed AWS cloud, along with setting up redundant cloud infrastructure.

Additionally, we need a 24/7 Dedicated Support SLA for 12 months post-migration.

We need this finalized by end of this month. Budget is flexible around $30k.

Regards,
David Miller
IT Infrastructure Lead, Modern Tools Inc""",
        "status": "analyzing",
        "minutes_ago": 15
    },
    {
        "sender_name": "Samantha Chen",
        "sender_email": "schen@deltasolutions.com",
        "subject": "Enterprise Package & Security Hardening",
        "body_text": """Dear ProposalGen Team,

We need a detailed quote for an enterprise package including custom AI automation workflow implementation, enterprise security audit, and staff onboarding & training for 40 managers.

Please include payment schedule and terms in the proposal document.

Sincerely,
Samantha Chen
Delta Solutions
schen@deltasolutions.com""",
        "status": "processed",
        "minutes_ago": 60
    }
]

def seed_database(db: Session):
    """
    Seeds initial catalogue, sample emails, and benchmark proposal records.
    """
    # 1. Seed Pricing Catalogue
    if db.query(PricingService).count() == 0:
        for item_data in DEFAULT_CATALOGUE:
            service = PricingService(**item_data)
            db.add(service)
        db.commit()

    # 2. Seed Sample Emails
    if db.query(EmailRecord).count() == 0:
        now = datetime.utcnow()
        for email_info in SAMPLE_EMAILS:
            rec_time = now - timedelta(minutes=email_info["minutes_ago"])
            email_record = EmailRecord(
                message_id=f"sample-{email_info['sender_email'].split('@')[0]}@acme.com",
                content_hash=EmailService.compute_content_hash(
                    email_info["sender_email"],
                    email_info["subject"],
                    email_info["body_text"]
                ),
                sender_name=email_info["sender_name"],
                sender_email=email_info["sender_email"],
                subject=email_info["subject"],
                body_text=email_info["body_text"],
                received_at=rec_time,
                status=email_info["status"]
            )
            db.add(email_record)
        db.commit()

    # 3. Seed Sample Initial Proposals
    if db.query(Proposal).count() == 0:
        sample_prop = Proposal(
            id="PR-2025-004",
            template_id="modern",
            title="Enterprise Cloud Infrastructure & Software Provisioning",
            status="generated",
            client_name="Marcus Vance",
            client_company="Acme Corporation",
            client_email="marcus.vance@acmecorp.com",
            client_phone="+1 (415) 882-9011",
            client_address="500 Market Street, San Francisco, CA",
            sender_company="ProposalGen Solutions Inc.",
            sender_name="Sarah Jenkins",
            sender_email="sarah.jenkins@proposalgen.ai",
            sender_phone="+1 (800) 555-0199",
            sender_address="100 Innovation Way, Suite 400, San Francisco, CA 94107",
            accent_color="#2563eb",
            created_date="November 05, 2026",
            valid_until="December 05, 2026",
            currency="USD",
            project_overview="Turnkey enterprise digital transformation solution for Acme Corporation covering 500 professional user licenses, high-availability AWS cloud topology orchestration, and rigorous enterprise security compliance auditing.",
            scope_of_work="End-to-end deployment including user identity directory sync, SAML SSO integration, multi-region AWS cloud setup via Terraform, and SOC2/GDPR vulnerability assessment.",
            deliverables=[
                {"title": "Enterprise User Provisioning", "description": "500 provisioned licenses with SSO & role-based permissions"},
                {"title": "Cloud Infrastructure", "description": "Redundant multi-region AWS topology with CI/CD deployment pipelines"},
                {"title": "Security Audit Report", "description": "Full vulnerability penetration assessment and compliance certification"}
            ],
            timeline_milestones=[
                {"phase": "Phase 1", "title": "Architecture & Licensing", "duration": "Weeks 1-2", "deliverables": "Licensing setup and cloud topology blueprint"},
                {"phase": "Phase 2", "title": "Implementation & CI/CD", "duration": "Weeks 3-4", "deliverables": "Automated pipelines and environment staging"},
                {"phase": "Phase 3", "title": "Security Audit & Rollout", "duration": "Weeks 5-6", "deliverables": "Penetration report and global team onboarding"}
            ],
            line_items=[
                {"id": "item-1", "name": "Enterprise Professional License", "description": "50 user team pack with SSO", "unit_type": "per_user", "quantity": 50.0, "unit_price": 240.0, "total": 12000.0, "matched_service_id": "LIC-ENT", "is_custom": False},
                {"id": "item-2", "name": "Cloud Infrastructure & High-Availability Architecture", "description": "AWS multi-region topology", "unit_type": "fixed", "quantity": 1.0, "unit_price": 6500.0, "total": 6500.0, "matched_service_id": "CLD-ARCH", "is_custom": False},
                {"id": "item-3", "name": "Enterprise Security Audit & Compliance Assessment", "description": "Full vulnerability penetration scan", "unit_type": "fixed", "quantity": 1.0, "unit_price": 4500.0, "total": 4500.0, "matched_service_id": "SEC-AUDIT", "is_custom": False}
            ],
            subtotal=23000.0,
            discount_percent=5.0,
            tax_percent=10.0,
            tax_amount=2185.0,
            total_amount=24035.0,
            payment_terms="30% Kickoff, 40% Staging Approval, 30% Final Handover & Signoff",
            terms_and_conditions="Proposal valid for 30 calendar days from issue. Any scope additions will be quoted as separate work orders."
        )
        db.add(sample_prop)

        # 4. Seed Activity Logs matching screenshot
        activities = [
            ("proposal_generated", "Proposal #PR-2025-004 generated", "Generated for Acme Corporation. Total: $24,035.00", "PR-2025-004", 2),
            ("email_analyzed", "Email from Acme Corporation analyzed", "Requirements extracted with 95% confidence", "msg-acme", 5),
            ("pricing_calculated", "Pricing calculated: $12,500", "Matched 3 service catalogue items for Global Tech Ltd", "msg-global", 8),
            ("proposal_sent", "Proposal sent to client", "Delivered to Marcus Vance at Acme Corporation", "PR-2025-004", 12)
        ]
        now = datetime.utcnow()
        for act_type, title, desc, ref, mins in activities:
            db.add(ActivityLog(
                action_type=act_type,
                title=title,
                description=desc,
                reference_id=ref,
                created_at=now - timedelta(minutes=mins)
            ))
        db.commit()
