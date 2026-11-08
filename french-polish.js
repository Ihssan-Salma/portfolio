(() => {
  const t = (fr, en) => document.documentElement.lang === 'fr' ? fr : en;
  const all = selector => [...document.querySelectorAll(selector)];
  const apply = () => {
    const signature = document.querySelector('.studio-signature'); if (signature) signature.textContent = t('L’esprit derrière les systèmes.', 'The mind behind the systems.');
    const signal = [t('Ingénierie IA', 'AI engineering'), t('Workflows agentiques', 'Agentic workflows'), t('Génie logiciel', 'Software engineering'), t('Données & évaluation', 'Data & evaluation')];
    all('.signal-strip span').forEach((node, i) => { node.textContent = signal[i]; });
    const tech = [t('IA, LLMs & systèmes agentiques', 'AI, LLMs & agentic systems'), t('Apprentissage automatique & deep learning', 'Machine learning & deep learning'), t('Backend & génie logiciel', 'Backend & software engineering'), t('DevOps, cloud & supervision', 'DevOps, cloud & monitoring'), t('Analyse de données', 'Data analytics')];
    all('.tech-group-heading h3').forEach((node, i) => { if (tech[i]) node.textContent = tech[i]; });
    all('.tech-filter').forEach(node => { node.textContent = ({all:t('Tout','All'), ai:t('IA agentique','Agentic AI'), ml:'ML / DL', backend:'Backend', frontend:'Frontend', devops:'DevOps', data:t('Données','Data')}[node.dataset.techFilter] || node.textContent); });
    const cards = all('.project-card');
    if (cards[3]) cards[3].querySelector('h3').innerHTML = t('Plateforme<br><em>eGrading</em>', 'eGrading<br><em>platform</em>');
    if (cards[0]) { cards[0].querySelector('.project-meta span').textContent = t('Deep learning · Vision par ordinateur', 'Deep learning · Computer vision'); cards[0].querySelector('h3').innerHTML = t('Reconnaissance<br><em>d’expressions</em>', 'Facial expression<br><em>recognition</em>'); cards[0].querySelector('.tag-line').textContent = t('F1 · matrices de confusion', 'F1 · confusion matrices'); }
    if (cards[1]) cards[1].querySelector('.tag-line').textContent = t('Humain dans la boucle', 'Human-in-the-loop');
    if (cards[3]) { cards[3].querySelector('.project-meta span').textContent = t('Projet d’équipe académique', 'Academic team project'); cards[3].querySelector('.tag-line').textContent = t('Espaces administrateur · enseignant · étudiant', 'Administrator · teacher · student areas'); }
    all('.timeline .role').forEach((node, i) => { node.textContent = i === 0 ? t('Stage IA & Data', 'AI & Data internship') : t('Stage analyste de données', 'Data Analyst internship'); });
    const contact = document.querySelector('.contact-section p[data-i18n="contactText"]');
    if (contact) contact.textContent = t('Je cherche un stage de fin d’études de six mois en ingénierie IA, IA agentique ou génie logiciel à partir d’avril 2027.', 'I am seeking a six-month final-year internship in AI engineering, agentic AI or software engineering starting April 2027.');
    if (document.documentElement.lang === 'fr') {
      all('.tech-filter').forEach(node => { node.textContent = ({backend:'Serveur', frontend:'Front-end'}[node.dataset.techFilter] || node.textContent); });
      if (cards[2]) {
        const agileLabels = ['Accès utilisateur', 'Cœur Scrum', 'Temps / rapports'];
        cards[2].querySelectorAll('.project-preview button strong').forEach((node, i) => { if (agileLabels[i]) node.textContent = agileLabels[i]; });
      }
    }
  };
  apply();
  document.querySelector('[data-language-toggle]')?.addEventListener('click', () => setTimeout(apply, 0));
})();
