/* Native controls, existing content as source of truth, no animation dependencies. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const label = node => node.innerText.replace(/\s+/g, ' ').trim();
  const text = (fr, en) => document.documentElement.lang === 'fr' ? fr : en;
  const nav = document.querySelector('.site-header nav');
  nav.id = 'main-navigation';
  const menu = document.createElement('button');
  menu.className = 'menu-toggle';
  menu.textContent = 'Menu';
  menu.setAttribute('aria-controls', nav.id);
  menu.setAttribute('aria-expanded', 'false');
  nav.before(menu);
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('menu-open'); }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('menu-open', open);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('menu-open')) { closeMenu(); menu.focus(); } });

  const projects = all('.project-card, .project-feature');
  const dialog = document.createElement('dialog');
  dialog.className = 'technical-dialog';
  dialog.setAttribute('aria-labelledby', 'technical-title');
  dialog.innerHTML = '<button type="button" class="dialog-close" autofocus aria-label="Fermer / Close">×</button><p class="kicker">PROJECT EXPLORER</p><h2 id="technical-title"></h2><div class="technical-content"></div>';
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  projects.forEach((card, index) => {
    card.id ||= 'project-' + (index + 1);
    const button = document.createElement('button');
    button.className = 'project-explore';
    button.hidden = true;
    button.textContent = 'Explorer / Explore ↗';
    button.addEventListener('click', () => {
      dialog.querySelector('h2').textContent = label(card.querySelector('h3'));
      const content = dialog.querySelector('.technical-content');
      content.replaceChildren();
      const metadata = card.querySelector('.project-meta');
      if (metadata) content.append(metadata.cloneNode(true));
      // Clone only factual source content; preserve live translations and real links.
      all('p, .project-stack, .stack, details, a[href^="https://github.com"]', card).filter(node => !node.closest('details') || node.tagName === 'DETAILS').forEach(node => {
        if (node.closest('.project-preview')) return;
        if (node.parentElement.closest('.project-stack, .stack')) return;
        const clone = node.cloneNode(true);
        all('[id]', clone).forEach(child => child.removeAttribute('id'));
        clone.removeAttribute('id');
        if (clone.tagName === 'DETAILS') clone.open = true;
        content.append(clone);
      });
      // Stack class names differ between projects.
      if (!content.querySelector('.stack-chip')) {
        const stack = document.createElement('div'); stack.className = 'modal-stack';
        all('.stack-chip', card).forEach(chip => stack.append(chip.cloneNode(true)));
        content.append(stack);
      }
      dialog.showModal(); document.body.classList.add('dialog-open');
    });
    card.append(button);
  });
  const previews = [
    ['Cancellation', 'Availability', 'Waitlist', 'Offer', 'Human confirmation'],
    ['FER2013', 'CNN', '7 expressions', 'F1 evaluation'],
    ['Alert', 'Evidence', 'Analyst review'],
    ['Teams', 'Backlog', 'Sprint', 'Tasks'],
    ['Assignment', 'Submission', 'Grading', 'Feedback']
  ];
  projects.forEach((card, i) => {
    const preview = document.createElement('div'); preview.className = 'project-preview';
    const caption = document.createElement('p');
    caption.textContent = i === 0 || i === 2 ? 'ILLUSTRATIVE FLOW · NOT A LIVE SERVICE' : 'PROJECT OVERVIEW · SCHEMATIC';
    preview.append(caption);
    const flow = document.createElement('ol');
    previews[i].forEach(name => { const li = document.createElement('li'); li.textContent = name; flow.append(li); });
    preview.append(flow);
    if (i === 0) {
      caption.hidden = true;
      const frame = document.createElement('iframe');
      frame.className = 'reactflow-card-frame';
      frame.dataset.src = 'reslot-react/dist/index.html?embed=card';
      frame.title = 'Diagramme React Flow du workflow ReSlot AI';
      frame.loading = 'lazy';
      card.append(frame);
      return;
    }
    card.querySelector('h3').after(preview);
  });

  const groups = all('.tech-group');
  const categories = ['ai', 'ml', 'backend', 'devops', 'data'];
  groups.forEach((group, i) => { group.dataset.category = categories[i]; });
  const frontend = groups[2].cloneNode(false);
  frontend.dataset.category = 'frontend';
  frontend.innerHTML = '<h3>Frontend Development</h3><div class="frontend-items"></div>';
  all('.tech-item', groups[2]).filter(item => ['JavaScript', 'React'].includes(label(item.querySelector(':scope > span:last-child')))).forEach(item => frontend.lastElementChild.append(item));
  groups[2].after(frontend); groups.push(frontend);
  const frontFilter = document.createElement('button');
  frontFilter.type = 'button'; frontFilter.className = 'tech-filter'; frontFilter.dataset.techFilter = 'frontend'; frontFilter.textContent = 'Frontend';
  document.querySelector('[data-tech-filter="backend"]').after(frontFilter);
  const filters = all('[data-tech-filter]');
  const result = document.querySelector('[data-tech-result]');
  const usage = document.createElement('div'); usage.className = 'technology-usage'; usage.setAttribute('aria-live', 'polite');
  document.querySelector('.tech-controls').after(usage);
  const normalize = value => {
    const v = value.toLowerCase().replace(/\s+/g, ' ').trim();
    return ({'model context protocol': 'mcp', 'java 17': 'java', 'docker compose': 'docker'})[v] || v;
  };
  const items = all('.tech-item');
  filters.forEach(filter => {
    filter.setAttribute('aria-pressed', String(filter.dataset.techFilter === 'all'));
    filter.addEventListener('click', () => {
      filters.forEach(other => { const active = other === filter; other.setAttribute('aria-pressed', String(active)); other.classList.toggle('is-active', active); });
      groups.forEach(group => { group.hidden = filter.dataset.techFilter !== 'all' && group.dataset.category !== filter.dataset.techFilter; });
      items.forEach(item => { item.classList.remove('is-highlighted'); item.setAttribute('aria-pressed', 'false'); });
      projects.forEach(project => project.classList.remove('project-matched'));
      usage.replaceChildren(); result.textContent = filter.textContent;
    });
  });
  items.forEach(item => {
    item.tabIndex = 0; item.setAttribute('role', 'button'); item.setAttribute('aria-pressed', 'false');
    const activate = () => {
      const name = label(item.querySelector(':scope > span:last-child'));
      items.forEach(other => { other.setAttribute('aria-pressed', String(other === item)); other.classList.toggle('is-highlighted', other === item); });
      const matches = projects.filter(card => all('.stack-chip', card).some(chip => {
        const copy = chip.cloneNode(true);
        all('span, img', copy).forEach(mark => mark.remove());
        return copy.textContent.split('/').some(part => normalize(part) === normalize(name));
      }));
      projects.forEach(card => card.classList.toggle('project-matched', matches.includes(card)));
      usage.replaceChildren(document.createTextNode(name + ' — '));
      if (!matches.length) usage.append(document.createTextNode(text('Compétence listée ; aucun projet associé dans ce portfolio.', 'Listed skill; no associated project documented in this portfolio.')));
      matches.forEach(card => { const link = document.createElement('a'); link.href = '#' + card.id; link.textContent = label(card.querySelector('h3')); usage.append(link); });
    };
    item.addEventListener('click', activate);
    item.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
  });

  const hero = document.querySelector('.hero');
  const careerMap = document.querySelector('[data-career-map]');
  if (careerMap) {
    const careerNodes = all('.career-node', careerMap);
    const detailLabel = careerMap.querySelector('.career-map-detail .career-label') || { textContent: '' };
    const detailTitle = careerMap.querySelector('.career-map-detail strong') || { textContent: '' };
    const detailText = careerMap.querySelector('.career-map-detail p') || { textContent: '' };
    const careerCopy = {
      education: {
        label: ['Point de départ', 'Starting point'],
        title: ['Une formation qui relie logiciel, systèmes intelligents et IA.', 'A formation connecting software, intelligent systems, and AI.'],
        text: ['ENSAM Meknès puis École Centrale de Lyon, avec un Master 2 en Intelligence Artificielle.', 'ENSAM Meknès, then École Centrale de Lyon, with a Master 2 in Artificial Intelligence.']
      },
      experience: {
        label: ['Expérience', 'Experience'],
        title: ['Deux stages de trois mois pour confronter l’IA et la data au réel.', 'Two three-month internships bringing AI and data into real contexts.'],
        text: ['Attijariwafa bank et Autoroutes du Maroc : data science, analyse et systèmes utiles.', 'Attijariwafa bank and Autoroutes du Maroc: data science, analytics, and useful systems.']
      },
      projects: {
        label: ['Projets', 'Projects'],
        title: ['Des systèmes agentiques à explorer, évaluer et rendre compréhensibles.', 'Agentic systems designed to be explored, evaluated, and understood.'],
        text: ['ReSlot AI, SOC Sentinel AI et d’autres projets relient orchestration, sécurité et génie logiciel.', 'ReSlot AI, SOC Sentinel AI, and other projects connect orchestration, security, and software engineering.']
      },
      certifications: {
        label: ['Certifications', 'Certifications'],
        title: ['Des repères vérifiables pour approfondir les agents, Linux et MCP.', 'Verifiable milestones across agents, Linux, and MCP.'],
        text: ['Hugging Face, DataCamp, Linux Professional Institute et Claude Academy.', 'Hugging Face, DataCamp, Linux Professional Institute, and Claude Academy.']
      },
      next: {
        label: ['Prochaine mission', 'Next opportunity'],
        title: ['Un stage de fin d’études de six mois à partir d’avril 2027.', 'A six-month final-year internship starting in April 2027.'],
        text: ['À la recherche d’une équipe en France autour de l’IA agentique et de l’automatisation intelligente.', 'Looking for a team in France working on agentic AI and intelligent automation.']
      }
    };
    const careerLabels = {
      education: ['Formation', 'Education', 'ENSAM Meknès → Centrale Lyon', 'ENSAM Meknès → École Centrale de Lyon'],
      experience: ['Expérience', 'Experience', 'Attijariwafa bank · ADM', 'Attijariwafa bank · ADM'],
      projects: ['Projets', 'Projects', 'ReSlot · SOC Sentinel · Agile', 'ReSlot · SOC Sentinel · Agile'],
      certifications: ['Certifications', 'Certifications', 'Agents · LangChain · Linux · MCP', 'Agents · LangChain · Linux · MCP'],
      next: ['Prochaine mission', 'Next opportunity', 'France · avril 2027', 'France · April 2027']
    };
    const languageIndex = () => document.documentElement.lang === 'fr' ? 0 : 1;
    const clearMuted = () => careerNodes.forEach(node => node.classList.remove('is-muted'));
    const previewCareerNode = node => {
      const copy = careerCopy[node.dataset.careerNode];
      careerNodes.forEach(other => other.classList.toggle('is-muted', other !== node));
      if (!copy) return;
      const index = languageIndex();
      detailLabel.textContent = copy.label[index];
      detailTitle.textContent = copy.title[index];
      detailText.textContent = copy.text[index];
    };
    const renderCareerLanguage = () => {
      const index = languageIndex();
      const title = careerMap.closest('.career-hero')?.querySelector('.career-title');
      if (title) title.innerHTML = index === 0
        ? '<span>École Centrale de Lyon</span><span>Cycle ingénieur · Master 2 Intelligence Artificielle</span><span>Promotion 2027</span>'
        : '<span>École Centrale de Lyon</span><span>Engineering degree · Master 2 Artificial Intelligence</span><span>Class of 2027</span>';
      const opportunity = document.querySelector('#career-opportunity');
      if (opportunity) {
        opportunity.querySelector('.career-label').textContent = index === 0 ? 'Prochaine mission' : 'Next opportunity';
        opportunity.querySelector('strong').textContent = index === 0 ? 'Stage de fin d’études · 6 mois' : 'Six-month final-year internship';
        opportunity.querySelector('span:not(.career-label)').textContent = index === 0 ? 'À partir d’avril 2027 · ouverte aux opportunités en France' : 'Starting April 2027 · open to opportunities in France';
      }
      const heading = careerMap.closest('.career-map-shell')?.querySelector('.career-map-heading');
      if (heading) {
        heading.querySelector('span:first-child').textContent = index === 0 ? 'Carte de parcours' : 'Career map';
        heading.querySelector('span:last-child').textContent = index === 0 ? 'Survolez ou sélectionnez un point' : 'Hover or select a point';
      }
      careerNodes.forEach(node => {
        const labels = careerLabels[node.dataset.careerNode];
        if (!labels) return;
        const nodeTitle = node.querySelector('strong');
        const nodeSubtitle = node.querySelector('small');
        if (nodeTitle) nodeTitle.textContent = labels[index];
        if (nodeSubtitle) nodeSubtitle.textContent = labels[index + 2];
      });
      const mapImage = careerMap.querySelector('svg');
      if (mapImage) mapImage.setAttribute('aria-label', index === 0 ? 'Carte interactive du parcours de Salma Ihssan' : 'Interactive career map for Salma Ihssan');
      const active = careerNodes.find(node => node.classList.contains('is-active'));
      if (active) previewCareerNode(active);
      else {
        detailLabel.textContent = index === 0 ? 'Point de départ' : 'Starting point';
        detailTitle.textContent = index === 0 ? 'Une trajectoire entre logiciel, données et IA agentique.' : 'A path across software, data, and agentic AI.';
        detailText.textContent = index === 0 ? 'Chaque étape ouvre la section correspondante du portfolio.' : 'Each step opens the corresponding portfolio section.';
      }
    };
    const activateCareerNode = node => {
      previewCareerNode(node);
      careerNodes.forEach(other => other.classList.toggle('is-active', other === node));
      const targetSelector = node.dataset.target;
      const target = targetSelector && document.querySelector(targetSelector);
      if (!target || target === document.querySelector('#career-opportunity')) return;
      history.replaceState(null, '', targetSelector);
      const horizontalScroller = document.querySelector('main#contenu');
      const panel = target.closest('main#contenu > section');
      if (horizontalScroller && panel) horizontalScroller.scrollTo({ left: panelLeft(panel), behavior: motion.matches ? 'auto' : 'smooth' });
      else target.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
    };
    careerNodes.forEach(node => {
      node.addEventListener('mouseenter', () => previewCareerNode(node));
      node.addEventListener('focus', () => previewCareerNode(node));
      node.addEventListener('mouseleave', clearMuted);
      node.addEventListener('blur', clearMuted);
      node.addEventListener('click', () => activateCareerNode(node));
      node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateCareerNode(node);
        }
      });
    });
    careerMap.addEventListener('mouseleave', clearMuted);
    document.querySelector('[data-language-toggle]')?.addEventListener('click', () => {
      renderCareerLanguage();
    });
    renderCareerLanguage();
  }
  const orbit = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  orbit.setAttribute('viewBox', '0 0 800 300'); orbit.setAttribute('aria-hidden', 'true'); orbit.classList.add('hero-circuit');
  orbit.innerHTML = '<path d="M0 150H180L260 70H430L510 150H800M180 150L260 230H430L510 150"/><circle cx="180" cy="150" r="6"/><circle cx="260" cy="70" r="6"/><circle cx="430" cy="70" r="6"/><circle cx="260" cy="230" r="6"/><circle cx="430" cy="230" r="6"/><circle cx="510" cy="150" r="6"/>';
  hero.prepend(orbit);
  hero.addEventListener('pointermove', event => {
    if (motion.matches || event.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    orbit.style.translate = ((event.clientX-r.left)/r.width-.5)*12 + 'px ' + ((event.clientY-r.top)/r.height-.5)*8 + 'px';
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { orbit.style.translate = '0 0'; });

  // Existing experience paragraphs become native, keyboard-accessible disclosures.
  all('.timeline article').forEach(article => {
    const paragraph = article.querySelector('[data-i18n$="Desc"]');
    if (!paragraph) return;
    const details = document.createElement('details'); details.className = 'timeline-details';
    const summary = document.createElement('summary'); summary.textContent = 'Contribution & technologies';
    paragraph.before(details); details.append(summary, paragraph);
  });
  const email = document.createElement('a'); email.href = 'mailto:salma.ihssan.pro@gmail.com'; email.textContent = 'salma.ihssan.pro@gmail.com'; email.className = 'contact-email';
  document.querySelector('#contact').append(email);
})();
