/* An optional, media-clock-driven story. No sound without an explicit opt-in. */
(() => {
  'use strict';
  const data = window.PORTFOLIO_STORY;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pick = value => Array.isArray(value) ? value[document.documentElement.lang === 'fr' ? 0 : 1] : value;
  const tr = (fr, en) => pick([fr, en]);
  const el = (tag, className, text) => { const n = document.createElement(tag); n.className = className || ''; if (text) n.textContent = text; return n; };
  const button = (text, action, cls = '') => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', action); return b; };
  const allGraphs = [];
  function createGraph(key, onSelect = () => {}) {
    const spec = data.graphs[key], root = el('div', `story-graph graph-${key}`);
    const canvas = el('div','story-nodes');
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('aria-hidden','true'); svg.classList.add('story-wires'); canvas.append(svg);
    const detail = el('p','story-node-detail'); detail.setAttribute('aria-live','polite');
    const nodes = spec.nodes.map((item,i) => {
      const b = button('', () => { onSelect(); select(i,true); },'story-node');
      b.dataset.state = item.state || 'illustrative';
      b.append(el('span','story-node-index',String(i+1).padStart(2,'0')),el('strong','',pick(item.label)));
      canvas.append(b); return b;
    });
    root.append(canvas,detail);
    let selected = -1;
    function select(i, announce = false) {
      nodes.forEach((b,j)=>{b.classList.toggle('selected',j===i);b.setAttribute('aria-pressed',String(j===i));});
      if(announce || selected !== i){ detail.setAttribute('aria-live',announce?'polite':'off'); detail.textContent=pick(spec.nodes[i].detail); }
      selected=i;
    }
    function draw() {
      const r = canvas.getBoundingClientRect(); if(!r.width)return;
      svg.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);svg.replaceChildren();
      spec.edges.forEach(([a,b])=>{
        const ar=nodes[a].getBoundingClientRect(),br=nodes[b].getBoundingClientRect();
        const x=ar.left-r.left+ar.width/2,y=ar.top-r.top+ar.height/2;
        const xx=br.left-r.left+br.width/2,yy=br.top-r.top+br.height/2;
        const path=document.createElementNS(svg.namespaceURI,'path');
        path.setAttribute('d',`M${x} ${y} L${xx} ${yy}`);path.setAttribute('pathLength','100');
        const pulse=path.cloneNode();pulse.classList.add('story-packet');svg.append(path,pulse);
      });
    }
    const observer=new ResizeObserver(draw);observer.observe(canvas);
    const api={root,select,draw,translate(){nodes.forEach((n,i)=>n.querySelector('strong').textContent=pick(spec.nodes[i].label));select(Math.max(0,selected));},progress(fraction){const value=Math.max(0,Math.min(.999,fraction));select(Math.floor(value*nodes.length));root.style.setProperty('--packet',String(-value*400));root.classList.toggle('is-seed',key==='mind'&&value<.08&&!reduced.matches);nodes.forEach((node,i)=>{const visible=reduced.matches||i<=Math.floor(value*nodes.length);node.classList.toggle('revealed',visible);node.tabIndex=key==='mind'&&!visible?-1:0;});},destroy(){observer.disconnect();const i=allGraphs.indexOf(api);if(i>=0)allGraphs.splice(i,1);}};
    allGraphs.push(api);select(0);return api;
  }
  function logos(names) {
    const row=el('div','story-tech');
    names.forEach(name=>{const item=el('span');const img=el('img');img.src=`assets/logos/${name}.svg`;img.alt='';img.width=20;img.height=20;item.append(img,document.createTextNode(({python:'Python',fastapi:'FastAPI',tensorflow:'TensorFlow',opencv:'OpenCV',postgresql:'PostgreSQL',docker:'Docker',react:'React',java:'Java',langchain:'LangChain'})[name]||name));row.append(item);});return row;
  }
  const watch=document.querySelector('.watch-story');
  const dialog=el('dialog','story-player');dialog.setAttribute('aria-labelledby','story-heading');
  dialog.innerHTML=`<div class="story-topbar"><span class="story-brand">SI / THE MIND BEHIND THE SYSTEMS</span><div class="story-top-actions"><button type="button" data-story-language>EN</button><button type="button" data-story-skip></button></div></div>
    <div class="story-screen"><div class="story-scene" data-story-scene></div></div>
    <p class="story-captions" data-story-caption></p>
    <div class="story-console"><div class="story-status"><span data-story-audio role="status"></span><span data-story-time></span></div>
    <input type="range" min="0" max="${data.duration}" step="0.1" value="0" data-story-seek>
    <div class="story-controls"><button type="button" data-story-play></button><button type="button" data-story-replay></button><button type="button" data-story-mute></button><label class="story-volume"><span data-volume-label></span><input type="range" min="0" max="1" step="0.05" value="0.7" data-story-volume></label><button type="button" data-story-cc aria-pressed="true">CC</button></div>
    <nav class="story-chapters" data-story-chapters></nav></div>`;
  document.body.append(dialog);
  const q=s=>dialog.querySelector(s),stage=q('[data-story-scene]');
  const audio=new Audio();audio.className='story-audio';audio.hidden=true;audio.preload='metadata';audio.muted=true;audio.volume=.7;dialog.append(audio);
  let current=0,playing=false,frame=0,anchor=0,base=0,sceneIndex=-1,projectIndex=-1,sceneGraph=null,cc=true;
  let audioState='unchecked',audioRequest=0,loadTimer,openingFocus=null;
  const projectButtons=[];
  function setText(selector,text){q(selector).textContent=text;}
  function status(){setText('[data-story-audio]',audioState==='ready'?tr(audio.muted?'Voix disponible · son coupé':'Votre voix · lecture audio',audio.muted?'Voice available · muted':'Your voice · audio playback'):audioState==='loading'?tr('Recherche de la piste · version silencieuse','Checking audio · silent edition'):tr('Version silencieuse · voix non fournie','Silent edition · no narration supplied'));q('[data-story-mute]').disabled=audioState!=='ready';q('[data-story-volume]').disabled=audioState!=='ready';}
  function controls(){setText('[data-story-play]',playing?tr('Ⅱ Pause','Ⅱ Pause'):tr('▶ Lecture','▶ Play'));setText('[data-story-replay]',tr('↺ Rejouer','↺ Replay'));setText('[data-story-mute]',audio.muted?tr('Activer le son','Enable sound'):tr('Couper le son','Mute'));q('[data-story-mute]').setAttribute('aria-pressed',String(!audio.muted));setText('[data-volume-label]',tr('Volume','Volume'));setText('[data-story-skip]',tr('Passer au portfolio ↗','Skip to portfolio ↗'));setText('[data-story-language]',document.documentElement.lang==='fr'?'EN':'FR');q('[data-story-language]').setAttribute('aria-label',tr('Switch to English','Passer en français'));q('[data-story-seek]').setAttribute('aria-label',tr('Position dans le film, en secondes','Story position in seconds'));q('[data-story-volume]').setAttribute('aria-label',tr('Volume de la narration','Narration volume'));q('[data-story-cc]').setAttribute('aria-label',tr('Afficher les sous-titres','Show subtitles'));q('[data-story-chapters]').setAttribute('aria-label',tr('Chapitres du film','Story chapters'));status();}
  function fallback(){clearTimeout(loadTimer);audio.pause();audioState='missing';base=current;anchor=performance.now();status();}
  async function loadAudio(){
    const request=++audioRequest;clearTimeout(loadTimer);audio.pause();audio.removeAttribute('src');audio.load();audioState='loading';status();
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),2500);
    try{
      const response=await fetch(data.audio[document.documentElement.lang],{method:'HEAD',signal:controller.signal});
      if(request!==audioRequest||!dialog.open)return;
      if(!response.ok||response.headers.get('content-type')?.includes('text/html')){fallback();return;}
      audio.src=data.audio[document.documentElement.lang];audio.load();loadTimer=setTimeout(()=>{if(request===audioRequest&&audioState==='loading')fallback();},4000);
    }catch{if(request===audioRequest&&dialog.open)fallback();}finally{clearTimeout(timeout);}
  }
  audio.addEventListener('loadedmetadata',()=>{
    if(audioState!=='loading'||!dialog.open)return;
    // A truncated voice track must not cut off the narrative.
    if(!Number.isFinite(audio.duration)||audio.duration<data.duration-.3){fallback();return;}
    clearTimeout(loadTimer);audioState='ready';audio.currentTime=current;status();
    if(playing)audio.play().catch(()=>{pause();});
  });
  audio.addEventListener('error',()=>{if(audioState==='ready'||audioState==='loading')fallback();});
  audio.addEventListener('waiting',()=>{if(audioState==='ready')setText('[data-story-audio]',tr('Chargement audio…','Buffering audio…'));});
  audio.addEventListener('playing',status);
  audio.addEventListener('ended',()=>{if(playing)finish();});
  function pause(){if(!playing)return;current=clock();playing=false;audio.pause();cancelAnimationFrame(frame);dialog.classList.remove('is-playing');render();controls();}
  function play(){if(current>=data.duration)seek(0);playing=true;base=current;anchor=performance.now();dialog.classList.add('is-playing');if(audioState==='ready'){audio.currentTime=current;audio.play().catch(()=>pause());}controls();cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);}
  function clock(){return Math.min(data.duration,audioState==='ready'?audio.currentTime:base+(performance.now()-anchor)/1000);}
  function tick(){if(!playing||!dialog.open)return;current=clock();render();if(current>=data.duration){finish();return;}frame=requestAnimationFrame(tick);}
  function seek(value){current=Math.max(0,Math.min(data.duration,Number(value)));base=current;anchor=performance.now();if(audioState==='ready')audio.currentTime=current;render();}
  function close(target){pause();++audioRequest;clearTimeout(loadTimer);audio.pause();dialog.close();document.body.classList.remove('story-open');openingFocus?.focus({preventScroll:true});if(target){const n=document.querySelector(target);n?.scrollIntoView({behavior:'instant'});n?.setAttribute('tabindex','-1');n?.focus({preventScroll:true});}}
  function finish(){current=data.duration;playing=false;audio.pause();cancelAnimationFrame(frame);close('#projets');}
  function open(){openingFocus=document.activeElement;current=0;sceneIndex=-1;projectIndex=-1;audioState='unchecked';audio.muted=true;dialog.showModal();document.body.classList.add('story-open');render();controls();q('[data-story-play]').focus();loadAudio();play();}
  function heading(scene){const h=el('h2','story-heading',pick(scene.headline));h.id='story-heading';return h;}
  function mountScene(index){
    q('.story-screen').scrollTop=0;
    sceneGraph?.destroy();sceneGraph=null;sceneIndex=index;projectIndex=-1;stage.replaceChildren();stage.dataset.scene=data.scenes[index].id;
    const scene=data.scenes[index];const copy=el('div','story-copy');copy.append(el('p','story-kicker',`${String(index+1).padStart(2,'0')} / 05 — ${pick(scene.title)}`),heading(scene));stage.append(copy);
    if(index===0){copy.append(el('p','story-deck',tr('Et si le logiciel pouvait faire plus que répondre ?','What if software could do more than respond?')));sceneGraph=createGraph('mind',pause);stage.append(sceneGraph.root);}
    if(index===1){
      copy.append(el('p','story-deck','AI ENGINEERING / AGENTIC SYSTEMS'));
      const journey=el('div','story-education');
      for(const [src,title,detail] of [['assets/ensam-meknes-logo.png','ENSAM Meknès','2022—2026'],['assets/centrale-lyon-logo.webp','École Centrale de Lyon',tr('2026—2027 · Master 2 IA','2026—2027 · M2 Artificial Intelligence')]]){const row=el('div');const img=el('img');img.src=src;img.alt=title;const text=el('div','story-school-copy');text.append(el('strong','',title),el('span','',detail));row.append(img,text);journey.append(row);}
      copy.append(journey,el('p','story-availability',tr('Stage PFE · 6 mois · avril 2027','Final-year internship · 6 months · April 2027')));
      const portrait=el('img','story-portrait');portrait.src='assets/salma-ihssan-portrait-cutout.png';portrait.alt='Salma Ihssan';stage.append(portrait);
    }
    if(index===2){copy.append(el('p','story-deck','Attijariwafa bank · 2026'),el('p','story-disclaimer',tr('Flux simplifié · aucune donnée bancaire réelle','Simplified flow · no real banking data')),logos(['python']),el('p','story-stack-text','Llama 3 / LangGraph / RAG / MCP'));
      const adm=el('div','story-adm');adm.append(el('strong','','Autoroutes du Maroc · 2025'),el('p','',tr('Trafic 2022–2024 → modèle en étoile → DAX → Power BI','2022–2024 traffic → star schema → DAX → Power BI')));copy.append(adm);sceneGraph=createGraph('bank',pause);stage.append(sceneGraph.root);}
    if(index===3){const tabs=el('div','story-project-tabs');projectButtons.length=0;data.projects.forEach((project,i)=>{const b=button(project.title,()=>{pause();seek(project.start);},'');projectButtons.push(b);tabs.append(b);});copy.append(tabs);stage.append(el('div','story-project-stage'));}
    if(index===4){copy.append(el('p','story-final-name','SALMA IHSSAN'),el('p','story-deck','AI ENGINEERING / AGENTIC SYSTEMS'),el('p','story-disclaimer','ÉCOLE CENTRALE DE LYON — 2027'));const links=el('div','story-final-links');links.append(button(tr('Explorer mes projets ↗','Explore projects ↗'),()=>close('#projets'),'button button-primary'));const cv=el('a','button',tr('Télécharger le CV','Download CV'));cv.href='CV_Salma_Ihssan_PFE_2027.pdf';cv.download='CV_Salma_Ihssan.pdf';links.append(cv,button(tr('Me contacter','Contact me'),()=>close('#contact'),'button'));copy.append(links);sceneGraph=createGraph('mind',pause);stage.append(sceneGraph.root);}
    if(!reduced.matches)stage.animate([{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:550,easing:'ease-out'});
    [...q('[data-story-chapters]').children].forEach((b,i)=>{b.setAttribute('aria-current',i===index?'step':'false');});
  }
  function mountProject(index){
    q('.story-screen').scrollTop=0;
    projectIndex=index;sceneGraph?.destroy();const project=data.projects[index];const host=stage.querySelector('.story-project-stage');host.replaceChildren();
    projectButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    const info=el('div','story-project-info');info.append(el('p','story-kicker',pick(project.status)),el('h3','',project.title),el('p','story-deck',pick(project.problem)),el('p','story-disclaimer',pick(project.contribution)),logos(project.stack));
    const links=el('div','story-project-links');const a=el('a','', 'GitHub ↗');a.href=project.repo;a.target='_blank';a.rel='noreferrer';links.append(a,button(tr('Explorer les détails ↗','Explore details ↗'),()=>{close('#'+project.target);document.querySelector('#'+project.target+' .project-explore').click();}));info.append(links);
    const visual=el('div','story-project-visual');sceneGraph=createGraph(project.graph,pause);visual.append(sceneGraph.root);
    if(project.image){const a=el('a','story-shot-link');a.href=project.image;a.target='_blank';a.rel='noreferrer';a.addEventListener('click',pause);const img=el('img','story-project-shot');img.src=project.image;img.alt=tr('Agrandir la capture réelle du portail enseignant eGrading','Enlarge the actual eGrading teacher portal screenshot');a.append(img);visual.append(a);}
    if(project.video){const a=el('a','story-source-link',tr('Voir le média vidéo du dépôt ↗','View repository video asset ↗'));a.href=project.video;a.target='_blank';a.rel='noreferrer';a.addEventListener('click',pause);visual.append(a);}
    host.append(info,visual);
  }
  function render(){
    const index=Math.max(0,data.scenes.findIndex(s=>current>=s.start&&current<s.end));
    const actual=current>=data.duration?4:index;if(actual!==sceneIndex)mountScene(actual);
    const scene=data.scenes[actual];let fraction=(current-scene.start)/(scene.end-scene.start);
    if(actual===3){const i=data.projects.findLastIndex(p=>current>=p.start);if(i!==projectIndex)mountProject(i);const end=data.projects[i+1]?.start??scene.end;fraction=(current-data.projects[i].start)/(end-data.projects[i].start);}
    sceneGraph?.progress(fraction);stage.style.setProperty('--scene-progress',String(Math.max(0,Math.min(1,fraction))));
    const caption=data.captions.find(c=>current>=c.start&&current<c.end);
    const captionText=caption?caption[document.documentElement.lang]:'';if(q('[data-story-caption]').textContent!==captionText)q('[data-story-caption]').textContent=captionText;
    q('[data-story-caption]').hidden=!cc;q('[data-story-seek]').value=String(current);q('[data-story-seek]').setAttribute('aria-valuetext',`${Math.floor(current)} / ${data.duration} ${tr('secondes','seconds')}`);
    const stamp=time=>`${Math.floor(time/60)}:${String(Math.floor(time%60)).padStart(2,'0')}`;
    setText('[data-story-time]',`${stamp(current)} / ${stamp(data.duration)}`);
  }
  function chapters(){q('[data-story-chapters]').replaceChildren();data.scenes.forEach((scene,i)=>q('[data-story-chapters]').append(button(`${String(i+1).padStart(2,'0')} ${pick(scene.title)}`,()=>{seek(scene.start);},'')));}
  if (watch) { watch.addEventListener('click',open); watch.hidden=false; }
  q('[data-story-play]').addEventListener('click',()=>playing?pause():play());
  q('[data-story-replay]').addEventListener('click',()=>{seek(0);play();});
  q('[data-story-skip]').addEventListener('click',()=>close('#projets'));
  q('[data-story-seek]').addEventListener('input',e=>seek(e.target.value));
  q('[data-story-mute]').addEventListener('click',()=>{if(audioState==='ready'){audio.muted=!audio.muted;controls();}});
  q('[data-story-volume]').addEventListener('input',e=>{audio.volume=Number(e.target.value);});
  q('[data-story-cc]').addEventListener('click',()=>{cc=!cc;q('[data-story-cc]').setAttribute('aria-pressed',String(cc));render();});
  q('[data-story-language]').addEventListener('click',()=>document.querySelector('[data-language-toggle]').click());
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('close',()=>{pause();audio.pause();++audioRequest;clearTimeout(loadTimer);document.body.classList.remove('story-open');});
  dialog.addEventListener('keydown',event=>{if(event.code==='Space'&&event.target===dialog){event.preventDefault();playing?pause():play();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  reduced.addEventListener('change',()=>{if(reduced.matches)stage.getAnimations({subtree:true}).forEach(a=>a.cancel());});
  // Keep the same architecture diagrams available outside the timed experience.
  data.projects.forEach(project=>{
    const card=document.getElementById(project.target);const preview=card.querySelector('.project-preview');
    if (project.id === 'reslot') return;
    preview.querySelector('ol')?.remove();
    preview.classList.add('has-story-graph');const graph=createGraph(project.graph);preview.append(graph.root);
    if(project.id==='reslot'){const note=el('p','project-state-legend');preview.append(note);}
    if(project.image){const img=el('img','portfolio-project-shot');img.src=project.image;img.alt='eGrading — professor portal';img.loading='lazy';preview.append(img);}
    if(project.video){const details=el('details','source-video');const summary=el('summary');const video=el('video');video.controls=true;video.preload='none';video.playsInline=true;video.muted=true;video.src=project.video;details.append(summary,video,el('p','source-video-note'));preview.append(details);details.addEventListener('toggle',()=>{if(!details.open)video.pause();});}
  });
  const experience=document.querySelector('#experience');const bank=el('div','portfolio-bank-graph');bank.append(el('p','bank-graph-label'),createGraph('bank').root);experience.append(bank);
  const phone=el('a','contact-phone','+33 7 45 20 74 18');phone.href='tel:+33745207418';document.querySelector('#contact').append(phone);
  const transcript=null;
  function localize(){
    if (watch) watch.textContent=tr('▶ Voir mon histoire','▶ Watch my story')+` · ${data.duration} s`;
    document.querySelector('.hero-actions [href="#projets"]').textContent=tr('Explorer mon travail ↗','Explore my work ↗');
    document.querySelector('.bank-graph-label').textContent=tr('Attijariwafa bank — parcours d’une réclamation · schéma illustratif','Attijariwafa bank — a complaint’s journey · illustrative diagram');
    if (document.querySelector('.project-state-legend')) document.querySelector('.project-state-legend').textContent=tr('Bordure continue : implémenté / contrôlé. Pointillés : prévu. Sélectionnez un nœud pour ses limites.','Solid border: implemented / controlled. Dashed: planned. Select a node for its limitations.');
    if(document.querySelector('.source-video summary'))document.querySelector('.source-video summary').textContent=tr('Voir la vidéo source du dépôt','View the repository source video');if(document.querySelector('.source-video-note'))document.querySelector('.source-video-note').textContent=tr('Média d’entrée du projet, pas un enregistrement de prédictions.','Project input footage, not a recording of predictions.');
    allGraphs.forEach(g=>g.translate());chapters();if(dialog.open){pause();sceneIndex=-1;render();loadAudio();}controls();
  }
  document.querySelector('[data-language-toggle]').addEventListener('click',localize);localize();
})();
