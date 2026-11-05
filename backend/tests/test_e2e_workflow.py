from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import get_db, Base, engine

def test_full_indian_b2b_sales_workflow():
    with TestClient(app) as client:
        # 1. Verify Seed Data & Inbound Email from Rahul Sharma
        res = client.get("/api/emails")
        assert res.status_code == 200
        emails = res.json()
        assert len(emails) >= 1

        rahul_email = next((e for e in emails if "rahul@abcsolutions.in" in e["sender_email"]), None)
        assert rahul_email is not None, "Rahul Sharma email should be in the inbox"
        assert rahul_email["recipient_email"] == "anyaforgerrrr345@gmail.com"
        assert rahul_email["lead_priority"].lower() == "high"

        email_id = rahul_email["id"]

        # 2. Test AI Analysis Extraction (Screen 2)
        analysis_res = client.post(f"/api/emails/{email_id}/analyze")
        assert analysis_res.status_code == 200
        extracted = analysis_res.json()["analysis"]

        assert "abc" in extracted.get("client_company", "").lower()
        assert "rahul" in extracted.get("client_name", "").lower()
        assert "60 days" in extracted.get("expected_timeline", "")
        assert len(extracted.get("features_and_scope", [])) >= 5
        assert extracted.get("lead_priority", "").lower() == "high"

        # 3. Test Pricing Matching against Service Catalogue (Screen 3)
        # Use extracted quantities if available, or features
        if extracted.get("quantities"):
            req_items = [
                {"requirement_name": q["name"], "quantity": q.get("quantity", 1.0), "description": q.get("description", "")}
                for q in extracted["quantities"]
            ]
        else:
            req_items = [
                {"requirement_name": feat, "quantity": 1.0}
                for feat in extracted.get("features_and_scope", [])
            ]

        pricing_res = client.post("/api/pricing/match", json={
            "requirements": req_items,
            "gst_rate": 18.0,
            "is_interstate": False
        })
        assert pricing_res.status_code == 200, f"Pricing failed: {pricing_res.text}"
        pricing = pricing_res.json()
        print("PRICING ITEMS:", [it["name"] for it in pricing["items"]])
        print("PRICING SUMMARY:", pricing["subtotal"], pricing["total_amount"])

        # Check line items and sums
        line_item_names = [it["name"].lower() for it in pricing["items"]]
        assert any("website" in name for name in line_item_names)
        assert any("dashboard" in name for name in line_item_names)
        assert any("payment" in name for name in line_item_names)

        assert pricing["subtotal"] == 80000.0
        assert pricing["total_amount"] == 94400.0
        assert pricing["cgst_amount"] == 7200.0
        assert pricing["sgst_amount"] == 7200.0

        # 4. Generate Formal Proposal (Screen 3 -> Proposal Engine)
        prop_payload = {
            "email_id": email_id,
            "template_id": "modern",
            "title": "Business Proposal: E-commerce Website Development",
            "client_company": extracted.get("client_company", "ABC Solutions Pvt. Ltd."),
            "client_name": extracted.get("client_name", "Rahul Sharma"),
            "client_email": "rahul@abcsolutions.in",
            "client_phone": "+91 98765 43210",
            "sender_company": "Anvayuone",
            "sender_name": "Anvayuone bot",
            "sender_email": "anyaforgerrrr345@gmail.com",
            "sender_phone": "+91 40 4859 2300",
            "sender_address": "Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081",
            "currency": "INR",
            "project_overview": "Comprehensive enterprise-grade e-commerce web platform for ABC Solutions Pvt. Ltd.",
            "scope_of_work": "Design, engineering, payment integration, and deployment of cloud e-commerce platform.",
            "deliverables": [
                {"title": "Customer Auth & Profiles", "description": "Secure OTP and JWT authentication"},
                {"title": "Product Catalog & Search", "description": "High-performance catalog with faceted filtering"},
                {"title": "Shopping Cart & Checkout", "description": "Persistent cart with Razorpay gateway"},
                {"title": "Admin Management Console", "description": "Order management and inventory tracking"},
                {"title": "Order Tracking & Notifications", "description": "Live status updates via SMS and WhatsApp"}
            ],
            "timeline_milestones": [
                {"phase": "Phase 1", "title": "Architecture & UX", "duration": "Days 1-15", "deliverables": "System design & Figma prototypes"},
                {"phase": "Phase 2", "title": "Core Development", "duration": "Days 16-45", "deliverables": "Catalog, Cart, Payment gateway"},
                {"phase": "Phase 3", "title": "Testing & Go-Live", "duration": "Days 46-60", "deliverables": "Security audits, UAT & deployment"}
            ],
            "line_items": pricing["items"],
            "subtotal": pricing["subtotal"],
            "discount_percent": 0.0,
            "tax_percent": 18.0,
            "tax_amount": 14400.0,
            "total_amount": 94400.0,
            "payment_terms": "50% advance on agreement sign-off, 30% after UAT milestone, 20% upon final go-live.",
            "terms_and_conditions": "18% GST applicable. Includes 1-year standard bug-fix warranty and cloud migration support.",
            "valid_until": "05/12/2026",
            "accent_color": "#2563eb"
        }

        gen_res = client.post("/api/proposals", json=prop_payload)
        if gen_res.status_code != 200:
            print("GEN ERROR:", gen_res.status_code, gen_res.text)
        assert gen_res.status_code == 200
        proposal = gen_res.json()
        prop_id = proposal["id"]
        assert prop_id.startswith("PR-")
        assert proposal["total_amount"] == 94400.0
        assert proposal["version"] == 1

        # 5. Generate and Download PDF (Playwright Vector PDF)
        pdf_gen = client.post(f"/api/proposals/{prop_id}/generate-pdf?template=modern")
        assert pdf_gen.status_code == 200
        assert pdf_gen.json()["success"] is True

        pdf_res = client.get(f"/api/proposals/{prop_id}/download-pdf")
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert len(pdf_res.content) > 1000  # valid PDF bytes

        # 6. Test Proposal Delivery via Gmail API (Screen 4)
        send_res = client.post(f"/api/proposals/{prop_id}/send", json={
            "recipient_email": "rahul@abcsolutions.in",
            "recipient_name": "Rahul Sharma",
            "subject": "Business Proposal: E-commerce Website Development [Ref: " + prop_id + "]",
            "custom_message": "Dear Rahul, Please find attached our proposal for ABC Solutions."
        })
        assert send_res.status_code == 200
        send_data = send_res.json()
        assert send_data["success"] is True
        assert send_data["status"] == "sent"
        assert send_data["follow_up_due_date"] is not None

        # 7. Verify Follow-Up Reminders Endpoint (Standout feature 1)
        follow_ups_res = client.get("/api/proposals/follow-ups")
        assert follow_ups_res.status_code == 200
        follow_ups = follow_ups_res.json()
        matched_fu = next((f for f in follow_ups if f["proposal_id"] == prop_id), None)
        assert matched_fu is not None
        assert matched_fu["status"] == "pending"

        # 8. Test Proposal Negotiation Version Revision (Standout feature 2)
        # Client asks for revision: revision v1 -> v2
        rev_res = client.post(f"/api/proposals/{prop_id}/revise")
        assert rev_res.status_code == 200
        revised = rev_res.json()
        assert revised["version"] == 2
        assert revised["parent_proposal_id"] == prop_id

        # 9. Test n8n Inbound Webhook (https://anvayuone.app.n8n.cloud)
        webhook_res = client.post("/api/emails/webhook/gmail", json={
            "from": "Vikram Patel <vikram@patelenterprises.in>",
            "subject": "Requirement for E-commerce Mobile Application",
            "body": "Hi Anvayuone team, We need a mobile shopping app with payment gateway completed within 45 days.",
            "messageId": "n8n-test-msg-001"
        })
        assert webhook_res.status_code == 200
        wb_data = webhook_res.json()
        assert wb_data["success"] is True
        assert wb_data["company"] == "Anvayuone"
        assert wb_data["bot"] == "Anvayuone bot"

if __name__ == "__main__":
    test_full_indian_b2b_sales_workflow()
    print("ALL TESTS PASSED SUCCESSFULLY!")
