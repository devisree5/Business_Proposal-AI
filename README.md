# ProposalGen AI | Commercial B2B Email-to-Proposal Platform

![ProposalGen AI](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80)

> **ProposalGen AI** is an enterprise-grade B2B sales automation platform that transforms unstructured customer service requests received via email into professional, mathematically accurate, and beautifully styled business proposals in seconds.

---

## 🌟 Key Capabilities & Architecture

```
   ┌───────────────────────────────────────────────────────────────┐
   │                       Customer Email                          │
   │            (Gmail API / IMAP / Ingestion Simulator)           │
   └───────────────────────────────┬───────────────────────────────┘
                                   │
                                   ▼
   ┌───────────────────────────────────────────────────────────────┐
   │                  AI-Powered Email Analyzer                    │
   │               (Google Gemini API / Heuristics)                │
   │   • Client Company & Contact Info    • Deliverables & Scope   │
   │   • Project Overview & Timeline      • Missing Info Detection │
   └───────────────────────────────┬───────────────────────────────┘
                                   │
                                   ▼
   ┌───────────────────────────────────────────────────────────────┐
   │                 Pricing Catalogue Automation                  │
   │                 (Deterministic Backend Engine)                │
   │   • Semantic Keyword Matcher         • Unit Price Calculation │
   │   • Unmatched Custom Requirement     • Tax & Discount Logic   │
   └───────────────────────────────┬───────────────────────────────┘
                                   │
                                   ▼
   ┌───────────────────────────────────────────────────────────────┐
   │                 STANDOUT PROPOSAL EDITOR                      │
   │            (Interactive Split-View B2B Builder)               │
   │   • Live A4 WYSIWYG Document Sheet Preview (Real-time updates)│
   │   • 3 Professional PDF Themes (Modern, Corporate, Minimal)    │
   │   • Section-by-Section Controls with AI Content Refinement    │
   │   • Live Mathematical Recalculation & Accent Color Picker     │
   └───────────────────────────────┬───────────────────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
   ┌──────────────────────────────┐  ┌──────────────────────────────┐
   │    Vector PDF Generation     │  │   Direct Client Delivery     │
   │    (Playwright + Chromium)   │  │   (SMTP / Gmail Outbound)    │
   └──────────────────────────────┘  └──────────────────────────────┘
```

---

## 🚀 Key Functional Features

### 1. 📧 Email Integration & Deduplication
- **Multi-Source Ingestion**: Ingests customer inquiries via **Gmail API**, **IMAP (SSL 993)**, or the built-in **Inbound Email Simulator** (with pre-built enterprise presets for Acme Corp, Global Tech Ltd, Modern Tools Inc, and Delta Solutions).
- **Deduplication Engine**: Calculates SHA-256 content hashes of incoming messages and matches `Message-ID` headers to prevent processing duplicate requests.
- **Dashboard Feed**: Displays unread incoming requests with status badges (`New`, `Analyzing`, `Extracted`, `Proposal Created`).

### 2. 🧠 AI-Based Email Analysis (Gemini API)
- Extracts structured B2B requirements into clean JSON:
  - Client / Company Name & Contact Details
  - Project Title & Executive Summary
  - Scope of Work & Deliverable Items
  - Quantity breakdowns and unit types
  - Expected timeline and budget figures
- **Missing Information Alert**: Identifies unstated details (e.g., cloud provider, user counts, target launch dates) so sales reps know what to clarify.
- **Human-in-the-Loop Review**: Allows the user to verify, modify, and adjust requirements before generating the proposal.

### 3. 💰 Deterministic Pricing Automation
- **Predefined Service Catalogue**: Full CRUD management of active B2B service packages (Software Licensing, Cloud Infrastructure, Full-Stack Development, Security Audits, 24/7 SLA Support, Database Migration, AI Workflows).
- **Automated Semantic Matcher**: Matches extracted requirements against catalogue items using keyword heuristics.
- **Strict Anti-Hallucination Rule**: Mathematical calculations occur strictly on the backend. Uncatalogued items are flagged as `Custom Requirement (Requires Manual Quote)`.

### 4. 🎨 Standout Feature: The Commercial Proposal Editor
- **Split-View Real-Time Interface**: Edit on the left; watch the exact A4 document sheet update in real time on the right.
- **3 Professional Design Themes**:
  1. **Modern Business**: Clean tech aesthetic, blue/accent highlights, badges, structured tables.
  2. **Corporate Elegance**: Executive dark navy header with gold accent rule, serif headings, formal legal layout.
  3. **Minimal Style**: Swiss minimalist high-whitespace layout with crisp typography and hairline dividers.
- **Interactive Section Tabs**:
  - *General & Parties*: Client entity, provider entity, accent color palette picker, issue and validity dates.
  - *Project Overview*: Executive summary with one-click **AI Assist** (Executive, Persuasive, or Formal tone).
  - *Deliverables*: Add, edit, or re-order project deliverables.
  - *Pricing & Line Items*: Add catalogue or custom items, modify quantities, adjust discount % and tax %.
  - *Timeline & Milestones*: Phase names, durations, and sign-off criteria.
  - *Terms & Signatures*: Payment milestone schedules (e.g., 30/40/30) and authorized signature blocks.

### 5. 📄 High-Fidelity PDF Generation & Delivery
- **Playwright Chromium Vector PDFs**: Generates print-quality A4 PDFs using headless Chromium.
- **Proposal Delivery Modal**: Sends the generated PDF directly to the customer's email address with a customized cover letter.
- **Audit History**: Complete chronological timeline of all proposal events and activities.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|-----------|-----------|-------------|
| **Frontend** | React 18 + Vite | Lightning-fast reactive interface |
| **Styling** | Tailwind CSS + Lucide Icons | Polished commercial B2B SaaS design system |
| **Backend** | Python 3.13 + FastAPI | High-performance asynchronous REST API |
| **Database** | PostgreSQL (Prod) / SQLite (Dev) | SQLAlchemy 2.0 ORM with dialect auto-adaptation |
| **AI Integration** | Google Gemini API (`google-genai`) | Structured extraction & tone refinement |
| **PDF Engine** | Playwright (Headless Chromium) | Exact A4 PDF rendering |
| **Email Protocol** | Gmail API, IMAP4-SSL & SMTP | Ingestion and client delivery |

---

## 📦 Local Setup Instructions

### Prerequisites
- Node.js v18+ or v22+
- Python 3.10+ (tested on Python 3.13)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Email_Proposal_Generator.git
cd Email_Proposal_Generator
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Insert your `GEMINI_API_KEY`. If left empty, ProposalGen AI automatically operates in smart offline rule-based mode for complete offline demonstration.)*

### 3. Setup and Run the Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright Chromium browser
playwright install chromium

# Launch the FastAPI backend server
python run.py
```
The backend will start at: `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).

### 4. Setup and Run the Frontend
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
The frontend application will be running at: `http://localhost:3000`.

---

## ☁️ Deployment Guide

### A. Deploy Backend on Render (Web Service + PostgreSQL)
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), create a **New Web Service** connected to your repository.
3. Configure the settings:
   - **Root Directory**: `backend` (or leave empty and use root run)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt && playwright install chromium --with-deps`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `DATABASE_URL`: Your PostgreSQL connection string (from Render Managed PostgreSQL)
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `GEMINI_MODEL`: `gemini-1.5-flash`
   - `COMPANY_NAME`: `ProposalGen Solutions Inc.`
   - `COMPANY_EMAIL`: `sales@proposalgen.ai`
5. Click **Deploy Web Service**.

### B. Deploy Frontend on Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. In **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://proposalgen-backend.onrender.com`).
5. Click **Deploy**.

---

## 📡 Key REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/dashboard` | Dashboard metrics, recent requests, and activity feed |
| `GET` | `/api/emails` | List all ingested customer emails with status filters |
| `POST` | `/api/emails/ingest` | Ingest email with SHA-256 deduplication check |
| `POST` | `/api/emails/sync` | Trigger IMAP/Gmail mailbox sync |
| `POST` | `/api/emails/{id}/analyze` | Execute AI structured requirement extraction |
| `GET` | `/api/pricing` | View active service catalogue items |
| `POST` | `/api/pricing/match` | Deterministically match requirements with catalogue rates |
| `GET` | `/api/proposals` | List all generated business proposals |
| `POST` | `/api/proposals` | Create new proposal document |
| `PUT` | `/api/proposals/{id}` | Update proposal in the live proposal editor |
| `POST` | `/api/proposals/{id}/generate-pdf`| Render Playwright Chromium A4 PDF |
| `GET` | `/api/proposals/{id}/download-pdf`| Download binary proposal PDF |
| `POST` | `/api/proposals/{id}/send` | Deliver proposal to customer via email |

---

## 📄 License
MIT License. Built for enterprise B2B sales automation workflows.
