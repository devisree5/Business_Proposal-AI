import json
import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        from backend.app.config import settings
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize google.genai: {e}")

    def analyze_email(self, sender_email: str, subject: str, body_text: str) -> Dict[str, Any]:
        """
        Analyzes inbound email and extracts structured B2B proposal requirements.
        If Gemini API key is configured and valid, uses Gemini.
        Otherwise, falls back to high-fidelity rule-based heuristic extraction.
        """
        from backend.app.config import settings
        if self.client and self.api_key:
            try:
                return self._analyze_with_gemini(sender_email, subject, body_text)
            except Exception as e:
                logger.error(f"Gemini API error, falling back to rule-based parser: {e}")
                return self._analyze_with_heuristics(sender_email, subject, body_text, error_msg=str(e))
        
        return self._analyze_with_heuristics(sender_email, subject, body_text)

    def _analyze_with_gemini(self, sender_email: str, subject: str, body_text: str) -> Dict[str, Any]:
        from backend.app.config import settings
        prompt = f"""
You are an expert B2B Sales Solutions Architect and Proposal Specialist.
Analyze the following customer email requesting products or services and extract structured requirements for generating a business proposal.

Input Email:
Sender: {sender_email}
Subject: {subject}
Body:
\"\"\"
{body_text}
\"\"\"

Return ONLY a valid JSON object matching the following structure without markdown code blocks:
{{
  "client_name": "Full name of contact person or null",
  "client_company": "Client Company name",
  "contact": {{
    "name": "Contact person name",
    "email": "Contact email",
    "phone": "Phone number or null",
    "role": "Title/Role or null"
  }},
  "project_name": "Concise professional title for the proposal",
  "project_description": "Comprehensive 2-4 sentence executive summary of project goals and scope",
  "features_and_scope": [
    "Feature or scope requirement 1",
    "Feature or scope requirement 2"
  ],
  "quantities": [
    {{
      "name": "Service or product item name",
      "description": "Item description or requirement specifics",
      "quantity": 1.0,
      "unit": "user/month/license/hour/setup/unit"
    }}
  ],
  "expected_timeline": "Expected timeframe (e.g. 6-8 weeks, Q3 2025)",
  "budget": "Client mentioned budget or null if not specified",
  "additional_requirements": [
    "Compliance, security, hosting, support or technical requirement"
  ],
  "missing_information": [
    "Crucial items not specified in the email (e.g. user volume, existing stack, launch date)"
  ],
  "confidence_score": 0.95
}}
"""
        response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        text = response.text.strip()
        
        # Clean json formatting if wrapped in code blocks
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        data = json.loads(text)
        data["ai_model_used"] = f"Gemini ({settings.GEMINI_MODEL})"
        return data

    def _analyze_with_heuristics(self, sender_email: str, subject: str, body_text: str, error_msg: Optional[str] = None) -> Dict[str, Any]:
        """
        Smart offline heuristic parser that recognizes B2B email patterns,
        company domain names, quantities, timelines, budgets, and missing details.
        """
        text_lower = body_text.lower()
        sub_lower = subject.lower()

        # Extract company from domain or sender
        company = "Client Organization"
        if "@" in sender_email:
            domain_part = sender_email.split("@")[1].split(".")[0]
            if domain_part not in ["gmail", "yahoo", "hotmail", "outlook", "icloud"]:
                company = domain_part.replace("-", " ").replace("_", " ").title() + " Inc."
            else:
                # Try inferring company from email body or subject
                comp_match = re.search(r'(?:at|from|representing|company:?)\s+([A-Z][a-zA-Z0-9\s&]{2,30})', body_text)
                if comp_match:
                    company = comp_match.group(1).strip()
                elif "acme" in text_lower or "acme" in sub_lower:
                    company = "Acme Corporation"
                elif "global tech" in text_lower or "global tech" in sub_lower:
                    company = "Global Tech Ltd"
                elif "modern tools" in text_lower or "modern tools" in sub_lower:
                    company = "Modern Tools Inc"
                elif "delta" in text_lower or "delta" in sub_lower:
                    company = "Delta Solutions"

        # Extract contact name
        contact_name = "Procurement Manager"
        name_match = re.search(r'(?:regards|thanks|best|sincerely|cheers),?\s*\n+([A-Za-z\s]{3,30})', body_text, re.IGNORECASE)
        if name_match:
            contact_name = name_match.group(1).strip()
        elif "hi, i'm " in text_lower or "my name is " in text_lower:
            intro_match = re.search(r'(?:i\'m|my name is)\s+([A-Za-z\s]{3,25})', body_text, re.IGNORECASE)
            if intro_match:
                contact_name = intro_match.group(1).strip()

        # Extract phone
        phone_match = re.search(r'(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})', body_text)
        phone = phone_match.group(1) if phone_match else None

        # Extract budget
        budget_match = re.search(r'(\$\s?[\d,]+(?:\.\d+)?|\b\d+k\b|\b[\d,]+\s?usd\b|\b[\d,]+\s?dollars\b)', body_text, re.IGNORECASE)
        budget = budget_match.group(1) if budget_match else None

        # Extract timeline
        timeline = "4 - 8 Weeks"
        if "timeline" in text_lower or "deadline" in text_lower or "launch" in text_lower or "weeks" in text_lower:
            t_match = re.search(r'((?:within|in|by|deadline:?|timeline:?)\s+[\w\s]{2,25}(?:weeks|months|days|q[1-4]|asap))', body_text, re.IGNORECASE)
            if t_match:
                timeline = t_match.group(1).strip().capitalize()
            elif "asap" in text_lower:
                timeline = "Immediate / ASAP (1-2 weeks)"
            elif "month" in text_lower:
                timeline = "1 - 2 Months"

        # Determine project title & requirements based on content keywords
        features = []
        quantities = []
        missing = []
        additional = []

        if "license" in text_lower or "user" in text_lower or "seat" in text_lower:
            qty_match = re.search(r'(\d+)\s+(?:users?|seats?|licenses?)', body_text, re.IGNORECASE)
            qty = float(qty_match.group(1)) if qty_match else 50.0
            quantities.append({
                "name": "Enterprise Software Licenses",
                "description": f"Annual subscription for {int(qty)} active users with SSO and admin control",
                "quantity": qty,
                "unit": "licenses"
            })
            features.append(f"Enterprise provisioning for {int(qty)} concurrent team members")
            features.append("Role-based access control (RBAC) and SAML 2.0 / Okta integration")
            missing.append("Specify whether hosted in customer VPC or multi-tenant SaaS cloud")

        if "cloud" in text_lower or "aws" in text_lower or "azure" in text_lower or "infrastructure" in text_lower or "migration" in text_lower:
            quantities.append({
                "name": "Cloud Architecture & Migration",
                "description": "High-availability cloud topology setup, CI/CD pipelines, and migration",
                "quantity": 1.0,
                "unit": "setup"
            })
            features.append("Multi-region redundant cloud environment setup with automated failover")
            features.append("Infrastructure-as-Code (Terraform) scripts and automated deployment pipelines")
            additional.append("99.99% SLA uptime guarantee and automated daily snapshots")

        if "security" in text_lower or "audit" in text_lower or "compliance" in text_lower or "soc" in text_lower:
            quantities.append({
                "name": "Enterprise Security Audit & Hardening",
                "description": "SOC2/GDPR compliance verification, vulnerability scan, and penetration testing",
                "quantity": 1.0,
                "unit": "assessment"
            })
            features.append("Comprehensive penetration testing and compliance audit report")
            additional.append("GDPR and SOC2 Type II compliance controls documentation")

        if "custom" in text_lower or "api" in text_lower or "integration" in text_lower or "web" in text_lower or "portal" in text_lower:
            quantities.append({
                "name": "Custom Full-Stack Web Application",
                "description": "End-to-end custom application development with responsive modern dashboard",
                "quantity": 1.0,
                "unit": "project"
            })
            features.append("Modern responsive web application frontend built with React and Tailwind")
            features.append("RESTful/GraphQL API endpoints with JWT authentication and webhook support")

        if "support" in text_lower or "maintenance" in text_lower or "sla" in text_lower:
            quantities.append({
                "name": "24/7 Dedicated Support SLA",
                "description": "Round-the-clock priority technical support with 15-minute response time",
                "quantity": 12.0,
                "unit": "months"
            })
            features.append("24/7/365 priority tier-1 incident support and dedicated Slack channel")

        # Fallback if no specific triggers
        if not quantities:
            quantities.append({
                "name": "Professional B2B Consulting & Implementation",
                "description": f"Tailored service delivery addressing requirements in email: {subject}",
                "quantity": 1.0,
                "unit": "engagement"
            })
            features.append("Requirement discovery and technical architecture blueprint")
            features.append("End-to-end implementation, validation, and user acceptance testing")

        if not budget:
            missing.append("Client target budget allocation not stated in initial email")

        if "timeline" not in text_lower:
            missing.append("Exact hard deadline or delivery milestone dates unconfirmed")

        project_name = f"{subject.replace('Re:', '').replace('Fwd:', '').strip()} Implementation"
        if len(project_name) > 60:
            project_name = project_name[:60] + "..."

        model_note = "Smart Rule-Based Engine (Offline Fallback)"
        if error_msg:
            model_note += f" [Gemini Fallback: {error_msg[:40]}]"

        return {
            "client_name": contact_name,
            "client_company": company,
            "contact": {
                "name": contact_name,
                "email": sender_email,
                "phone": phone,
                "role": "Procurement / Technical Lead"
            },
            "project_name": project_name,
            "project_description": f"Comprehensive solution proposal engineered for {company} to fulfill the specific service requirements outlined in communication regarding '{subject}'. Designed for scalability, enterprise reliability, and accelerated time-to-value.",
            "features_and_scope": features,
            "quantities": quantities,
            "expected_timeline": timeline,
            "budget": budget,
            "additional_requirements": additional or ["Standard 30-day warranty post-delivery", "Enterprise data confidentiality & NDA"],
            "missing_information": missing,
            "confidence_score": 0.92,
            "ai_model_used": model_note
        }

    def polish_proposal_text(self, text: str, action: str = "professional") -> str:
        """
        Enhances proposal text (e.g. project overview, scope, executive summary)
        """
        from backend.app.config import settings
        if self.client and self.api_key:
            try:
                action_instructions = {
                    "professional": "Rewrite this text in a polished, formal executive B2B consulting tone:",
                    "persuasive": "Rewrite this text to be highly persuasive, highlighting competitive ROI and value proposition:",
                    "executive": "Condense this text into a high-impact C-suite executive summary:",
                    "bullet_points": "Format this text into clear, crisp, executive bullet points with bold keywords:"
                }
                instr = action_instructions.get(action, "Polish and improve this text:")
                resp = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=f"{instr}\n\n\"{text}\""
                )
                return resp.text.strip()
            except Exception as e:
                logger.error(f"Error polishing text with Gemini: {e}")
        
        # Heuristic enhancement fallback
        if action == "executive":
            return f"Executive Summary: {text.strip()} Our structured approach guarantees enterprise alignment, reduced operational risk, and measurable ROI from Phase 1 onward."
        elif action == "persuasive":
            return f"Transformative Value: By executing this initiative, your organization will unlock enhanced productivity, modern architecture standards, and seamless workflow automation: {text.strip()}"
        elif action == "bullet_points":
            lines = [l.strip() for l in text.split(".") if l.strip()]
            return "\n".join([f"• **Key Deliverable**: {l}." for l in lines])
        
        return f"{text.strip()} All deliverables will adhere to enterprise best practices and industry compliance benchmarks."

ai_service = AIService()
