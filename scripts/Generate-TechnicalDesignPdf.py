from __future__ import annotations

from html import escape
from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, Preformatted, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "technical-design.md"
OUTPUTS = [
    ROOT / "TECHNICAL_DESIGN.pdf",
    ROOT / "MonoKey-Technical-Design.pdf",
    ROOT / "output" / "pdf" / "MonoKey-Technical-Design.pdf",
]

FONT_REGULAR = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\seguisb.ttf")
if FONT_REGULAR.exists() and FONT_BOLD.exists():
    pdfmetrics.registerFont(TTFont("MonoKeySans", str(FONT_REGULAR)))
    pdfmetrics.registerFont(TTFont("MonoKeySansBold", str(FONT_BOLD)))
else:
    raise RuntimeError("Segoe UI fonts were not found.")

BRAND = colors.HexColor("#4650D8")
INK = colors.HexColor("#101828")
SECONDARY = colors.HexColor("#475467")
BORDER = colors.HexColor("#DDE3EC")
CANVAS = colors.HexColor("#FCFCFA")


def normalize(value: str) -> str:
    return value.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")


def inline(value: str) -> str:
    safe = escape(normalize(value))
    return re.sub(r"`([^`]+)`", r'<font name="Courier">\1</font>', safe)


def decorate_page(canvas, document) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(CANVAS)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setStrokeColor(BORDER)
    canvas.line(20 * mm, 16 * mm, width - 20 * mm, 16 * mm)
    canvas.setFont("MonoKeySans", 8)
    canvas.setFillColor(SECONDARY)
    canvas.drawString(20 * mm, 10 * mm, "MonoKey Technical Design - implementation-aligned")
    canvas.drawRightString(width - 20 * mm, 10 * mm, f"Page {document.page}")
    canvas.restoreState()


def build_story() -> list:
    styles = getSampleStyleSheet()
    body = ParagraphStyle("Body", parent=styles["BodyText"], fontName="MonoKeySans", fontSize=9.5, leading=14, textColor=INK, spaceAfter=6)
    h1 = ParagraphStyle("H1", parent=body, fontName="MonoKeySansBold", fontSize=20, leading=24, textColor=INK, spaceBefore=7, spaceAfter=10)
    h2 = ParagraphStyle("H2", parent=body, fontName="MonoKeySansBold", fontSize=14, leading=18, textColor=BRAND, spaceBefore=12, spaceAfter=7, keepWithNext=True)
    bullet = ParagraphStyle("Bullet", parent=body, leftIndent=12, firstLineIndent=-8, bulletIndent=2, spaceAfter=4)
    code = ParagraphStyle("Code", parent=body, fontName="Courier", fontSize=7.4, leading=10, leftIndent=8, rightIndent=8, borderColor=BORDER, borderWidth=0.7, borderPadding=7, backColor=colors.white, spaceBefore=4, spaceAfter=9)
    cover_title = ParagraphStyle("CoverTitle", parent=h1, fontSize=30, leading=36, alignment=TA_CENTER, textColor=INK)
    cover_subtitle = ParagraphStyle("CoverSubtitle", parent=body, fontSize=13, leading=19, alignment=TA_CENTER, textColor=SECONDARY)

    story = [Spacer(1, 54 * mm), Paragraph("MonoKey", cover_title), Spacer(1, 4 * mm), Paragraph("Technical Design", cover_title), Spacer(1, 9 * mm), Paragraph(".NET 10 modular monolith, subscription management, and end-to-end encrypted vault", cover_subtitle), Spacer(1, 7 * mm), Paragraph("Implementation snapshot - 29 September 2026", cover_subtitle), PageBreak()]
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    in_code = False
    code_lines: list[str] = []
    for raw in lines:
        line = normalize(raw.rstrip())
        if line.startswith("```"):
            if in_code:
                story.append(Preformatted("\n".join(code_lines), code))
                code_lines = []
                in_code = False
            else:
                in_code = True
            continue
        if in_code:
            code_lines.append(line)
            continue
        if not line:
            continue
        elif line.startswith("# "):
            story.append(Paragraph(inline(line[2:]), h1))
        elif line.startswith("## "):
            story.append(Paragraph(inline(line[3:]), h2))
        elif line.startswith("- "):
            story.append(Paragraph(inline(line[2:]), bullet, bulletText="-"))
        else:
            story.append(Paragraph(inline(line), body))
    return story


for output in OUTPUTS:
    output.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(str(output), pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm, topMargin=18 * mm, bottomMargin=22 * mm, title="MonoKey Technical Design", author="MonoKey")
    document.build(build_story(), onFirstPage=decorate_page, onLaterPages=decorate_page)
    if output.stat().st_size < 10_000:
        raise RuntimeError(f"Generated PDF is unexpectedly small: {output}")
    print(output)
