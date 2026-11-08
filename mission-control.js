(() => {
  const root = document.querySelector('[data-mission-control]');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nodes = [...root.querySelectorAll('[data-mission-node]')];
  const packet = root.querySelector('[data-mission-packet]');
  const title = root.querySelector('[data-mission-title]');
  const detail = root.querySelector('[data-mission-detail]');
  const index = root.querySelector('[data-mission-index]');
  const status = root.querySelector('[data-mission-status]');
  const clock = root.querySelector('[data-mission-clock]');
  const play = root.querySelector('[data-mission-play]');
  const speed = root.querySelector('[data-mission-speed]');
  const steps = [
    ['Annulation détectée', 'Entrée simulée : mardi, 14 h. Aucun calendrier ni e-mail n’est contacté.'],
    ['Disponibilité vérifiée', 'Une vérification actuelle est représentée ici ; aucun calendrier externe n’est interrogé.'],
    ['Liste d’attente rapprochée', 'Un client fictif compatible est sélectionné à partir du contexte de la liste d’attente.'],
    ['Offre préparée', 'Une offre contrôlée est préparée. Aucun e-mail n’est envoyé par cette démonstration.'],
    ['Revue humaine requise', 'Le workflow s’arrête à READY_TO_CONFIRM pour qu’une personne accepte ou refuse.'],
    ['Écriture de réservation planifiée', 'Les écritures Calendar / Sheets ne sont volontairement pas implémentées.']
  ];
  let current = 0, playing = false, startedAt = 0, elapsed = 0, raf = 0;
  const duration = 10500;
  const format = ms => `00:${(ms / 1000).toFixed(1).padStart(4, '0')}`;
  function render() {
    const step = Math.min(steps.length - 1, Math.floor((elapsed / duration) * steps.length));
    current = step;
    nodes.forEach((node, i) => { node.classList.toggle('is-active', i === step); node.classList.toggle('is-complete', i < step); node.setAttribute('aria-pressed', String(i === step)); });
    title.textContent = steps[step][0]; detail.textContent = steps[step][1]; index.textContent = `${String(step + 1).padStart(2, '0')} / 06`; clock.textContent = format(elapsed);
    root.style.setProperty('--mission-progress', `${(elapsed / duration) * 100}%`);
    const progress = step / (steps.length - 1) * 100;
    packet.style.setProperty('--packet-x', String(progress * .86));
    packet.style.setProperty('--packet-y', String(progress * .86));
  }
  function stop(completed = false) { playing = false; cancelAnimationFrame(raf); root.classList.remove('is-playing'); play.textContent = completed ? '▶ Relancer la trace' : '▶ Reprendre la trace'; status.textContent = completed ? 'TERMINÉE / arrêt à la limite humaine' : 'EN PAUSE / simulation illustrative'; }
  function tick(now) { if (!playing) return; elapsed = Math.min(duration, now - startedAt); render(); if (elapsed >= duration) { stop(true); return; } raf = requestAnimationFrame(tick); }
  function start() { if (elapsed >= duration) elapsed = 0; playing = true; startedAt = performance.now() - elapsed; root.classList.add('is-playing'); play.textContent = 'Ⅱ Mettre en pause'; status.textContent = 'EN COURS / simulation illustrative'; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
  play.addEventListener('click', () => playing ? stop() : start());
  root.querySelector('[data-mission-replay]').addEventListener('click', () => { stop(); elapsed = 0; render(); start(); });
  speed.addEventListener('change', () => { if (playing) { elapsed = (performance.now() - startedAt) * Number(speed.value); startedAt = performance.now() - elapsed; } });
  nodes.forEach((node, i) => node.addEventListener('click', () => { stop(); elapsed = Math.min(duration - 1, (i / steps.length) * duration + 20); render(); status.textContent = 'INSPECTION / étape manuelle'; }));
  reduced.addEventListener('change', () => { if (reduced.matches) { stop(); render(); } });
  render();
})();
