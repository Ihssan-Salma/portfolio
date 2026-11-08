from pathlib import Path

from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Image, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

ROOT = Path(__file__).parent
OUT = ROOT / "CV_Salma_Ihssan_PFE_2027_updated.pdf"

pdfmetrics.registerFont(TTFont("SegoeUI", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("SegoeUI-Bold", r"C:\Windows\Fonts\segoeuib.ttf"))

doc = SimpleDocTemplate(
    str(OUT), pagesize=A4, rightMargin=1.35 * cm, leftMargin=1.35 * cm,
    topMargin=0.9 * cm, bottomMargin=0.85 * cm,
    title="Salma IHSSAN — CV", author="Salma IHSSAN",
)
styles = getSampleStyleSheet()
body = ParagraphStyle("body", parent=styles["BodyText"], fontName="SegoeUI", fontSize=9.1,
                      leading=10.7, spaceAfter=1, textColor="#111111", alignment=TA_LEFT)
small = ParagraphStyle("small", parent=body, fontSize=8.5, leading=10.2)
head = ParagraphStyle("head", parent=body, fontSize=9.5, leading=11.5, spaceBefore=5, spaceAfter=4,
                      textColor="#111111")
name = ParagraphStyle("name", parent=body, fontName="SegoeUI-Bold", fontSize=24, leading=27, spaceAfter=3)
title = ParagraphStyle("title", parent=body, fontSize=10.3, leading=12.2)
section = ParagraphStyle("section", parent=body, fontSize=10.8, leading=12, spaceBefore=4,
                         spaceAfter=4, textColor="#111111")
project = ParagraphStyle("project", parent=body, fontSize=9.1, leading=10.7, spaceBefore=1)

def P(text, style=body):
    return Paragraph(text, style)

def section_block(label, *items):
    return [P(label.upper(), section), *items]

photo = Image(str(ROOT / "assets" / "salma-ihssan-portrait.png"), width=3.05 * cm, height=3.60 * cm)
header_left = [P("<b>Salma IHSSAN</b>", name),
               P("École Centrale de Lyon — Promotion 2027", title),
               P("Intelligence artificielle &amp; génie logiciel", title),
               P("Stage PFE de 6 mois dès avril 2027", title),
               P("Lyon, France — Mobilité : France", title), Spacer(1, 5),
               P("<b>Tél. :</b> +33 7 45 20 74 18  <b>Email :</b> <link href='mailto:salma.ihssan.pro@gmail.com'>salma.ihssan.pro@gmail.com</link>", small),
               P("<b>LinkedIn :</b> <link href='https://linkedin.com/in/ihssan-salma'>linkedin.com/in/ihssan-salma</link>  <b>GitHub :</b> <link href='https://github.com/Ihssan-Salma'>github.com/Ihssan-Salma</link>", small),
               P("<b>Portfolio :</b> <link href='https://ihssan-salma.github.io/portfolio/'>ihssan-salma.github.io/portfolio/</link>", small)]
header = Table([[header_left, photo]], colWidths=[13.2 * cm, 3.05 * cm], hAlign="LEFT")
header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))

story = [header]
story += section_block("Profil", P("Élève-ingénieure en double cursus ENSAM Meknès–Centrale Lyon et en Master 2 IA, avec une expérience en traitement de réclamations bancaires par LLM, RAG et orchestration d’agents. Intérêt pour l’IA agentique, l’automatisation et le génie logiciel."))
story += section_block("Formation",
    P("<b>École Centrale de Lyon — France</b> <font color='#444444'>2026–2027</font><br/><i>3e année du cycle ingénieur, option Informatique ; Master 2 Intelligence Artificielle.</i>"),
    P("<b>ENSAM Meknès — Maroc</b> <font color='#444444'>2022–2026</font><br/><i>Cycle ingénieur : génie logiciel et systèmes intelligents (2024–2026). Classes préparatoires intégrées (2022–2024).</i>"))
story += section_block("Expériences professionnelles",
    P("<b>Stagiaire ingénieure IA &amp; Data — Attijariwafa bank</b> <font color='#444444'>Été 2026</font><br/><i>Casablanca, Maroc</i><br/>• Conception d’un système de traitement des réclamations bancaires avec Llama 3, LangGraph, RAG et MCP : extraction d’informations, analyse de l’insatisfaction et de la sensibilité, priorisation et alertes urgentes.<br/>• Détection et masquage des données personnelles (PII) pour sécuriser le traitement."),
    P("<b>Stagiaire Data Analyst — Autoroutes du Maroc</b> <font color='#444444'>Été 2025</font><br/><i>Rabat, Maroc</i><br/>• Analyse du trafic 2022–2024 : modèle en étoile, mesures DAX et tableaux de bord Power BI pour identifier les tendances de congestion."))
story += section_block("Projets sélectionnés",
    P("<b>ReSlot AI — remplacement des réservations annulées</b> <font color='#444444'>2026 — en cours</font><br/>Architecture prévue à quatre agents pour vérifier les créneaux, sélectionner les clients, notifier et suivre les réponses ; intégration Gmail, Calendar et Sheets avec isolation par entreprise.<br/><i>Stack :</i> Python, FastAPI, MCP, PostgreSQL, Docker ; LangGraph en cours.", project),
    P("<b>Reconnaissance des émotions faciales</b> <font color='#444444'>2026</font><br/>Classification de sept expressions sur FER2013 par CNN, avec augmentation, équilibrage, évaluation F1 et démonstration vidéo avec suivi des visages.<br/><i>Stack :</i> TensorFlow/Keras, OpenCV, CNN.", project),
    P("<b>eGrading — plateforme d’évaluation académique</b> <font color='#444444'>2025</font><br/>Espaces administrateur, enseignant et étudiant pour travaux, dépôts, correction et retours ; API REST et interface web.<br/><i>Stack :</i> Spring Boot, React/TypeScript, MySQL, MongoDB.", project),
    P("<b>Agile Tracker — gestion de projets en microservices</b> <font color='#444444'>Projet académique</font><br/>Backend des équipes, backlogs, sprints, tâches et temps ; bases séparées par domaine et services conteneurisés.<br/><i>Stack :</i> Java 17, Spring Boot/JPA, PostgreSQL, Docker Compose.", project))
story += section_block("Compétences techniques",
    P("<b>IA &amp; data :</b> Python, LLM, LangChain, LangGraph, LangSmith, RAG, MCP, PyTorch, TensorFlow, OpenCV, Pandas, NumPy, scikit-learn, Power BI."),
    P("<b>Développement :</b> Java, JavaScript, C++, SQL, NoSQL, FastAPI, React."),
    P("<b>Outils &amp; méthodes :</b> Docker, Git, Linux, Prometheus, Grafana, Kubernetes (notions), Agile, Scrum, Jira."))
story += section_block("Certifications & langues",
    P("Linux Essentials — LPI ; Agents Fundamentals — Hugging Face.<br/>Designing Agentic Systems with LangChain ; Multi-Agent Systems with LangGraph — DataCamp.<br/>Introduction to Model Context Protocol — Claude Academy.<br/><b>Langues :</b> Français B2 ; Anglais B2 ; Arabe : langue maternelle."))
story += section_block("Engagements & ouverture",
    P("<b>Groupama / Centrale Lyon (2026) :</b> étude prospective des besoins agricoles à l’horizon 2040, proposition de valeur, modèle économique et pitch collectif.<br/><b>Hackathons :</b> Aidant 2026 (Sopra Steria, Crédit Agricole) ; Ramadan IA 2026.<br/><b>Vie associative :</b> membre active de Gadz’IT et du club social de l’ENSAM."))

doc.build(story)
print(OUT)
