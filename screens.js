(() => {
  const rail = document.querySelector('main#contenu');
  const panels = [...rail.children].filter(el => el.matches('section'));
  let current = 0;
  const trafficCard = [...document.querySelectorAll('#experience .timeline article')].find(card => card.querySelector('h3')?.textContent.includes('Autoroutes'));
  const trafficWrapper = document.createElement('div');
  trafficWrapper.className = 'portfolio-traffic-graph has-traffic-player';
  trafficWrapper.hidden = true;
  const trafficFrame = document.createElement('iframe');
  trafficFrame.className = 'traffic-card-frame';
  trafficFrame.title = 'Autoroutes du Maroc — analyse interactive de comptages entièrement fictifs';
  trafficWrapper.append(trafficFrame);
  if (trafficCard) document.querySelector('#experience').append(trafficWrapper);
  const bankCard = [...document.querySelectorAll('#experience .timeline article')].find(card => card.querySelector('h3')?.textContent.includes('Attijariwafa'));
  const bankWrapper = document.querySelector('#experience .portfolio-bank-graph');
  const bankFrame = document.createElement('iframe');
  bankFrame.className = 'banking-card-frame';
  bankFrame.title = 'Attijariwafa bank — traitement illustratif de réclamations fictives';
  if (bankWrapper) {
    const caption = bankWrapper.querySelector('.bank-graph-label');
    if (caption) caption.hidden = true;
    bankWrapper.replaceChildren(...(caption ? [caption] : []),bankFrame);
    bankWrapper.classList.add('has-bank-player');
  }
  // The IoT story is a portfolio demonstration, without an invented repository link.
  const iotCard = document.createElement('article');
  iotCard.className = 'project-card project-iot';
  for (const [tag, className, text] of [
    ['div','project-index','06 / 06'],
    ['div','project-meta','Simulation réseau illustrative'],
    ['h3','','Smart Home IoT'],
    ['p','','Parcours de maison connectée dans Cisco Packet Tracer : gestion HTTPS, commande d’éclairage confirmée et contrôle des accès.'],
    ['div','stack-list','Cisco Packet Tracer · HTTPS · réseau local'],
    ['div','tag-line','Objets et valeurs synthétiques · aucun foyer réel'],
  ]) {
    const element = document.createElement(tag);
    element.className = className;
    if (className === 'stack-list') {
      text.split(' · ').forEach(label => {
        const chip = document.createElement('span');
        chip.className = 'stack-chip';
        chip.textContent = label;
        element.append(chip);
      });
    } else element.textContent = text;
    iotCard.append(element);
  }
  document.querySelector('#projets .project-list').append(iotCard);
  document.querySelectorAll('#projets article .project-index').forEach((element,i) => { element.textContent = String(i+1).padStart(2,'0') + ' / 06'; });
  const iotFrame = document.createElement('iframe');
  iotFrame.className = 'iot-card-frame';
  iotFrame.title = 'Smart Home IoT — simulation Cisco Packet Tracer et gestion HTTPS';
  iotCard.querySelector('h3').after(iotFrame);
  const socCard = [...document.querySelectorAll('#projets article')].find(card => card.querySelector('h3')?.textContent.includes('SOC Sentinel'));
  const socPreview = socCard?.querySelector('.project-preview');
  const reslotFrame = document.querySelector('.reactflow-card-frame');
  const reslotCard = reslotFrame?.closest('article');
  reslotCard?.querySelector('h3')?.after(reslotFrame);
  const egradingCard = [...document.querySelectorAll('#projets article')].find(card => card.querySelector('h3')?.textContent.toLowerCase().includes('egrading'));
  let egradingFrame;
  const agileCard = [...document.querySelectorAll('#projets article')].find(card => card.querySelector('h3')?.textContent.toLowerCase().includes('agile'));
  let agileFrame;
  const facialCard = [...document.querySelectorAll('#projets article')].find(card => card.querySelector('h3')?.textContent.toLowerCase().includes('expressions'));
  let facialFrame;
  let socFrame;
  let workflowFitFrame;
  function fitWorkflowFrames() {
    cancelAnimationFrame(workflowFitFrame);
    workflowFitFrame = requestAnimationFrame(() => {
      const section = panels[current];
      if (!['projets','experience'].includes(section?.id)) return;
      const bottom = rail.getBoundingClientRect().bottom - 24;
      section.querySelectorAll('.facial-card-frame,.agile-card-frame,.egrading-card-frame,.iot-card-frame,.banking-card-frame,.traffic-card-frame,.reactflow-card-frame,.soc-card-frame').forEach(frame => {
        if (frame.closest('article')?.hidden || !frame.getClientRects().length) return;
        // Measure from the unscrolled content position to keep scrolling stable.
        const top = frame.getBoundingClientRect().top + section.scrollTop;
        const height = Math.max(300, Math.floor(bottom - top));
        if (frame.style.height !== height + 'px') frame.style.height = height + 'px';
      });
    });
  }
  function syncSoc() {
    fitWorkflowFrames();
    const trafficVisible = panels[current]?.id === 'experience' && !!trafficCard && !trafficCard.hidden;
    trafficWrapper.hidden = !trafficVisible;
    if (trafficVisible && !trafficFrame.hasAttribute('src')) trafficFrame.src = 'reslot-react/dist/index.html?project=traffic&theme=dark';
    trafficFrame.contentWindow?.postMessage({type:'traffic-visibility', visible:trafficVisible}, location.origin);
    const bankVisible = panels[current]?.id === 'experience' && !!bankCard && !bankCard.hidden;
    if (bankWrapper) bankWrapper.hidden = !bankVisible;
    if (bankVisible && !bankFrame.hasAttribute('src')) bankFrame.src = 'reslot-react/dist/index.html?project=banking';
    bankFrame.contentWindow?.postMessage({type:'banking-visibility', visible:bankVisible}, location.origin);
    const iotVisible = panels[current]?.id === 'projets' && !iotCard.hidden;
    if (iotVisible && !iotFrame.hasAttribute('src')) iotFrame.src = 'reslot-react/dist/index.html?project=iot';
    iotFrame.contentWindow?.postMessage({type:'iot-visibility', visible:iotVisible}, location.origin);
    const facialVisible = panels[current]?.id === 'projets' && !!facialCard && !facialCard.hidden;
    if (facialVisible && facialFrame && !facialFrame.hasAttribute('src')) {
      facialFrame.src = 'reslot-react/dist/index.html?project=facial';
    }
    facialFrame?.contentWindow?.postMessage({type:'facial-visibility', visible:facialVisible}, location.origin);
    const agileVisible = panels[current]?.id === 'projets' && !!agileCard && !agileCard.hidden;
    if (agileVisible && agileFrame && !agileFrame.hasAttribute('src')) {
      agileFrame.src = 'reslot-react/dist/index.html?project=agile';
    }
    agileFrame?.contentWindow?.postMessage({type:'agile-visibility', visible:agileVisible}, location.origin);
    const egradingVisible = panels[current]?.id === 'projets' && !!egradingCard && !egradingCard.hidden;
    if (egradingVisible && egradingFrame && !egradingFrame.hasAttribute('src')) {
      egradingFrame.src = 'reslot-react/dist/index.html?project=egrading';
    }
    egradingFrame?.contentWindow?.postMessage({type:'egrading-visibility', visible:egradingVisible}, location.origin);
    const reslotVisible = panels[current]?.id === 'projets' && !!reslotCard && !reslotCard.hidden;
    if (reslotVisible && reslotFrame && !reslotFrame.hasAttribute('src')) {
      reslotFrame.src = reslotFrame.dataset.src;
    }
    reslotFrame?.contentWindow?.postMessage({type:'reslot-visibility', visible:reslotVisible}, location.origin);
    const visible = panels[current]?.id === 'projets' && !!socCard && !socCard.hidden;
    // React Flow must measure its nodes in a visible iframe on first load.
    if (visible && socFrame && !socFrame.hasAttribute('src')) {
      socFrame.src = 'reslot-react/dist/index.html?project=soc';
    }
    socFrame?.contentWindow?.postMessage({type:'soc-visibility', visible}, location.origin);
  }
  bankFrame.addEventListener('load', syncSoc);
  trafficFrame.addEventListener('load', syncSoc);
  window.addEventListener('message', event => {
    if(event.origin === location.origin && event.source === trafficFrame.contentWindow && event.data?.type === 'traffic-ready') syncSoc();
  });
  window.addEventListener('message', event => {
    if(event.origin === location.origin && event.source === bankFrame.contentWindow && event.data?.type === 'banking-ready') syncSoc();
  });
  iotFrame.addEventListener('load', syncSoc);
  window.addEventListener('message', event => {
    if(event.origin === location.origin && event.source === iotFrame.contentWindow && event.data?.type === 'iot-ready') syncSoc();
  });
  if (facialCard) {
    facialFrame = document.createElement('iframe');
    facialFrame.className = 'facial-card-frame';
    facialFrame.title = 'Expressions faciales — parcours synthétique, sans lecture d’émotion';
    facialCard.querySelector('.project-preview')?.replaceWith(facialFrame);
    facialFrame.addEventListener('load', syncSoc);
    window.addEventListener('message', event => {
      if(event.origin === location.origin && event.source === facialFrame.contentWindow && event.data?.type === 'facial-ready') syncSoc();
    });
  }
  if (agileCard) {
    agileFrame = document.createElement('iframe');
    agileFrame.className = 'agile-card-frame';
    agileFrame.title = 'Agile Tracker — sprint et microservices, parcours fictif';
    agileCard.querySelector('.project-preview')?.replaceWith(agileFrame);
    agileFrame.addEventListener('load', syncSoc);
    window.addEventListener('message', event => {
      if(event.origin === location.origin && event.source === agileFrame.contentWindow && event.data?.type === 'agile-ready') syncSoc();
    });
  }
  if (egradingCard) {
    egradingFrame = document.createElement('iframe');
    egradingFrame.className = 'egrading-card-frame';
    egradingFrame.title = 'eGrading — parcours pédagogique interactif et fictif';
    egradingCard.querySelector('.project-preview')?.replaceWith(egradingFrame);
    egradingFrame.addEventListener('load', syncSoc);
    window.addEventListener('message', event => {
      if(event.origin === location.origin && event.source === egradingFrame.contentWindow && event.data?.type === 'egrading-ready') syncSoc();
    });
  }
  reslotFrame?.addEventListener('load', syncSoc);
  window.addEventListener('message', event => {
    if(event.origin === location.origin && event.source === reslotFrame?.contentWindow && event.data?.type === 'reslot-ready') syncSoc();
  });
  if (socPreview) {
    socFrame = document.createElement('iframe');
    socFrame.className = 'soc-card-frame';
    socFrame.title = 'SOC Sentinel AI — enquête simulée interactive';
    socFrame.addEventListener('load', syncSoc);
    socPreview.replaceWith(socFrame);
    window.addEventListener('message', event => {
      if(event.origin === location.origin && event.source === socFrame.contentWindow && event.data?.type === 'soc-ready') syncSoc();
    });
  }
  function go(index) {
    current = Math.max(0, Math.min(index, panels.length - 1));
    panels.forEach((panel, i) => {
      panel.inert = i !== current;
      panel.style.transform = 'translateX(' + ((i - current) * 100) + '%)';
      panel.setAttribute('aria-hidden', String(i !== current));
    });
    document.querySelectorAll('.site-header nav a').forEach(link => {
      if (link.hash === '#' + panels[current].id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    history.replaceState(null, '', '#' + panels[current].id);
    count.textContent = String(current + 1).padStart(2, '0') + ' / ' + panels.length;
    prev.disabled = current === 0;
    next.disabled = current === panels.length - 1;
    syncSoc();
  }
  const pager = document.createElement('div');
  pager.className = 'screen-pager';
  const prev = document.createElement('button'), next = document.createElement('button'), count = document.createElement('span');
  prev.textContent = '←'; next.textContent = '→';
  prev.setAttribute('aria-label', 'Page précédente'); next.setAttribute('aria-label', 'Page suivante');
  pager.append(prev, count, next); document.body.append(pager);
  prev.onclick = () => go(current - 1); next.onclick = () => go(current + 1);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    const index = panels.findIndex(panel => '#' + panel.id === link?.hash);
    if (index < 0) return;
    event.preventDefault(); go(index);
  });
  document.addEventListener('keydown', event => {
    if (event.target.closest('button,input,select,textarea,dialog,[role="tablist"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  // Reuse original content and links, with explicit item selection.
  function selector(section, items, label) {
    const bar = document.createElement('div');
    bar.className = 'screen-selector'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', label);
    function select(index) {
      items.forEach((item, i) => { item.hidden = i !== index; });
      syncSoc();
      [...bar.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    }
    items.forEach((item, i) => {
      const button = document.createElement('button');
      button.textContent = item.querySelector('h3')?.textContent.trim() || String(i + 1);
      button.onclick = () => select(i); bar.append(button);
    });
    section.prepend(bar); select(0);
  }
  selector(document.querySelector('#projets'), [...document.querySelectorAll('#projets article')], 'Choisir un projet');
  selector(document.querySelector('#experience'), [...document.querySelectorAll('.timeline article')], 'Choisir un stage');
  // Native dialogs preserve long case studies without stretching the screen.
  document.querySelectorAll('#projets details,.timeline details').forEach(details => {
    const summary = details.querySelector('summary');
    const dialog = document.createElement('dialog'); dialog.className = 'screen-details';
    const close = document.createElement('button'); close.textContent = 'Fermer / Close';
    const title = document.createElement('h2'); title.textContent = summary.textContent;
    dialog.append(close, title);
    [...details.children].filter(el => el !== summary).forEach(el => dialog.append(el));
    document.body.append(dialog); close.onclick = () => dialog.close();
    summary.addEventListener('click', event => { event.preventDefault(); dialog.showModal(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  });
  const workflowResize = new ResizeObserver(fitWorkflowFrames);
  workflowResize.observe(rail);
  document.querySelectorAll('#projets article,#projets .screen-selector').forEach(element => workflowResize.observe(element));
  document.querySelectorAll('#experience article,#experience .screen-selector,#experience .portfolio-bank-graph,#experience .portfolio-traffic-graph').forEach(element => workflowResize.observe(element));
  window.addEventListener('resize', fitWorkflowFrames);
  document.fonts.ready.then(fitWorkflowFrames);
  go(Math.max(0, panels.findIndex(panel => '#' + panel.id === location.hash)));
})();
