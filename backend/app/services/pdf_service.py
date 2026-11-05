import os
import logging
from jinja2 import Environment, FileSystemLoader, select_autoescape
from playwright.sync_api import sync_playwright
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        templates_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
        self.jinja_env = Environment(
            loader=FileSystemLoader(templates_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )
        self.output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "generated_pdfs"))
        os.makedirs(self.output_dir, exist_ok=True)

    def render_html(self, proposal_data: Dict[str, Any], template_id: str = "modern") -> str:
        """
        Renders Jinja2 HTML string for the requested template
        """
        template_name = f"{template_id}.html"
        if template_name not in ["modern.html", "corporate.html", "minimal.html"]:
            template_name = "modern.html"
        
        template = self.jinja_env.get_template(template_name)
        return template.render(proposal=proposal_data)

    def generate_pdf(self, proposal_data: Dict[str, Any], template_id: Optional[str] = None) -> str:
        """
        Generates high-definition A4 PDF file using Playwright Chromium
        Returns absolute file path to the generated PDF.
        """
        active_template = template_id or proposal_data.get("template_id", "modern")
        html_content = self.render_html(proposal_data, active_template)
        
        proposal_id = proposal_data.get("id", "PROPOSAL").replace("/", "-")
        pdf_filename = f"{proposal_id}_{active_template}.pdf"
        output_path = os.path.join(self.output_dir, pdf_filename)

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
                page = browser.new_page()
                page.set_content(html_content, wait_until="networkidle")
                page.pdf(
                    path=output_path,
                    format="A4",
                    print_background=True,
                    margin={
                        "top": "0mm",
                        "bottom": "0mm",
                        "left": "0mm",
                        "right": "0mm"
                    }
                )
                browser.close()
            
            logger.info(f"Generated PDF successfully at {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Playwright PDF generation failed: {e}")
            # If PDF generation encounters an issue, write the HTML file so it can be viewed or printed
            html_fallback_path = output_path.replace(".pdf", ".html")
            with open(html_fallback_path, "w", encoding="utf-8") as f:
                f.write(html_content)
            return html_fallback_path

pdf_service = PDFService()
