from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.models.pricing import PricingService
from backend.app.models.email import EmailRecord
from backend.app.models.proposal import Proposal
from backend.app.models.activity import ActivityLog
from backend.app.services.email_service import EmailService

# Realistic Indian Software Development Service Pricing Catalogue in ₹ INR
DEFAULT_CATALOGUE = [
    {
        "code": "WEB-DEV",
        "name": "Website development",
        "category": "Web Engineering",
        "description": "Custom responsive e-commerce web platform with product catalog, cart, and search",
        "unit_type": "fixed",
        "default_rate": 50000.0,
        "default_quantity": 1.0,
        "keywords": ["website development", "website", "web", "e-commerce", "ecommerce", "storefront", "portal"]
    },
    {
        "code": "ADMIN-DASH",
        "name": "Admin dashboard",
        "category": "Web Engineering",
        "description": "Backend control center for customer registration, order tracking, and SKU inventory",
        "unit_type": "fixed",
        "default_rate": 15000.0,
        "default_quantity": 1.0,
        "keywords": ["admin dashboard", "admin", "dashboard", "control panel", "order tracking", "inventory"]
    },
    {
        "code": "PAY-INT",
        "name": "Payment integration",
        "category": "Integration",
        "description": "Seamless integration with Indian payment gateways (Razorpay, Paytm, PhonePe UPI, Netbanking)",
        "unit_type": "fixed",
        "default_rate": 8000.0,
        "default_quantity": 1.0,
        "keywords": ["payment integration", "payment gateway", "payment", "razorpay", "paytm", "upi", "checkout"]
    },
    {
        "code": "QA-DEPLOY",
        "name": "Testing and deployment",
        "category": "DevOps & QA",
        "description": "Cross-device responsiveness QA, SSL security configuration, and cloud production staging",
        "unit_type": "fixed",
        "default_rate": 7000.0,
        "default_quantity": 1.0,
        "keywords": ["testing and deployment", "testing", "deployment", "qa", "launch", "hosting", "ssl"]
    },
    {
        "code": "APP-MOB",
        "name": "Mobile app development",
        "category": "Mobile Apps",
        "description": "Cross-platform mobile application for Android and iOS using Flutter/React Native",
        "unit_type": "fixed",
        "default_rate": 85000.0,
        "default_quantity": 1.0,
        "keywords": ["mobile app", "mobile", "ios", "android", "flutter", "react native", "app"]
    },
    {
        "code": "CRM-DEV",
        "name": "Custom CRM software",
        "category": "Enterprise Software",
        "description": "Custom sales pipeline tracking, lead scoring, and automated follow-up workflows",
        "unit_type": "fixed",
        "default_rate": 65000.0,
        "default_quantity": 1.0,
        "keywords": ["crm", "customer relationship", "crm software", "leads", "pipeline"]
    },
    {
        "code": "UI-FIGMA",
        "name": "UI/UX Design in Figma",
        "category": "Design & UI",
        "description": "Modern mobile-first design system, clickable prototypes, and responsive layouts",
        "unit_type": "fixed",
        "default_rate": 18000.0,
        "default_quantity": 1.0,
        "keywords": ["ui/ux", "design", "figma", "wireframe", "prototype", "ux"]
    },
    {
        "code": "SLA-AMC",
        "name": "Annual Maintenance & SLA (AMC)",
        "category": "Support",
        "description": "12 Months priority bug fixing, security patch updates, and database backup SLA",
        "unit_type": "monthly",
        "default_rate": 3000.0,
        "default_quantity": 12.0,
        "keywords": ["amc", "maintenance", "support", "sla", "annual maintenance"]
    }
]

# Real Customer Enquiries received at anyaforgerrrr345@gmail.com
SAMPLE_EMAILS = [
    {
        "sender_name": "Rahul Sharma",
        "sender_email": "rahul@abcsolutions.in",
        "recipient_email": "anyaforgerrrr345@gmail.com",
        "subject": "Requirement for E-commerce Website Development",
        "body_text": """Hello Sales Team,

We are looking for a company to develop an e-commerce website for our business.

Our requirements include:
1. Customer registration and login
2. Product catalogue
3. Shopping cart and checkout
4. Payment gateway integration
5. Admin dashboard
6. Order tracking

We expect the project to be completed within 60 days.

Please share your estimated pricing and a detailed business proposal.

Regards,
Rahul Sharma
ABC Solutions Pvt. Ltd.""",
        "status": "new",
        "lead_priority": "High",
        "priority_rationale": "High-intent e-commerce inquiry with explicit 60-day delivery deadline",
        "minutes_ago": 15
    },
    {
        "sender_name": "Priya Nair",
        "sender_email": "priya.nair@technova.co.in",
        "recipient_email": "anyaforgerrrr345@gmail.com",
        "subject": "Requirement for Mobile App Development (iOS & Android)",
        "body_text": """Dear Anvayuone Sales Team,

TechNova is looking to develop a cross-platform mobile application for our field service agents. We need native-grade performance on both iOS and Android with offline data sync, push notifications, and Razorpay subscription billing.

Can you please provide your capability deck and pricing estimate?

Thanks,
Priya Nair
Chief Technology Officer
TechNova Pvt Ltd, Bengaluru""",
        "status": "analyzed",
        "lead_priority": "High",
        "priority_rationale": "CTO inquiry from funded Bengaluru tech firm with dual-platform scope",
        "minutes_ago": 45
    },
    {
        "sender_name": "Vikas Mehta",
        "sender_email": "vikas.mehta@brightpath.in",
        "recipient_email": "anyaforgerrrr345@gmail.com",
        "subject": "Inquiry regarding Custom CRM Software Implementation",
        "body_text": """Hi Team,

We are looking to replace our spreadsheet tracking with a custom CRM software for our 25 sales reps. Requirements include lead capture from website, quotation generation, and WhatsApp API reminders.

Kindly prepare a formal quotation with GST details.

Best regards,
Vikas Mehta
Managing Director, BrightPath Ltd""",
        "status": "proposal_ready",
        "lead_priority": "Medium",
        "priority_rationale": "Standard internal productivity CRM with WhatsApp integration",
        "minutes_ago": 120
    }
]

def seed_database(db: Session):
    """
    Seeds initial Indian catalogue, sample customer inquiries, and benchmark proposal in ₹ INR.
    """
    # 1. Seed Pricing Catalogue
    if db.query(PricingService).count() == 0 or db.query(PricingService).filter(PricingService.code == "WEB-DEV").count() == 0:
        for item_data in DEFAULT_CATALOGUE:
            existing = db.query(PricingService).filter(PricingService.code == item_data["code"]).first()
            if not existing:
                service = PricingService(**item_data)
                db.add(service)
        db.commit()

    # 2. Seed Customer Inquiries
    if db.query(EmailRecord).filter(EmailRecord.sender_email == "rahul@abcsolutions.in").count() == 0:
        now = datetime.utcnow()
        for email_info in SAMPLE_EMAILS:
            rec_time = now - timedelta(minutes=email_info["minutes_ago"])
            email_record = EmailRecord(
                message_id=f"gmail-{email_info['sender_email'].split('@')[0]}@abcsolutions.in",
                content_hash=EmailService.compute_content_hash(
                    email_info["sender_email"],
                    email_info["subject"],
                    email_info["body_text"]
                ),
                sender_name=email_info["sender_name"],
                sender_email=email_info["sender_email"],
                recipient_email=email_info["recipient_email"],
                subject=email_info["subject"],
                body_text=email_info["body_text"],
                received_at=rec_time,
                status=email_info["status"],
                lead_priority=email_info["lead_priority"],
                priority_rationale=email_info["priority_rationale"]
            )
            # If status is analyzed or proposal_ready, pre-populate analysis_json
            if email_info["status"] in ["analyzed", "proposal_ready"]:
                from backend.app.services.ai_service import ai_service
                email_record.analysis_json = ai_service.analyze_email(
                    email_record.sender_email,
                    email_record.subject,
                    email_record.body_text
                )
            db.add(email_record)
        db.commit()

    # 3. Seed Benchmark Proposal in ₹ INR (Matching user specification!)
    if db.query(Proposal).filter(Proposal.id == "PR-2025-001").count() == 0:
        now = datetime.utcnow()
        sample_prop = Proposal(
            id="PR-2025-001",
            version=1,
            template_id="modern",
            title="E-commerce Website Development Proposal",
            status="generated",
            client_name="Rahul Sharma",
            client_company="ABC Solutions Pvt. Ltd.",
            client_email="rahul@abcsolutions.in",
            client_phone="+91 98765 43210",
            client_address="Cyber Gateway, Hitec City, Hyderabad, Telangana",
            client_gstin="36AABCA1234E1Z1",
            sender_company="Anvayuone",
            sender_name="Anvayuone bot",
            sender_email="anyaforgerrrr345@gmail.com",
            sender_phone="+91 40 4859 2100",
            sender_address="Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081",
            sender_gstin="36AAACN1234F1Z5",
            sender_pan="AAACN1234F",
            bank_name="HDFC Bank Ltd.",
            bank_account="50200012345678",
            bank_ifsc="HDFC0001234",
            bank_branch="Madhapur Branch, Hyderabad",
            created_date=now.strftime("%d/%m/%Y"),
            valid_until=(now + timedelta(days=30)).strftime("%d/%m/%Y"),
            currency="INR",
            currency_symbol="₹",
            project_overview="Comprehensive full-stack e-commerce web platform engineered for ABC Solutions Pvt. Ltd., incorporating secure customer registration, dynamic product catalog, shopping cart, Indian payment gateway integration (Razorpay / UPI), admin dashboard, and real-time order tracking.",
            scope_of_work="Delivery within 60 days including user authentication, checkout workflows, payment gateway sandbox to live rollout, administrative order management, and QA deployment.",
            deliverables=[
                {"title": "Customer Registration & Auth", "description": "OTP and email based secure registration and customer profile management"},
                {"title": "Dynamic Product Catalogue", "description": "Rich product listing with categories, filters, variants, and search indexing"},
                {"title": "Cart & Checkout Engine", "description": "Optimized shopping cart with coupon support and multi-step checkout"},
                {"title": "Payment Gateway Integration", "description": "Razorpay & Paytm integration supporting UPI, Credit/Debit cards, and Netbanking"},
                {"title": "Admin Dashboard", "description": "Comprehensive order fulfillment, stock management, and sales reporting"},
                {"title": "Order Tracking & Alerts", "description": "Real-time dispatch tracking with automated customer notification status"}
            ],
            timeline_milestones=[
                {"phase": "Phase 1", "title": "Discovery & UI/UX Wireframing", "duration": "Days 1-15", "deliverables": "Figma screens, database schema & architecture sign-off"},
                {"phase": "Phase 2", "title": "Core Frontend & Storefront", "duration": "Days 16-35", "deliverables": "Catalog, shopping cart, customer auth & profile"},
                {"phase": "Phase 3", "title": "Payment & Admin Dashboard", "duration": "Days 36-50", "deliverables": "Razorpay integration, order tracking & admin console"},
                {"phase": "Phase 4", "title": "UAT, QA & Production Launch", "duration": "Days 51-60", "deliverables": "End-to-end testing, SSL configuration & live deployment"}
            ],
            # Exactly matching user's illustrative pricing example!
            line_items=[
                {"id": "item-1", "name": "Website development", "description": "Custom responsive e-commerce web platform", "unit_type": "fixed", "quantity": 1.0, "unit_price": 50000.0, "total": 50000.0, "matched_service_id": "WEB-DEV", "is_custom": False},
                {"id": "item-2", "name": "Admin dashboard", "description": "Backend administrative dashboard for order tracking", "unit_type": "fixed", "quantity": 1.0, "unit_price": 15000.0, "total": 15000.0, "matched_service_id": "ADMIN-DASH", "is_custom": False},
                {"id": "item-3", "name": "Payment integration", "description": "Razorpay / Paytm / UPI gateway integration", "unit_type": "fixed", "quantity": 1.0, "unit_price": 8000.0, "total": 8000.0, "matched_service_id": "PAY-INT", "is_custom": False},
                {"id": "item-4", "name": "Testing and deployment", "description": "QA testing, SSL setup, and cloud deployment", "unit_type": "fixed", "quantity": 1.0, "unit_price": 7000.0, "total": 7000.0, "matched_service_id": "QA-DEPLOY", "is_custom": False}
            ],
            subtotal=80000.0,
            discount_percent=0.0,
            discount_amount=0.0,
            gst_rate=18.0,
            is_interstate=False, # Intra-state within Telangana: CGST 9% + SGST 9%
            cgst_amount=7200.0,
            sgst_amount=7200.0,
            igst_amount=0.0,
            tax_amount=14400.0, # 18% of 80,000 = 14,400
            total_amount=94400.0, # Exactly 94,400 INR as specified!
            payment_terms="50% Advance with Purchase Order (₹47,200), 30% upon UAT deployment (₹28,320), 20% upon final production sign-off (₹18,880).",
            terms_and_conditions="1. Proposal validity: 30 days from issuance.\n2. Scope adjustments will be documented in a mutual Change Request.\n3. Source code ownership transferred to client upon 100% final settlement.\n4. Dispute jurisdiction subject to Hyderabad courts only."
        )
        db.add(sample_prop)

        # 4. Seed Activities
        db.add(ActivityLog(
            action_type="email_ingested",
            title="Inbound Enquiry from Rahul Sharma (ABC Solutions)",
            description="Received on anyaforgerrrr345@gmail.com: E-commerce Website Development",
            reference_id="PR-2025-001"
        ))
        db.add(ActivityLog(
            action_type="pricing_calculated",
            title="Pricing Calculated: ₹94,400 (Incl. 18% GST)",
            description="Matched 4 services from catalogue for ABC Solutions Pvt. Ltd.",
            reference_id="PR-2025-001"
        ))
        db.commit()
