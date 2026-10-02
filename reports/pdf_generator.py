"""
PDF Report Generator for CV-INTEGRITY
Generates professional PDF reports with all metrics
"""

import json
from pathlib import Path
from datetime import datetime

try:
    from reportlab.lib.pagesizes import A4, letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, cm
    from reportlab.lib.colors import HexColor, black, white
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        PageBreak, Image, KeepTogether
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("⚠️ reportlab not installed!")
    print("   Run: pip install reportlab")


class PDFReportGenerator:
    """Generate professional PDF reports for CV-INTEGRITY"""
    
    def __init__(self, output_dir='outputs/reports/pdf'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir = Path('outputs/reports')
        
        # Colors
        self.colors = {
            'primary': HexColor('#00D9A3'),
            'secondary': HexColor('#5B8DEF'),
            'warning': HexColor('#FFB84D'),
            'danger': HexColor('#FF4757'),
            'dark': HexColor('#0A0E1A'),
            'surface': HexColor('#151A2E'),
            'text': HexColor('#1A1A1A'),
            'muted': HexColor('#6B7394')
        }
    
    def _load_json(self, filename):
        """Load JSON data"""
        path = self.reports_dir / filename
        if path.exists():
            with open(path, 'r') as f:
                return json.load(f)
        return None
    
    def _create_styles(self):
        """Create custom paragraph styles"""
        styles = getSampleStyleSheet()
        
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=self.colors['primary'],
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=self.colors['muted'],
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))
        
        styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=self.colors['text'],
            spaceBefore=20,
            spaceAfter=12,
            fontName='Helvetica-Bold'
        ))
        
        styles.add(ParagraphStyle(
            name='CustomBody',
            parent=styles['BodyText'],
            fontSize=11,
            textColor=self.colors['text'],
            leading=16
        ))
        
        styles.add(ParagraphStyle(
            name='CustomMetric',
            parent=styles['BodyText'],
            fontSize=24,
            textColor=self.colors['primary'],
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        return styles
    
    def _create_header(self, styles):
        """Create report header"""
        elements = []
        
        # Title
        elements.append(Paragraph("🤖 CV-INTEGRITY AI", styles['CustomTitle']))
        elements.append(Paragraph(
            "Computer Vision Model Trust & Quality Evaluation Report",
            styles['CustomSubtitle']
        ))
        
        # Timestamp
        timestamp = datetime.now().strftime("%B %d, %Y at %H:%M")
        elements.append(Paragraph(
            f"<b>Generated:</b> {timestamp}",
            styles['CustomBody']
        ))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Divider
        divider = Table([['']], colWidths=[7 * inch], rowHeights=[2])
        divider.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), self.colors['primary']),
        ]))
        elements.append(divider)
        elements.append(Spacer(1, 0.3 * inch))
        
        return elements
    
    def _create_summary_table(self, styles):
        """Create executive summary table"""
        elements = []
        
        elements.append(Paragraph("📊 Executive Summary", styles['SectionHeader']))
        
        # Load data
        trust_data = self._load_json('final_trust_report.json')
        decision_data = self._load_json('deployment_decision.json')
        
        if trust_data:
            # Build table data
            table_data = [['Dataset', 'Trust Score', 'Decision', 'Status']]
            
            for ds, data in trust_data.items():
                score = data.get('final_score', 0)
                decision = data.get('decision', 'N/A')
                icon = data.get('icon', '🟢')
                
                table_data.append([
                    ds.upper(),
                    f"{score:.1f}%",
                    decision.replace('✅', '').replace('⚠️', '').replace('❌', '').strip(),
                    icon
                ])
            
            table = Table(table_data, colWidths=[1.5*inch, 1.5*inch, 2.5*inch, 1*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),
                ('TEXTCOLOR', (0, 0), (-1, 0), white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F5F5F5')),
                ('GRID', (0, 0), (-1, -1), 1, self.colors['muted']),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(table)
        
        elements.append(Spacer(1, 0.3 * inch))
        return elements
    
    def _create_dataset_quality_section(self, styles):
        """Create dataset quality section"""
        elements = []
        
        elements.append(PageBreak())
        elements.append(Paragraph("📊 Dataset Quality Analysis", styles['SectionHeader']))
        
        for ds in ['good', 'bad', 'worst']:
            data = self._load_json(f'{ds}_quality_report.json')
            if data:
                scores = data.get('scores', {})
                
                elements.append(Paragraph(
                    f"<b>{ds.upper()} Dataset</b>",
                    styles['CustomBody']
                ))
                
                # Metrics table
                metrics = [
                    ['Metric', 'Score'],
                    ['Overall Quality', f"{scores.get('overall_score', 0):.1f}%"],
                    ['Blur Score', f"{scores.get('blur_score', 0):.1f}%"],
                    ['Duplicate Score', f"{scores.get('duplicate_score', 0):.1f}%"],
                    ['Noise Score', f"{scores.get('noise_score', 0):.1f}%"],
                    ['Total Images', str(data.get('total_images', 0))],
                ]
                
                table = Table(metrics, colWidths=[3*inch, 2*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), self.colors['secondary']),
                    ('TEXTCOLOR', (0, 0), (-1, 0), white),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 1), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                    ('TOPPADDING', (0, 1), (-1, -1), 6),
                    ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
                    ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F9F9F9')),
                    ('GRID', (0, 0), (-1, -1), 0.5, self.colors['muted']),
                ]))
                elements.append(table)
                elements.append(Spacer(1, 0.2 * inch))
        
        return elements
    
    def _create_model_performance_section(self, styles):
        """Create model performance section"""
        elements = []
        
        elements.append(Paragraph("🤖 Model Performance", styles['SectionHeader']))
        
        # Load model data
        model_data = None
        model_path = Path('model/saved_models/all_training_results.json')
        if model_path.exists():
            with open(model_path, 'r') as f:
                model_data = json.load(f)
        
        if model_data:
            table_data = [['Model', 'Precision', 'Recall', 'mAP50', 'mAP50-95']]
            
            for model, info in model_data.items():
                m = info.get('metrics', {})
                table_data.append([
                    model.upper(),
                    f"{m.get('precision', 0)*100:.2f}%",
                    f"{m.get('recall', 0)*100:.2f}%",
                    f"{m.get('mAP50', 0)*100:.2f}%",
                    f"{m.get('mAP50_95', 0)*100:.2f}%",
                ])
            
            table = Table(table_data, colWidths=[1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['warning']),
                ('TEXTCOLOR', (0, 0), (-1, 0), white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('TOPPADDING', (0, 1), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F9F9F9')),
                ('GRID', (0, 0), (-1, -1), 0.5, self.colors['muted']),
            ]))
            elements.append(table)
        
        elements.append(Spacer(1, 0.3 * inch))
        return elements
    
    def _create_blockchain_section(self, styles):
        """Create blockchain section"""
        elements = []
        
        elements.append(PageBreak())
        elements.append(Paragraph("🔗 Blockchain Integrity", styles['SectionHeader']))
        
        # Blockchain data
        bc_data = self._load_json('blockchain.json')
        if bc_data:
            info = [
                ['Property', 'Value'],
                ['Total Blocks', str(bc_data.get('length', 0))],
                ['Chain Status', 'VALID' if bc_data.get('is_valid') else 'INVALID'],
                ['Difficulty', str(bc_data.get('difficulty', 2))],
                ['Hash Algorithm', 'SHA-256'],
            ]
            
            table = Table(info, colWidths=[3*inch, 2*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),
                ('TEXTCOLOR', (0, 0), (-1, 0), white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('TOPPADDING', (0, 1), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F9F9F9')),
                ('GRID', (0, 0), (-1, -1), 0.5, self.colors['muted']),
            ]))
            elements.append(table)
        
        # Tamper detection
        tamper_data = self._load_json('tamper_detection.json')
        if tamper_data:
            elements.append(Spacer(1, 0.2 * inch))
            elements.append(Paragraph("<b>Tamper Detection</b>", styles['CustomBody']))
            
            info = [
                ['Clean Files', str(tamper_data.get('total_clean', 0))],
                ['Tampered Files', str(tamper_data.get('total_tampered', 0))],
                ['Verified At', tamper_data.get('verified_at', 'N/A')[:16]],
            ]
            
            table = Table(info, colWidths=[3*inch, 2*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), HexColor('#F9F9F9')),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 0.5, self.colors['muted']),
            ]))
            elements.append(table)
        
        # Cyber attacks
        attack_data = self._load_json('cyber_attacks.json')
        if attack_data:
            elements.append(Spacer(1, 0.2 * inch))
            elements.append(Paragraph("<b>Cybersecurity Attack Simulation</b>", styles['CustomBody']))
            
            info = [
                ['Total Attacks', str(attack_data.get('total_attacks', 0))],
                ['Detected', str(attack_data.get('detected', 0))],
                ['Detection Rate', f"{attack_data.get('detection_rate', 0):.1f}%"],
            ]
            
            table = Table(info, colWidths=[3*inch, 2*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), HexColor('#F9F9F9')),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 0.5, self.colors['muted']),
            ]))
            elements.append(table)
        
        return elements
    
    def _create_footer(self, canvas, doc):
        """Create page footer"""
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(self.colors['muted'])
        
        # Footer line
        canvas.setStrokeColor(self.colors['primary'])
        canvas.setLineWidth(1)
        canvas.line(1*inch, 0.75*inch, 7.5*inch, 0.75*inch)
        
        # Footer text
        canvas.drawString(1*inch, 0.5*inch, "CV-INTEGRITY AI | SIH 2026")
        canvas.drawRightString(7.5*inch, 0.5*inch, f"Page {doc.page}")
        
        canvas.restoreState()
    
    def generate_full_report(self, filename='CV_INTEGRITY_Full_Report.pdf'):
        """Generate complete PDF report"""
        if not REPORTLAB_AVAILABLE:
            print("❌ reportlab not installed!")
            return None
        
        output_path = self.output_dir / filename
        
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=A4,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=1*inch
        )
        
        styles = self._create_styles()
        elements = []
        
        # Build report
        elements.extend(self._create_header(styles))
        elements.extend(self._create_summary_table(styles))
        elements.extend(self._create_dataset_quality_section(styles))
        elements.extend(self._create_model_performance_section(styles))
        elements.extend(self._create_blockchain_section(styles))
        
        # Build PDF
        doc.build(elements, onFirstPage=self._create_footer, onLaterPages=self._create_footer)
        
        print(f"✅ PDF generated: {output_path}")
        return str(output_path)
    
    def generate_trust_certificate(self, filename='Trust_Certificate.pdf'):
        """Generate trust certificate"""
        if not REPORTLAB_AVAILABLE:
            return None
        
        output_path = self.output_dir / filename
        doc = SimpleDocTemplate(str(output_path), pagesize=A4)
        styles = self._create_styles()
        elements = []
        
        elements.append(Spacer(1, 1 * inch))
        elements.append(Paragraph("🏆 TRUST CERTIFICATE", styles['CustomTitle']))
        elements.append(Spacer(1, 0.5 * inch))
        
        trust_data = self._load_json('final_trust_report.json')
        if trust_data:
            for ds, data in trust_data.items():
                score = data.get('final_score', 0)
                decision = data.get('decision', 'N/A')
                
                elements.append(Paragraph(
                    f"<b>{ds.upper()} Dataset</b>",
                    styles['CustomBody']
                ))
                elements.append(Paragraph(
                    f"Trust Score: {score:.1f}%",
                    styles['CustomMetric']
                ))
                elements.append(Paragraph(
                    f"Decision: {decision}",
                    styles['CustomBody']
                ))
                elements.append(Spacer(1, 0.3 * inch))
        
        doc.build(elements, onFirstPage=self._create_footer, onLaterPages=self._create_footer)
        print(f"✅ Certificate generated: {output_path}")
        return str(output_path)


if __name__ == "__main__":
    print("\n" + "="*60)
    print("📄 PDF REPORT GENERATOR")
    print("="*60 + "\n")
    
    if not REPORTLAB_AVAILABLE:
        print("❌ Install reportlab first:")
        print("   pip install reportlab")
        exit(1)
    
    generator = PDFReportGenerator()
    
    print("📝 Generating full report...")
    full_report = generator.generate_full_report()
    
    print("\n📝 Generating trust certificate...")
    certificate = generator.generate_trust_certificate()
    
    print("\n" + "="*60)
    print("✅ PDF Reports generated!")
    print(f"   📄 {full_report}")
    print(f"   🏆 {certificate}")
    print("="*60)