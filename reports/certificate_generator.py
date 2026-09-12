"""
Blockchain Trust Certificate Generator
Creates PDF certificates with blockchain verification
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime
from pathlib import Path

try:
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor, white, black
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        Image, PageBreak
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("⚠️ reportlab not installed!")


class CertificateGenerator:
    """Generate blockchain trust certificates"""
    
    def __init__(self, output_dir='outputs/reports/certificates'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir = Path('outputs/reports')
        
        self.colors = {
            'primary': HexColor('#00D9A3'),
            'secondary': HexColor('#5B8DEF'),
            'gold': HexColor('#FFB84D'),
            'dark': HexColor('#0A0E1A'),
            'text': HexColor('#1A1A1A'),
            'muted': HexColor('#6B7394'),
            'danger': HexColor('#FF4757')
        }
    
    def _load_json(self, filename):
        """Load JSON file"""
        path = self.reports_dir / filename
        if path.exists():
            with open(path, 'r') as f:
                return json.load(f)
        return None
    
    def _draw_border(self, canvas, doc):
        """Draw decorative border on certificate"""
        canvas.saveState()
        width, height = landscape(A4)
        
        # Outer border
        canvas.setStrokeColor(self.colors['primary'])
        canvas.setLineWidth(8)
        canvas.rect(30, 30, width - 60, height - 60)
        
        # Inner border
        canvas.setStrokeColor(self.colors['secondary'])
        canvas.setLineWidth(2)
        canvas.rect(50, 50, width - 100, height - 100)
        
        canvas.restoreState()
    
    def _draw_header(self, canvas, doc):
        """Draw header on certificate"""
        canvas.saveState()
        width, height = landscape(A4)
        
        # Title background
        canvas.setFillColor(self.colors['dark'])
        canvas.rect(60, height - 130, width - 120, 70, fill=1, stroke=0)
        
        # Title text
        canvas.setFillColor(self.colors['primary'])
        canvas.setFont('Helvetica-Bold', 32)
        canvas.drawCentredString(width/2, height - 100, "CV-INTEGRITY AI")
        
        # Subtitle
        canvas.setFillColor(self.colors['muted'])
        canvas.setFont('Helvetica', 14)
        canvas.drawCentredString(width/2, height - 125, "Blockchain Trust Certificate")
        
        canvas.restoreState()
    
    def _draw_footer(self, canvas, doc):
        """Draw footer with blockchain info"""
        canvas.saveState()
        width, height = landscape(A4)
        
        # Certificate ID
        cert_id = f"CVIT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        canvas.setFillColor(self.colors['muted'])
        canvas.setFont('Helvetica', 10)
        canvas.drawString(70, 60, f"Certificate ID: {cert_id}")
        canvas.drawRightString(width - 70, 60, f"Issued: {datetime.now().strftime('%B %d, %Y')}")
        
        # Blockchain verification
        canvas.setFillColor(self.colors['primary'])
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawCentredString(width/2, 60, "🔐 BLOCKCHAIN VERIFIED")
        
        canvas.restoreState()
    
    def generate_certificate(self, dataset_name, filename=None):
        """Generate a single trust certificate"""
        if not REPORTLAB_AVAILABLE:
            return None
        
        if filename is None:
            filename = f"Trust_Certificate_{dataset_name.upper()}.pdf"
        
        output_path = self.output_dir / filename
        
        # Load trust data
        trust_data = self._load_json('final_trust_report.json')
        if not trust_data or dataset_name.lower() not in trust_data:
            print(f"❌ No trust data for {dataset_name}")
            return None
        
        data = trust_data[dataset_name.lower()]
        score = data.get('final_score', 0)
        decision = data.get('decision', 'N/A')
        components = data.get('components', {})
        
        # Create PDF
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=landscape(A4),
            rightMargin=70,
            leftMargin=70,
            topMargin=150,
            bottomMargin=100
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'Title', parent=styles['Heading1'],
            fontSize=24, textColor=self.colors['text'],
            alignment=TA_CENTER, spaceAfter=20,
            fontName='Helvetica-Bold'
        )
        
        score_style = ParagraphStyle(
            'Score', parent=styles['Heading1'],
            fontSize=64, textColor=self.colors['primary'],
            alignment=TA_CENTER, spaceAfter=10,
            fontName='Helvetica-Bold'
        )
        
        elements = []
        
        # Dataset name
        elements.append(Paragraph(
            f"<b>{dataset_name.upper()} DATASET</b>",
            title_style
        ))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Trust Score
        elements.append(Paragraph(
            f"{score:.1f}%",
            score_style
        ))
        elements.append(Spacer(1, 0.2 * inch))
        
        # Decision
        decision_style = ParagraphStyle(
            'Decision', parent=styles['Heading2'],
            fontSize=28, textColor=self.colors['text'],
            alignment=TA_CENTER, spaceAfter=20,
            fontName='Helvetica-Bold'
        )
        
        decision_clean = decision.replace('✅', '').replace('⚠️', '').replace('❌', '').strip()
        elements.append(Paragraph(
            f"DECISION: {decision_clean}",
            decision_style
        ))
        
        elements.append(Spacer(1, 0.3 * inch))
        
        # Components table
        table_data = [['Component', 'Score']]
        for comp, value in components.items():
            comp_name = comp.replace('_', ' ').title()
            table_data.append([comp_name, f"{value:.1f}%"])
        
        table = Table(table_data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F5F5F5')),
            ('GRID', (0, 0), (-1, -1), 1, self.colors['muted']),
        ]))
        elements.append(table)
        
        # Build PDF
        doc.build(
            elements,
            onFirstPage=lambda c, d: (self._draw_border(c, d), self._draw_header(c, d), self._draw_footer(c, d)),
            onLaterPages=lambda c, d: (self._draw_border(c, d), self._draw_footer(c, d))
        )
        
        print(f"✅ Certificate generated: {output_path}")
        return str(output_path)
    
    def generate_all_certificates(self):
        """Generate certificates for all datasets"""
        if not REPORTLAB_AVAILABLE:
            print("❌ reportlab not installed!")
            return []
        
        certificates = []
        for dataset in ['good', 'bad', 'worst']:
            cert = self.generate_certificate(dataset)
            if cert:
                certificates.append(cert)
        
        return certificates


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏆 BLOCKCHAIN TRUST CERTIFICATE GENERATOR")
    print("="*60 + "\n")
    
    if not REPORTLAB_AVAILABLE:
        print("❌ Install reportlab:")
        print("   pip install reportlab")
        exit(1)
    
    generator = CertificateGenerator()
    
    print("📝 Generating certificates for all datasets...")
    certificates = generator.generate_all_certificates()
    
    print("\n" + "="*60)
    print(f"✅ Generated {len(certificates)} certificates!")
    for cert in certificates:
        print(f"   📄 {cert}")
    print("="*60)