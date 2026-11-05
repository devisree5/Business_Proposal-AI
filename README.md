# Anvayuone Sales AI | Email-Driven B2B Proposal Automation System
### Real-World Email-to-Proposal Pipeline with Indian Business Conventions (₹ INR & 18% GST)

![Anvayuone Sales AI](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80)

> **Anvayuone Sales AI** is a production-ready, email-driven B2B sales automation system powered by **Anvayuone bot**. Located in Hitec City, Hyderabad, it converts inbound customer inquiries received on the company's dedicated sales email (`anyaforgerrrr345@gmail.com`) into reviewed, priced, and delivered business proposals in **₹ INR** with **18% GST** (CGST/SGST/IGST breakdown), Indian corporate credentials, and 3-day automatic follow-up reminders. It connects directly with **n8n** (https://anvayuone.app.n8n.cloud/assistant) to monitor the inbox and trigger automated proposal generation.

---

## 🏛️ Indian Business & Corporate Profile

- **Operating Entity**: **Anvayuone**
- **Bot Name**: **Anvayuone bot**
- **Headquarters**: Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081
- **Dedicated Sales Email**: `anyaforgerrrr345@gmail.com`
- **n8n Cloud Assistant**: [https://anvayuone.app.n8n.cloud/assistant](https://anvayuone.app.n8n.cloud/assistant)
- **GSTIN**: `36AAACN1234F1Z5` (Telangana State Code: `36`)
- **PAN**: `AAACN1234F`
- **Corporate Remittance**: HDFC Bank Ltd., Madhapur Branch (A/C: `50200012345678` | IFSC: `HDFC0001234`)
- **Currency & Taxation**: Indian Rupee (`₹` INR) & 18% GST
  - **Intra-State (Telangana)**: Split into **CGST 9%** + **SGST 9%**
  - **Inter-State (Outside Telangana)**: **IGST 18%**

---

## 🌟 End-to-End Workflow & Screens

```
   ┌────────────────────────────────────────────────────────────────┐
   │ Customer Email to anyaforgerrrr345@gmail.com                   │
   │ From: rahul@abcsolutions.in (Rahul Sharma, ABC Solutions)      │
   │ Subject: Requirement for E-commerce Website Development        │
   └───────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ SCREEN 1: Sales Inbox (3-Pane CRM Interface)                   │
   │ • Left: Sidebar (Inbox, Proposals, Sent, Follow-ups, Pricing)  │
   │ • Middle: Inbound enquiry feed with AI Lead Priority badges    │
   │ • Right: Selected email content & AI analysis action           │
   └───────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ SCREEN 2: AI Requirement Analysis & Extraction                 │
   │ • Client: ABC Solutions Pvt. Ltd. | Contact: Rahul Sharma      │
   │ • 6 Identified Features (Auth, Catalog, Cart, Payment, etc.)   │
   │ • Timeline: 60 Days | Budget: Not Specified                    │
   │ • Missing Info: Hosting preference, SKU count, SMS gateway     │
   │ • Lead Priority: HIGH (Established firm with 60-day deadline)  │
   └───────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ SCREEN 3: Deterministic Pricing Automation (₹ INR)              │
   │ • Website development (1 unit):              ₹50,000           │
   │ • Admin dashboard (1 unit):                  ₹15,000           │
   │ • Payment integration (Razorpay/UPI) (1 unit):₹8,000           │
   │ • Testing and deployment (1 unit):            ₹7,000           │
   │ ────────────────────────────────────────────────────────────  │
   │ Subtotal:                                    ₹80,000           │
   │ 18% GST (CGST 9% ₹7,200 + SGST 9% ₹7,200):   ₹14,400           │
   │ TOTAL INVESTMENT:                            ₹94,400 INR       │
   └───────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ SCREEN 4: Delivery via Gmail API & 3-Day Follow-Up Automation  │
   │ • Attached: Playwright Vector PDF (PR-2025-001_modern.pdf)     │
   │ • Dispatched to rahul@abcsolutions.in via Gmail API            │
   │ • Automatic 3-Day Follow-Up Task scheduled for +3 days         │
   └────────────────────────────────────────────────────────────────┘
```

---

## 🔥 3 Standout Differentiating Features

### 1. ⏰ Automatic 3-Day Follow-Up Reminders
- Proposals sent to prospective clients automatically schedule a follow-up reminder for **+3 calendar days**.
- The **Follow-Up Reminders** view actively tracks non-responsive proposals.
- Sales executives can review the pending list and trigger a personalized follow-up email with 1-click via the Gmail API.

### 2. 📑 Proposal Version Tracking & Negotiation History (`v1` → `v2`)
- In enterprise B2B sales, clients regularly negotiate scope, milestones, or discounts.
- Nexura Sales AI includes **Version Branching**: click **"Revise (v2)"** to branch any existing proposal.
- Retains the parent link (`parent_proposal_id`) and preserves the full audit trail of negotiations.

### 3. 🎯 AI Lead Priority Classification (`High`, `Medium`, `Low`)
- Incoming customer inquiries are automatically classified by AI based on commercial urgency, budget signals, and scope completeness.
- Sales representatives retain full control and can override the classification with a single click.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti | Responsive 3-pane sales console |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2 | High-throughput asynchronous REST API |
| **Database** | SQLite / PostgreSQL | ACID transactions for proposals, line items, and audit logs |
| **AI Extraction** | Google Gemini API (`gemini-2.5-flash`) + Indian IT Heuristic Fallback | Multi-field extraction and missing info detection |
| **Email Protocols** | Gmail API (OAuth 2.0 / REST), IMAP SSL (Port 993), Webhook | Real-time inbound ingestion and outbound PDF dispatch |
| **PDF Generation** | Playwright Chromium (Headless) | High-fidelity vector PDF generation matching HTML templates |

---

## 📂 Repository Structure

```
Email_Proposal_Generator/
├── backend/
│   ├── app/
│   │   ├── config.py              # Hyderabad corporate details, GSTIN, PAN, bank coordinates
│   │   ├── database.py            # SQLite / PostgreSQL engine & session maker
│   │   ├── main.py                # FastAPI application entrypoint & lifecycle hooks
│   │   ├── models/                # SQLAlchemy ORM models (email, proposal, pricing, activity)
│   │   ├── routers/               # REST API endpoints (emails, pricing, proposals, settings)
│   │   ├── schemas/               # Pydantic v2 validation schemas (INR & GST fields)
│   │   ├── services/
│   │   │   ├── ai_service.py      # Gemini API & Indian IT domain extraction heuristics
│   │   │   ├── email_service.py   # Gmail API, IMAP sync, deduplication, webhook ingestion
│   │   │   ├── mailer_service.py  # Outbound delivery & 3-day follow-up automation
│   │   │   ├── pdf_service.py     # Playwright headless Chromium vector PDF generator
│   │   │   └── pricing_service.py # Deterministic catalogue matching & 18% GST calculation
│   │   ├── templates/             # Jinja2 vector PDF templates (modern, corporate, minimal)
│   │   └── utils/seed_data.py     # Pre-seeded Rahul Sharma, Priya Nair, and Vikas Mehta enquiries
│   └── tests/
│       └── test_e2e_workflow.py   # Complete end-to-end integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── inbox/             # Screen 1 (Sales Inbox 3-pane) & Follow-Up Reminders
│   │   │   ├── editor/            # Screen 3 & Standout proposal editor with live A4 preview
│   │   │   ├── layout/            # Sidebar, Header, and tab router
│   │   │   ├── pricing/           # Standard Pricing Catalogue in ₹ INR
│   │   │   ├── proposals/         # Proposals pipeline & version badges (v1, v2)
│   │   │   └── settings/          # System settings, GSTIN, PAN, and Gmail integration
│   │   ├── context/AppContext.jsx # Global state management
│   │   └── services/api.js        # Frontend REST API client
│   └── package.json
└── README.md
```

---

## 🚀 Local Installation & Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment and activate
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browser binaries for PDF rendering
playwright install chromium
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Sales Gmail Inbox
GMAIL_SENDER_EMAIL=anyaforgerrrr345@gmail.com

# Company Information (Hyderabad, India)
COMPANY_NAME=Nexura Technologies Pvt. Ltd.
COMPANY_EMAIL=anyaforgerrrr345@gmail.com
COMPANY_PHONE=+91 40 4859 2300
COMPANY_WEBSITE=https://nexuratech.in
COMPANY_ADDRESS=Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081
COMPANY_GSTIN=36AAACN1234F1Z5
COMPANY_PAN=AAACN1234F
COMPANY_BANK_NAME=HDFC Bank Ltd.
COMPANY_BANK_ACCOUNT=50200012345678
COMPANY_BANK_IFSC=HDFC0001234
```

### 4. Run Integration Tests
Verify the full end-to-end sales workflow (Inbound Email → AI Analysis → Catalogue Pricing ₹94,400 → Vector PDF → Follow-up Reminder):
```bash
python backend/tests/test_e2e_workflow.py
# Output: ALL TESTS PASSED SUCCESSFULLY!
```

### 5. Launch Backend Server
```bash
uvicorn backend.app.main:app --reload --port 8000
```
Swagger API Documentation is available at: `http://localhost:8000/docs`

### 6. Launch Frontend Client
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The user console will be accessible at: `http://localhost:5173`

---

## 🌐 Production Deployment Guide

### Deploy Backend on Render / Railway
1. Push your repository to GitHub.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
3. Set the build and start commands:
   - **Build Command**: `pip install -r backend/requirements.txt && playwright install chromium`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Configure the environment variables in the dashboard.

### Deploy Frontend on Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.onrender.com`
5. Click **Deploy**.

---

## 📄 License
This project is open-source under the MIT License. Developed for enterprise B2B sales automation.
