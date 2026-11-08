/* Editorial source of truth. Seconds are absolute on an 85-second audio track.
   Optional audio must match these cues. No synthetic performance data. */
window.PORTFOLIO_STORY = {
  duration: 85,
  audio: { fr: 'public/audio/trailer-fr.mp3', en: 'public/audio/trailer-en.mp3' },
  scenes: [
    { id: 'question', start: 0, end: 12, title: ['La question', 'The question'], headline: ['Tout commence\npar une question.', 'Every system begins\nwith a question.'], graph: 'mind' },
    { id: 'portrait', start: 12, end: 28, title: ['La personne', 'The person'], headline: ['Salma\nIhssan.', 'Salma\nIhssan.'] },
    { id: 'experience', start: 28, end: 47, title: ['Le terrain', 'The real world'], headline: ['Comprendre.\nProtéger. Prioriser.', 'Understand.\nProtect. Prioritize.'], graph: 'bank' },
    { id: 'projects', start: 47, end: 75, title: ['Les systèmes', 'The systems'], headline: ['Quatre défis.\nUne même curiosité.', 'Four challenges.\nOne curiosity.'] },
    { id: 'invitation', start: 75, end: 85, title: ['La suite', 'What comes next'], headline: ['La suite\ns’écrit ensemble.', 'Let’s build\nwhat comes next.'], graph: 'mind' }
  ],
  captions: [
    {start:0,end:5,fr:'Tout système commence par une question.',en:'Every system begins with a question.'},
    {start:5,end:12,fr:'Et si le logiciel pouvait faire plus que répondre ?',en:'What if software could do more than respond?'},
    {start:12,end:18,fr:'Je suis Salma Ihssan. J’explore l’intelligence artificielle et les systèmes agentiques.',en:'I’m Salma Ihssan. I explore artificial intelligence and agentic systems.'},
    {start:18,end:23,fr:'Mon parcours relie l’ENSAM Meknès, Centrale Lyon et un Master 2 en intelligence artificielle.',en:'My journey connects ENSAM Meknès, Centrale Lyon and a Master’s in artificial intelligence.'},
    {start:23,end:28,fr:'Je cherche un stage de fin d’études de six mois, à partir d’avril 2027.',en:'I’m seeking a six-month final-year internship, starting in April 2027.'},
    {start:28,end:34,fr:'Chez Attijariwafa bank, j’ai travaillé sur le traitement des réclamations avec des LLM.',en:'At Attijariwafa bank, I worked on processing complaints with large language models.'},
    {start:34,end:40,fr:'Extraire les informations, masquer les données personnelles, analyser et prioriser : chaque étape a un rôle.',en:'Extract information, mask personal data, analyze and prioritize: every step has a purpose.'},
    {start:40,end:47,fr:'Chez Autoroutes du Maroc, j’ai analysé les données de trafic avec un modèle en étoile, DAX et Power BI.',en:'At Autoroutes du Maroc, I analyzed traffic data using a star schema, DAX and Power BI.'},
    {start:47,end:54,fr:'Avec ReSlot AI, je développe un workflow de récupération des créneaux annulés. La réservation finale reste hors périmètre.',en:'With ReSlot AI, I’m developing a cancellation-recovery workflow. Final booking writes remain out of scope.'},
    {start:54,end:61,fr:'Pour la reconnaissance faciale, j’ai travaillé sur sept expressions, un CNN et son évaluation sur FER2013.',en:'For facial expression recognition, I worked with seven classes, a CNN and evaluation on FER2013.'},
    {start:61,end:68,fr:'eGrading est un projet collectif qui relie enseignants, étudiants et administrateurs.',en:'eGrading is a team project connecting teachers, students and administrators.'},
    {start:68,end:75,fr:'Agile Tracker explore un backend microservices, avec des domaines et des bases de données séparés.',en:'Agile Tracker explores a microservices backend, with separate domains and databases.'},
    {start:75,end:80,fr:'Ce qui m’intéresse : relier les modèles, les outils et les personnes.',en:'What interests me is connecting models, tools and people.'},
    {start:80,end:85,fr:'Découvrez mon travail. Et parlons du prochain système à construire.',en:'Explore my work. And let’s talk about the next system to build.'}
  ],
  projects: [
    {id:'reslot', start:47, title:'ReSlot AI', graph:'reslot', target:'project-1', repo:'https://github.com/Ihssan-Salma/reslot-ai', status:['En développement','In development'], problem:['Un créneau annulé. Une liste d’attente. Comment les reconnecter ?','A cancelled slot. A waiting list. How do we reconnect them?'], contribution:['Workflow durable à quatre agents, MCP authentifié, offres Gmail contrôlées et état PostgreSQL. Détection automatique et écritures finales non implémentées.','Durable four-agent workflow, authenticated MCP, controlled Gmail offers and PostgreSQL state. Automatic detection and final booking writes are not implemented.'], stack:['python','fastapi','postgresql','docker']},
    {id:'emotion', start:54, title:'Facial Emotion Recognition', graph:'emotion', target:'project-2', repo:'https://github.com/Ihssan-Salma/DL_facial_emotion_recognition_project', status:['Projet académique','Academic project'], problem:['De l’image à une expression : apprendre, puis évaluer.','From an image to an expression: learn, then evaluate.'], contribution:['CNN, augmentation, équilibrage et évaluation F1 / matrice de confusion. Aucun score chiffré ajouté. La vidéo du dépôt est un média d’entrée, pas une preuve de prédictions.','CNN, augmentation, balancing and F1 / confusion-matrix evaluation. No numerical scores added. Repository video is an input asset, not evidence of predictions.'], stack:['tensorflow','opencv'], video:'assets/projects/emotion-source.mp4'},
    {id:'egrading', start:61, title:'eGrading', graph:'egrading', target:'project-5', repo:'https://github.com/eayzaid/eGrading', status:['Projet collectif · 2025','Team project · 2025'], problem:['Un espace commun pour les travaux, corrections et retours.','A shared space for assignments, grading and feedback.'], contribution:['API REST et interface web. React/TypeScript, Spring Boot, MySQL et MongoDB ; contribution individuelle détaillée non attribuée.','REST API and web interface. React/TypeScript, Spring Boot, MySQL and MongoDB; detailed individual attribution is not claimed.'], stack:['react','java'], image:'assets/projects/egrading-professor.png'},
    {id:'agile', start:68, title:'Agile Tracker', graph:'agile', target:'project-4', repo:'https://github.com/Ihssan-Salma/agile-tracker', status:['Fondations microservices','Microservices foundations'], problem:['Séparer les responsabilités, sans perdre la cohérence.','Separate responsibilities without losing coherence.'], contribution:['Services utilisateurs, Scrum et temps ; modèles JPA, PostgreSQL par domaine, configuration Docker Compose. Gateway et découverte : fondations.','User, Scrum and time services; JPA models, domain-specific PostgreSQL and Docker Compose configuration. Gateway and discovery: foundations.'], stack:['java','postgresql','docker']}
  ],
  graphs: {
    mind: { nodes:[
      {label:['Question','Question'], detail:['Définir un problème concret.','Define a concrete problem.']},
      {label:['Contexte','Context'], detail:['Comprendre les contraintes et les sources.','Understand constraints and sources.']},
      {label:['Modèle','Model'], detail:['Choisir une méthode adaptée.','Choose an appropriate method.']},
      {label:['Outils','Tools'], detail:['Relier le raisonnement aux actions autorisées.','Connect reasoning to authorized actions.']},
      {label:['Évaluation','Evaluation'], detail:['Observer les résultats et les limites.','Observe results and limitations.']},
      {label:['Humain','Human'], detail:['Garder la décision compréhensible.','Keep the decision understandable.']}
    ], edges:[[0,1],[1,2],[1,3],[2,4],[3,4],[4,5]] },
    bank: { nodes:[
      {label:['Réclamation','Complaint'],detail:['Exemple illustratif : une demande bancaire fictive. Aucune donnée client.','Illustrative example: a fictional banking request. No customer data.']},
      {label:['Extraction','Processing'],detail:['Extraire les informations utiles à l’analyse.','Extract information relevant to the analysis.']},
      {label:['Masquage PII','PII masking'],detail:['Détecter et masquer les données personnelles.','Detect and mask personal data.']},
      {label:['LLM / RAG','LLM / RAG'],detail:['Llama 3, contexte documentaire et orchestration LangGraph / MCP.','Llama 3, document context and LangGraph / MCP orchestration.']},
      {label:['Priorité','Priority'],detail:['Analyser l’insatisfaction et la sensibilité ; aider à prioriser.','Analyze dissatisfaction and sensitivity; support prioritization.']},
      {label:['Sorties / alertes','Output / alerts'],detail:['Restituer les informations et signaler les cas urgents. Schéma simplifié du travail décrit dans le CV.','Return information and flag urgent cases. Simplified diagram of the work described in the CV.']}
    ],edges:[[0,1],[1,2],[2,3],[3,4],[4,5]] },
    reslot: {nodes:[
      {label:['Annulation','Cancellation'],state:'planned',detail:['Détection automatique prévue. Aujourd’hui : preuve vérifiée fournie par un responsable.','Automatic detection is planned. Currently: verified evidence supplied by a manager.']},
      {label:['Vérification','Verification'],state:'implemented',detail:['Vérifier l’événement et la disponibilité via les outils autorisés.','Check the event and availability through authorized tools.']},
      {label:['Matching','Matching'],state:'implemented',detail:['Consulter la liste d’attente ; appliquer les contraintes et le consentement.','Read the waiting list; enforce constraints and consent.']},
      {label:['Offre Gmail','Gmail offer'],state:'controlled',detail:['Envoi réel désactivé par défaut et limité à une liste de destinataires de test.','Real sending is off by default and restricted to an allowlist of test recipients.']},
      {label:['Acceptation','Acceptance'],state:'implemented',detail:['Pages Accept/Decline ; contrôle frais de disponibilité. Arrêt à READY_TO_CONFIRM.','Accept/Decline pages; fresh availability check. Stops at READY_TO_CONFIRM.']},
      {label:['Réservation','Booking write'],state:'planned',detail:['Écritures Calendar / Sheets de réservation non implémentées.','Calendar / Sheets booking writes are not implemented.']}
    ],edges:[[0,1],[1,2],[2,3],[3,4],[4,5]]},
    emotion: {nodes:[
      {label:['FER2013','FER2013'],detail:['Images de visages en niveaux de gris, 48 × 48.','48 × 48 grayscale face images.']},
      {label:['Préparation','Preprocessing'],detail:['Normalisation, augmentation et équilibrage des classes.','Normalization, augmentation and class balancing.']},
      {label:['CNN','CNN'],detail:['Réseau convolutionnel Keras à quatre blocs.','Four-block Keras convolutional network.']},
      {label:['7 expressions','7 expressions'],detail:['Colère · dégoût · peur · joie · neutre · tristesse · surprise.','Angry · disgust · fear · happy · neutral · sad · surprise.']},
      {label:['Évaluation','Evaluation'],detail:['F1 et matrices de confusion prévus dans le code. Aucun résultat numérique reproduit sans artefact validé.','F1 and confusion matrices in the code. No numerical result reproduced without a validated artifact.']},
      {label:['OpenCV','OpenCV'],detail:['Suivi de visages et lissage des prédictions. Une expression ne mesure pas un état émotionnel intérieur.','Face tracking and prediction smoothing. An expression does not measure an internal emotional state.']}
    ],edges:[[0,1],[1,2],[2,3],[3,4],[3,5]]},
    egrading: {nodes:[
      {label:['Administrateur','Administrator'],detail:['Espace de gestion de la plateforme.','Platform management area.']},
      {label:['Enseignant','Teacher'],detail:['Publier des travaux, corriger et fournir des retours.','Publish assignments, grade and provide feedback.']},
      {label:['Étudiant','Student'],detail:['Déposer les réponses et consulter les retours.','Submit work and review feedback.']},
      {label:['React / REST','React / REST'],detail:['Interface React / TypeScript et échanges avec l’API.','React / TypeScript interface and API communication.']},
      {label:['Spring Boot','Spring Boot'],detail:['Backend Java et règles de la plateforme. Projet collectif.','Java backend and platform rules. Team project.']},
      {label:['MySQL / MongoDB','MySQL / MongoDB'],detail:['Données structurées et documents. Déploiement Docker encore en cours selon le dépôt.','Structured data and documents. Docker deployment remains in progress according to the repository.']}
    ],edges:[[0,3],[1,3],[2,3],[3,4],[4,5]]},
    agile: {nodes:[
      {label:['User access','User access'],detail:['ms-user-access : utilisateurs et données d’accès.','ms-user-access: users and access data.']},
      {label:['Scrum core','Scrum core'],detail:['ms-scrum-core : projets, équipes, backlogs, sprints et tâches.','ms-scrum-core: projects, teams, backlogs, sprints and tasks.']},
      {label:['Time / reporting','Time / reporting'],detail:['ms-time-and-reporting : temps et rapports.','ms-time-and-reporting: time entries and reports.']},
      {label:['DB utilisateurs','User DB'],detail:['Base PostgreSQL dédiée au contexte utilisateurs.','PostgreSQL database dedicated to the user context.']},
      {label:['DB Scrum','Scrum DB'],detail:['Base PostgreSQL dédiée au contexte Scrum.','PostgreSQL database dedicated to the Scrum context.']},
      {label:['DB temps','Time DB'],detail:['Base PostgreSQL dédiée au contexte temps. Relations interservices par identifiants.','PostgreSQL database dedicated to time. Cross-service references use IDs.']}
    ],edges:[[0,3],[1,4],[2,5]]}
  }
};
