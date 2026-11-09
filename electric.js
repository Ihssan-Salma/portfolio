/* Presentation enhancements; existing controls remain the source of behavior. */
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const t = (fr, en) => document.documentElement.lang === 'fr' ? fr : en;
  // Put selected work before the detailed toolkit for a recruiter-first reading order.
  $('#technologies').before($('#projets'));
  const cards = $$('.project-feature, .project-card');
  const cases = [
    [['Capacité perdue après une annulation.', 'Unused capacity after a cancellation.'], ['Workflow durable à quatre agents, FastAPI, MCP authentifié, PostgreSQL et offres Gmail contrôlées.', 'Durable four-agent workflow, FastAPI, authenticated MCP, PostgreSQL and controlled Gmail offers.'], ['Preuve d’annulation fournie → vérification → matching → offre → READY_TO_CONFIRM.', 'Supplied cancellation evidence → verification → matching → offer → READY_TO_CONFIRM.'], ['En développement. Détection automatique et écritures finales Calendar / Sheets non implémentées. Envoi réel désactivé par défaut et limité à des destinataires de test.', 'In development. Automatic detection and final Calendar / Sheets booking writes are not implemented. Real sending is off by default and limited to test recipients.']],
    [['Classifier sept expressions faciales à partir d’images.', 'Classify seven facial expressions from images.'], ['CNN sur FER2013, augmentation, équilibrage des classes, évaluation F1 et matrice de confusion ; démonstration OpenCV.', 'CNN on FER2013, augmentation, class balancing, F1 and confusion-matrix evaluation; OpenCV demonstration.'], ['FER2013 → préparation → CNN → évaluation → vidéo OpenCV.', 'FER2013 → preprocessing → CNN → evaluation → OpenCV video.'], ['Projet académique avec démonstration ; aucune métrique de performance non documentée.', 'Academic project with a demonstration; no undocumented performance claims.']],
    [['Faciliter le triage des alertes de sécurité.', 'Support security-alert triage.'], ['Périmètre annoncé : collecte de preuves et rapports relus par un analyste. Détails d’implémentation non publiés.', 'Stated scope: evidence collection and analyst-reviewed reports. Implementation details are not published.'], ['Alerte → preuves → revue humaine (illustration).', 'Alert → evidence → human review (illustration).'], ['En cours ; dépôt public non fourni.', 'In progress; no public repository provided.']],
    [['Organiser équipes, backlogs, sprints et suivi du temps.', 'Organize teams, backlogs, sprints and time tracking.'], ['Backend Java 17 / Spring Boot-JPA, bases PostgreSQL séparées par domaine et services conteneurisés.', 'Java 17 / Spring Boot-JPA backend, domain-separated PostgreSQL databases and containerized services.'], ['Équipes → backlog → sprint → tâches / temps.', 'Teams → backlog → sprint → tasks / time.'], ['Projet académique ; backend microservices documenté dans le CV.', 'Academic project; microservices backend documented in the CV.']],
    [['Centraliser les travaux, corrections et retours pédagogiques.', 'Centralize assignments, grading and feedback.'], ['Projet collectif : API REST et interface React/TypeScript avec Spring Boot, MySQL et MongoDB. Attribution individuelle détaillée non documentée.', 'Team project: REST API and React/TypeScript interface with Spring Boot, MySQL and MongoDB. Detailed individual attribution is not documented.'], ['Publication → dépôt → correction → retour, selon le rôle.', 'Publication → submission → grading → feedback, by role.'], ['Projet académique collectif, 2025.', 'Academic team project, 2025.']]
  ];
  cards.forEach((card, i) => {
    // Hover/focus plays one bounded schematic sequence, never an endless loop.
    const animatePreview = () => {
      if (motion.matches) return;
      card.querySelectorAll('.project-preview li').forEach((li, j) => li.animate([
        { borderColor: '#32518a', transform: 'translateX(0)' },
        { borderColor: '#00e5ff', transform: 'translateX(4px)' },
        { borderColor: '#32518a', transform: 'translateX(0)' }
      ], { duration: 800, delay: j * 150, iterations: 1 }));
    };
    card.addEventListener('pointerenter', animatePreview);
    card.querySelector('.project-explore').addEventListener('focus', animatePreview);
    card.querySelector('.project-explore').addEventListener('click', () => {
      const content = $('.technical-content');
      const section = document.createElement('section'); section.className = 'case-facts';
      const labels = [['Problème', 'Problem'], ['Contribution documentée', 'Documented contribution'], ['Architecture', 'Architecture'], ['Statut', 'Status']];
      cases[i].forEach((pair, j) => { const h = document.createElement('h4'); h.textContent = t(...labels[j]); const p = document.createElement('p'); p.textContent = t(...pair); section.append(h, p); });
      content.querySelectorAll('.case-facts, details, .project-lede').forEach(node => node.remove());
      content.prepend(section);
    });
  });
  const flowLabels = [
    [['Annulation','Cancellation'],['Disponibilité','Availability'],['Liste d’attente','Waitlist'],['Offre','Offer'],['Validation humaine','Human confirmation']],
    [['FER2013','FER2013'],['CNN','CNN'],['7 expressions','7 expressions'],['Évaluation F1','F1 evaluation']],
    [['Alerte','Alert'],['Preuves','Evidence'],['Revue analyste','Analyst review']],
    [['Équipes','Teams'],['Backlog','Backlog'],['Sprint','Sprint'],['Tâches','Tasks']],
    [['Travail','Assignment'],['Dépôt','Submission'],['Correction','Grading'],['Retour','Feedback']]
  ];
  function translate() {
    if (!$('[data-i18n="techIntro"]')) {
      const hiddenTechIntro = document.createElement('span');
      hiddenTechIntro.dataset.i18n = 'techIntro';
      hiddenTechIntro.hidden = true;
      document.body.append(hiddenTechIntro);
    }
    const numbered = ['#projets','#technologies','#experience','#certifications','#apropos','#engagements','#contact'];
    numbered.forEach((selector,i)=>{const kicker=$(selector+' .kicker');if(kicker?.firstChild?.nodeType===3) kicker.firstChild.textContent=String(i+1).padStart(2,'0')+' — ';});
    $('.hero-discipline').innerHTML = '<span class="hero-name">Salma Ihssan</span><span class="hero-field">Ingénierie Logiciel and AI</span>';
    const careerTitle = $('.career-title');
    if (careerTitle) careerTitle.innerHTML = document.documentElement.lang === 'fr'
      ? '<span>École Centrale de Lyon</span><span>Élève-ingénieure en informatique · Intelligence artificielle &amp; génie logiciel</span><span>Promotion 2027</span>'
      : '<span>École Centrale de Lyon</span><span>Computer engineering student · Artificial intelligence &amp; software engineering</span><span>Class of 2027</span>';
    if ($('.studio-signature')) $('.studio-signature').textContent = t('L’esprit derrière les systèmes.', 'The mind behind the systems.');
    $$('.signal-strip span').forEach((el, i) => { el.textContent = [t('Ingénierie IA', 'AI engineering'), t('Workflows agentiques', 'Agentic workflows'), t('Génie logiciel', 'Software engineering'), t('Données & évaluation', 'Data & evaluation')][i]; });
    $$('.project-card .project-meta span:first-child').forEach((el, i) => { if (i === 0) el.textContent = t('Apprentissage profond · Vision par ordinateur', 'Deep learning · Computer vision'); if (i === 3) el.textContent = t('Projet d’équipe académique', 'Academic team project'); });
    $$('.project-card h3').forEach((el, i) => { if (i === 0) el.innerHTML = t('Reconnaissance<br><em>d’expressions</em>', 'Facial expression<br><em>recognition</em>'); });
    $$('.project-card .tag-line').forEach((el, i) => { if (i === 0) el.textContent = t('F1 · matrices de confusion', 'F1 · confusion matrices'); if (i === 1) el.textContent = t('Humain dans la boucle', 'Human-in-the-loop'); if (i === 3) el.textContent = t('Espaces administrateur · enseignant · étudiant', 'Administrator · teacher · student areas'); });
    $$('.timeline .role').forEach((el, i) => { el.textContent = i === 0 ? t('Stage IA & Data', 'AI & Data internship') : t('Stage analyste de données', 'Data Analyst internship'); });
    const techGroupTitles = [t('IA, LLMs & systèmes agentiques', 'AI, LLMs & agentic systems'), t('Apprentissage automatique & deep learning', 'Machine learning & deep learning'), t('Backend & génie logiciel', 'Backend & software engineering'), t('DevOps, cloud & supervision', 'DevOps, cloud & monitoring'), t('Analyse de données', 'Data analytics')];
    $$('.tech-group:not([data-category="frontend"]) .tech-group-heading h3').forEach((el, i) => { if (techGroupTitles[i]) el.textContent = techGroupTitles[i]; });
    $$('.tech-filter').forEach(el => { const key = el.dataset.techFilter; el.textContent = ({all:t('Tout','All'), ai:t('IA agentique','Agentic AI'), ml:'ML / DL', backend:'Backend', frontend:'Frontend', devops:'DevOps', data:t('Données','Data')}[key] || el.textContent); });
    $('[data-i18n="techTitle"]').textContent = t('Les outils. Et ce que j’en fais.', 'The tools. And what I build with them.');
    $('[data-i18n="techIntro"]').textContent = t('Filtrez par domaine. Sélectionnez une technologie pour retrouver les projets qui l’utilisent.', 'Filter by discipline. Select a technology to find the projects that use it.');
    cards.forEach((card, i) => {
      card.querySelector('.project-explore').textContent = t('Explorer le projet ↗', 'Explore project ↗');
      const previewCaption = card.querySelector('.project-preview > p');
      if (previewCaption) previewCaption.textContent = i === 0 || i === 2 ? t('SCHÉMA ILLUSTRATIF · SIMULATION', 'ILLUSTRATIVE DIAGRAM · SIMULATION') : t('ARCHITECTURE · VUE SCHÉMATIQUE', 'ARCHITECTURE · SCHEMATIC VIEW');
      [...card.querySelectorAll('.project-preview li')].forEach((li,j) => li.textContent = t(...flowLabels[i][j]));
    });
    if ($('.preview-next')) $('.preview-next').textContent = t('Étape suivante →', 'Next step →');
    $('[data-tech-filter="all"]').textContent = t('Tout', 'All');
    $('.tech-controls').setAttribute('aria-label',t('Filtrer les technologies','Filter technologies'));
    $('.skip-link').textContent = t('Aller au contenu','Skip to content');
    $('.dialog-close').setAttribute('aria-label',t('Fermer','Close'));
    $('.technical-dialog > .kicker').textContent = t('ÉTUDE TECHNIQUE','TECHNICAL CASE STUDY');
    $('.tech-group[data-category="frontend"] > h3').textContent = t('Développement frontend','Frontend development');
    $$('.certification-card .text-link').forEach(link=>link.textContent=t('Voir le certificat ↗','View credential ↗'));
    $$('.certification-type').forEach((el,i)=>el.textContent=i===0?'Certification':t('Formation suivie','Course completion'));
    $$('.timeline-date').forEach((el,i)=>el.textContent=t('Été ','Summer ')+(i===0?'2026':'2025')+t(' · 3 mois',' · 3 months'));
    $$('.role').forEach((el,i)=>el.textContent=i===0?t('Stage IA & Data','AI & Data internship'):t('Stage Data Analyst','Data Analyst internship'));
    $('.tech-filter-result').textContent = $('.tech-filter.is-active').textContent;
    // Clear stale localized feedback; selected technology can be activated again.
    $('.technology-usage').replaceChildren();
  }
  $('[data-language-toggle]').addEventListener('click',translate);
  let previewStep = -1;
  const notes = [
    ['Annulation fictive : mardi, 14 h. Aucune détection automatique.', 'Fictional cancellation: Tuesday, 2 pm. No automatic detection.'],
    ['Créneau fictif disponible. Aucun calendrier consulté.', 'Fictional available slot. No calendar accessed.'],
    ['Client fictif A compatible avec le créneau.', 'Fictional client A matches the slot.'],
    ['Brouillon d’offre fictif. Aucun e-mail envoyé.', 'Fictional offer draft. No email sent.'],
    ['Validation humaine requise. Aucune réservation écrite.', 'Human review required. No booking written.']
  ];
  function previewText(){if(previewStep>=0 && $('.preview-note')) $('.preview-note').textContent = `${previewStep+1} / 5 — ${t(...notes[previewStep])}`;}
  $('.preview-next')?.addEventListener('click',()=>{previewStep=(previewStep+1)%5;previewText();});
  $('[data-language-toggle]').addEventListener('click',previewText);
  translate();
  // Native pointer remains visible; lighting is decorative and never blocks input.
  if(matchMedia('(pointer:fine)').matches){
    const glow=document.createElement('div');glow.className='pointer-glow';glow.setAttribute('aria-hidden','true');document.body.append(glow);
    let frame=0, x=0, y=0;
    addEventListener('pointermove',e=>{if(motion.matches)return;x=e.clientX;y=e.clientY;glow.classList.toggle('over-control',!!e.target.closest('a,button,[role="button"]'));if(!frame)frame=requestAnimationFrame(()=>{glow.style.left=x-110+'px';glow.style.top=y-110+'px';frame=0;});},{passive:true});
    document.documentElement.addEventListener('pointerleave',()=>{glow.style.left='-500px';});
    $$('.hero .button-primary').forEach(button=>{button.addEventListener('pointermove',e=>{if(motion.matches)return;const r=button.getBoundingClientRect();button.style.translate=`${(e.clientX-r.left-r.width/2)*.07}px ${(e.clientY-r.top-r.height/2)*.12}px`;});button.addEventListener('pointerleave',()=>button.style.translate='');});
  }
})();
