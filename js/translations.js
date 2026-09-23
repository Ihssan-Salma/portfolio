const translations = {
    en: {
        nav_about: "About",
        nav_experience: "Experience",
        nav_projects: "Projects",
        nav_techstack: "Tech Stack",
        nav_education: "Education",
        nav_certs: "Certifications",
        btn_get_in_touch: "CONTACT",
        
        hero_greeting: "Good evening —",
        hero_role: "Data Scientist | AI Engineer",
        hero_desc: "I am an engineering student at Centrale Lyon concurrently completing a Master's degree specialized in Artificial Intelligence. I am currently looking for a PFE internship starting March 2027. Mobility: Europe-wide.",
        btn_resume: "CONTACT",
        
        section_experience: "Experience",
        exp1_role: "Data Scientist/ AI Engineer Intern",
        exp1_date: "Summer 2026",
        exp1_company: "Attijariwafa bank – Casablanca, Morocco",
        exp1_desc: "Developed an AI-powered banking complaint processing system, leveraging Llama 3, LangGraph, RAG, and MCP to extract key information, assess dissatisfaction levels, determine complaint priority, and trigger automated alerts for urgent cases. Implemented PII detection and masking to ensure strict data security and compliance throughout the pipeline.",
        
        exp2_role: "Data Analyst Intern",
        exp2_date: "Summer 2025",
        exp2_company: "Autoroutes du Maroc – Rabat, Morocco",
        exp2_desc: "Predictive traffic analysis using large-scale historical traffic data (2022–2024) to analyze congestion patterns. Modeled star schemas, written DAX measures, and designed interactive Power BI dashboards with advanced data visualizations to support strategic decision-making, while ensuring strict data confidentiality throughout.",
        
        section_projects: "Projects",
        proj1_title: "Emotion Detection System",
        proj1_subtitle: "ENSAM Meknes – 2026",
        proj1_feat1: "Real-time facial emotion recognition system (joy, anger, surprise, etc.)",
        proj1_feat2: "Built with Convolutional Neural Networks (CNN) using PyTorch/TensorFlow and OpenCV.",
        proj1_feat3: "Trained and evaluated with (FER2013) dataset.",
        
        proj2_title: "eGrading – Academic Assessment Platform",
        proj2_subtitle: "ENSAM Meknes – 2025",
        proj2_feat1: "Web platform built with Spring Boot, React, and MySQL to digitize exam grading at ENSAM.",
        proj2_feat2: "Deployed to production and successfully utilized for real academic examinations.",
        
        section_techstack: "Tech Stack",
        
        section_education: "Education",
        edu1_degree: "Master’s Student in Artificial Intelligence",
        edu1_school: "École Centrale de Lyon (ECL) - Lyon, France",
        edu2_degree: "General Engineering Student – Option in Computer Science",
        edu2_school: "École Centrale de Lyon (ECL) - Lyon, France",
        edu3_degree: "Software & Intelligent Systems Engineering Student",
        edu3_school: "École Nationale Supérieure d’Arts et Métiers (ENSAM) - Meknes, Morocco",
        edu4_degree: "High School Diploma (Baccalaureate) in Mathematical Sciences A",
        edu4_school: "High School of Excellence Mohammed VI - Benguerir, Morocco",
        
        section_certs: "Certifications & Activities",
        cert1_name: "Linux Essentials",
        cert1_org: "Linux Professional Institute (May 2026)",
        act1: "Active Member, Gadz'it Computer Science Club (ENSAM).",
        act2: "Active Member, Social Club (ENSAM).",
        act3: "Participant, Ramadan AI 2026 (Ministry of Digital Transition).",

        section_softskills: "Soft Skills",
        softskills_text: "Collaborative - Autonomous - Analytical and Critical Thinking - Problem-solving",
        
        section_languages: "Languages",
        lang_en: "English",
        lang_fr: "French",
        lang_ar: "Arabic",
        lang_written_spoken: "Written & Spoken",
        lang_native: "Native",
        
        footer_text: "© 2026 Salma IHSSAN. Designed with precision."
    },
    fr: {
        nav_about: "À propos",
        nav_experience: "Expérience",
        nav_projects: "Projets",
        nav_techstack: "Technologies",
        nav_education: "Éducation",
        nav_certs: "Certifications",
        btn_get_in_touch: "CONTACTEZ-MOI",
        
        hero_greeting: "Bonsoir —",
        hero_role: "Data Scientist | Ingénieure IA",
        hero_desc: "Je suis élève ingénieure à Centrale Lyon et j’effectue en parallèle un Master 2 spécialisé en Intelligence Artificielle. Je suis actuellement à la recherche d’un stage de fin d’études à partir de Mars 2027. Mobilité : Europe entière.",
        btn_resume: "CONTACT",
        
        section_experience: "Expérience",
        exp1_role: "Stagiaire Data Scientist / Ingénieure IA",
        exp1_date: "Été 2026",
        exp1_company: "Attijariwafa bank – Casablanca, Maroc",
        exp1_desc: "Travail sur un système bancaire de traitement des réclamations basé sur l'IA, en utilisant Llama 3, LangGraph, RAG et MCP pour extraire des informations, évaluer l'insatisfaction et la sensibilité, déterminer la priorité des réclamations et déclencher des alertes pour les cas urgents. Implémentation de la détection et du masquage des PII pour assurer la sécurité des données.",
        
        exp2_role: "Stagiaire Data Analyst",
        exp2_date: "Été 2025",
        exp2_company: "Autoroutes du Maroc – Rabat, Maroc",
        exp2_desc: "Analyse prédictive du trafic à partir de données historiques (2022-2024) pour analyser les modèles de congestion. Modélisation de schémas en étoile, création de mesures DAX et conception de tableaux de bord Power BI interactifs avec visualisations avancées pour soutenir les décisions stratégiques, tout en garantissant la confidentialité des données.",
        
        section_projects: "Projets",
        proj1_title: "Système de Détection d'Émotions",
        proj1_subtitle: "ENSAM Meknès – 2026",
        proj1_feat1: "Système de reconnaissance des émotions faciales en temps réel (joie, colère, surprise, etc.)",
        proj1_feat2: "Construit avec des Réseaux de Neurones Convolutifs (CNN) utilisant PyTorch/TensorFlow et OpenCV.",
        proj1_feat3: "Entraîné et évalué sur le dataset (FER2013).",
        
        proj2_title: "eGrading – Plateforme d'Évaluation Académique",
        proj2_subtitle: "ENSAM Meknès – 2025",
        proj2_feat1: "Plateforme web construite avec Spring Boot, React et MySQL pour numériser la correction des examens.",
        proj2_feat2: "Déployée en production et utilisée avec succès pour des examens académiques réels.",
        
        section_techstack: "Technologies",
        
        section_education: "Éducation",
        edu1_degree: "Étudiante en Master - Intelligence Artificielle",
        edu1_school: "École Centrale de Lyon (ECL) - Lyon, France",
        edu2_degree: "Étudiante Ingénieure Généraliste – Option Informatique",
        edu2_school: "École Centrale de Lyon (ECL) - Lyon, France",
        edu3_degree: "Étudiante Ingénieure en Logiciel et Systèmes Intelligents",
        edu3_school: "École Nationale Supérieure d’Arts et Métiers (ENSAM) - Meknès, Maroc",
        edu4_degree: "Baccalauréat en Sciences Mathématiques A",
        edu4_school: "Lycée d'Excellence Mohammed VI - Benguérir, Maroc",
        
        section_certs: "Certifications & Activités",
        cert1_name: "Linux Essentials",
        cert1_org: "Linux Professional Institute (Mai 2026)",
        act1: "Membre Actif, Club d'Informatique Gadz'it (ENSAM).",
        act2: "Membre Actif, Club Social (ENSAM).",
        act3: "Participante, Ramadan AI 2026 (Ministère de la Transition Numérique).",

        section_softskills: "Soft Skills",
        softskills_text: "Collaboratif - Autonome - Esprit Analytique et Critique - Résolution de problèmes",
        
        section_languages: "Langues",
        lang_en: "Anglais",
        lang_fr: "Français",
        lang_ar: "Arabe",
        lang_written_spoken: "Écrit et Parlé",
        lang_native: "Langue maternelle",
        
        footer_text: "© 2026 Salma IHSSAN. Conçu avec précision."
    }
};
