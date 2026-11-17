(() => {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const chapters = Array.isArray(config.chapters) ? config.chapters : [];
  let activePhotoSet = [];
  let activePhotoIndex = 0;
  let soundOn = false;
  let soundContext = null;
  let soundTimer = null;
  let currentMusic = null;
  let soundChordIndex = 0;
  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));

  function begin() {
    document.title = config.name || 'Nossa história ♡';
    if (config.signature) {
      $('heroSignature').textContent = config.signature;
      $('letterSignature').textContent = config.signature;
    }
    if (config.anniversary) $('welcome').querySelector('.welcome__date').textContent = config.anniversary.toUpperCase();
    makeStars();
    renderChapters();
    renderLetter();
    setupWelcome();
    setupScroll();
    setupLetter();
    setupFinale();
    setupLightbox();
    setupSound();
    setRealHeroImage();
    setupOptionalCounter();
  }

  function setupWelcome() {
    const dialog = $('welcome');
    const button = $('enterButton');
    button.addEventListener('click', () => {
      dialog.classList.add('is-hidden');
      dialog.setAttribute('aria-hidden','true');
      document.body.classList.remove('is-locked');
      button.blur();
      if (!motionReduced) burstHearts(14);
    });
    // A tecla TAB permanece na tela inicial até que a surpresa seja aberta.
    dialog.addEventListener('keydown', (event) => {
      if(event.key === 'Tab') {event.preventDefault(); button.focus();}
    });
    button.focus({preventScroll: true});
  }

  function makeStars() {
    const hero = $('heroStars');
    const finale = document.querySelector('.final-section__stars');
    for(let i=0;i<25;i++) {
      const s=document.createElement('span'); s.className='hero-star'; s.textContent=i%3===0?'✦':'·';
      s.style.left=`${(i*39+11)%97}%`; s.style.top=`${(i*23+17)%94}%`;
      s.style.animationDelay=`${(i%7)*.35}s`; s.style.fontSize=`${i%5+7}px`;
      hero.append(s);
    }
    for(let i=0;i<34;i++) {
      const s=document.createElement('span'); s.className='hero-star'; s.textContent=i%3===0?'✦':'·';
      s.style.left=`${(i*43+7)%99}%`; s.style.top=`${(i*31+13)%93}%`;
      s.style.animationDelay=`${(i%9)*.43}s`; s.style.fontSize=`${i%5+6}px`;
      finale.append(s);
    }
  }

  function renderChapters() {
    const nav = $('timelineNav');
    const container = $('chapters');
    chapters.forEach((chapter, index) => {
      const label = chapter.year || `${index+1}º ano`;
      const tab = document.createElement('button');
      tab.type='button'; tab.className='timeline-tab'+(index===0?' is-active':'');
      tab.textContent=label; tab.setAttribute('aria-label', `Ir para ${label}`);
      tab.dataset.chapter = String(index);
      tab.addEventListener('click',()=>document.getElementById(`ano-${index+1}`).scrollIntoView({behavior:motionReduced?'instant':'smooth',block:'start'}));
      nav.append(tab);

      const section = document.createElement('article');
      section.className='chapter'; section.id=`ano-${index+1}`; section.dataset.index=String(index);
      const photos = Array.isArray(chapter.photos) && chapter.photos.length ? chapter.photos : [
        {src:'',date:'NOSSA MEMÓRIA',caption:'Um momento para guardar'},
        {src:'',date:'NOSSA MEMÓRIA',caption:'Mais um pedacinho de nós'},
        {src:'',date:'NOSSA MEMÓRIA',caption:'Um dia para recordar'}
      ];
      section.innerHTML = `
        <span class="chapter__dot" aria-hidden="true"></span>
        <div class="chapter__heading reveal"><div><span class="chapter__index">CAPÍTULO ${String(index+1).padStart(2,'0')} / ${escapeHtml(label.toUpperCase())}</span><h3>${escapeHtml(chapter.title || 'Um capítulo especial.')}</h3><span class="chapter__subtitle">${escapeHtml(chapter.subtitle || '')}</span></div></div>
        <p class="chapter__intro reveal">${escapeHtml(chapter.description || '')}</p>
        <div class="chapter__gallery-wrap reveal"><div class="chapter__gallery" tabindex="0" aria-label="Carrossel de fotos do ${escapeHtml(label)}"></div>
        <div class="chapter__gallery-controls"><div class="chapter__quote">“${escapeHtml(chapter.quote || 'Mais um pedacinho de nós dois.')}”</div><div class="chapter__arrows"><button class="circle-arrow arrow-prev" type="button" aria-label="Fotos anteriores">←</button><button class="circle-arrow arrow-next" type="button" aria-label="Próximas fotos">→</button></div></div></div>`;
      const gallery = section.querySelector('.chapter__gallery');
      photos.forEach((photo, photoIndex) => {
        const hasPhoto = typeof photo.src === 'string' && photo.src.trim().length > 0;
        const card = document.createElement(hasPhoto?'button':'article');
        if (hasPhoto) card.type='button';
        card.className='photo-card'+(hasPhoto?' photo-card--real':'');
        if (hasPhoto) card.setAttribute('aria-label', `Ampliar foto ${photoIndex+1} do ${label}`);
        const icon = ['♡','✦','∞','✿','☾'][photoIndex%5];
        card.innerHTML=`<div class="photo-card__media"><span class="photo-card__symbol" aria-hidden="true">${icon}</span><span class="photo-card__visual-label">${hasPhoto?'':'NOSSO PRÓXIMO RETRATO ♡'}</span></div><div class="photo-card__info"><span class="photo-card__date">${escapeHtml(photo.date || `MEMÓRIA ${String(photoIndex+1).padStart(2,'0')}`)}</span><span class="photo-card__caption">${escapeHtml(photo.caption || 'Uma lembrança especial')}</span></div>`;
        if (hasPhoto) {
          const img=document.createElement('img'); img.className='photo-card__img'; img.src=photo.src;
          img.loading='lazy'; img.alt=photo.alt || photo.caption || `Fotografia do ${label}`;
          img.addEventListener('error',()=>{img.remove();card.classList.remove('photo-card--real');});
          card.querySelector('.photo-card__media').append(img);
          card.addEventListener('click',()=>openLightbox(photos.filter(p=>p.src),photos.filter(p=>p.src).indexOf(photo)));
        }
        gallery.append(card);
      });
      const prev=section.querySelector('.arrow-prev');
      const next=section.querySelector('.arrow-next');
      const measure=()=>{
        const item=gallery.querySelector('.photo-card');
        return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(gallery).gap||'0') : gallery.clientWidth;
      };
      const updateArrows=()=>{
        prev.disabled=gallery.scrollLeft<=3;
        next.disabled=gallery.scrollLeft+gallery.clientWidth>=gallery.scrollWidth-3;
      };
      prev.addEventListener('click',()=>gallery.scrollBy({left:-measure(),behavior:motionReduced?'instant':'smooth'}));
      next.addEventListener('click',()=>gallery.scrollBy({left:measure(),behavior:motionReduced?'instant':'smooth'}));
      gallery.addEventListener('scroll',updateArrows,{passive:true});
      window.addEventListener('resize',updateArrows,{passive:true});
      container.append(section);
      requestAnimationFrame(updateArrows);
    });
    if ('IntersectionObserver' in window) {
      const chaptersObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            document.querySelectorAll('.timeline-tab').forEach((tab,i)=>tab.classList.toggle('is-active',i===Number(entry.target.dataset.index)));
          }
        });
      },{rootMargin:'-27% 0px -55% 0px',threshold:0});
      container.querySelectorAll('.chapter').forEach(el=>chaptersObserver.observe(el));
    }
  }

  function renderLetter() {
    $('letterTitle').textContent=config.letter?.greeting || 'Meu amor,';
    const body=$('letterParagraphs');
    (config.letter?.paragraphs || []).forEach(para=>{
      const p=document.createElement('p');p.textContent=para;body.append(p);
    });
  }
  function setupLetter() {
    $('openLetter').addEventListener('click',()=>{
      $('letterStage').classList.add('is-open');
      $('letterPaper').setAttribute('aria-hidden','false');
      setTimeout(()=>$('letterPaper').scrollIntoView({behavior:motionReduced?'instant':'smooth',block:'center'}),120);
    });
  }
  function setupScroll() {
    const handleScroll=()=>{
      const maxScroll=document.documentElement.scrollHeight-window.innerHeight;
      $('scrollBar').style.width=`${maxScroll>0 ? (scrollY/maxScroll*100).toFixed(2) : 0}%`;
      $('siteHeader').classList.toggle('is-scrolled',scrollY>50);
    };
    window.addEventListener('scroll',handleScroll,{passive:true});handleScroll();
    const reveal=(el)=>el.classList.add('is-visible');
    if('IntersectionObserver' in window && !motionReduced){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target);}});
      },{threshold:.075,rootMargin:'0px 0px 25px 0px'});
      document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
    } else {document.querySelectorAll('.reveal').forEach(reveal);}
    if('IntersectionObserver' in window){
      const nav=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){const id=entry.target.id;document.querySelectorAll('.nav__link').forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')===`#${id}`));}
      }),{rootMargin:'-25% 0px -63% 0px'});
      ['inicio','linha-do-tempo','cartinha','final'].forEach(id=>{const el=$(id);if(el)nav.observe(el);});
    }
  }

  function setRealHeroImage(){
    let first=null;
    for(const chapter of chapters){first=(chapter.photos || []).find(p=>p.src);if(first)break;}
    if(!first)return;
    const hero=$('heroPhoto');
    const image=document.createElement('img'); image.className='hero-photo__real';image.src=first.src;image.alt='Uma das nossas lembranças';
    image.addEventListener('load',()=>hero.querySelector('.hero-photo__placeholder')?.replaceWith(image));
  }

  function setupOptionalCounter(){
    if(!config.relationshipStart)return;
    const parsed=new Date(`${config.relationshipStart}T00:00:00`);
    if(Number.isNaN(parsed.getTime()))return;
    const days=Math.max(0,Math.floor((new Date()-parsed)/86400000));
    const label=document.querySelector('.intro-section__stats div:first-child');
    if(label){label.querySelector('strong').textContent=new Intl.NumberFormat('pt-BR').format(days);label.querySelector('span').textContent='dias de história juntos';}
  }

  function setupLightbox(){
    const modal=$('lightbox');
    $('lightboxClose').addEventListener('click',closeLightbox);
    $('lightboxPrev').addEventListener('click',()=>changePhoto(-1));
    $('lightboxNext').addEventListener('click',()=>changePhoto(1));
    modal.addEventListener('click',event=>{if(event.target===modal)closeLightbox();});
    document.addEventListener('keydown',event=>{
      if(!modal.classList.contains('is-open'))return;
      if(event.key==='Escape')closeLightbox();
      if(event.key==='ArrowLeft')changePhoto(-1);
      if(event.key==='ArrowRight')changePhoto(1);
    });
  }
  function openLightbox(photos,index){
    activePhotoSet=photos;activePhotoIndex=Math.max(0,index);updateLightbox();
    $('lightbox').classList.add('is-open');$('lightbox').setAttribute('aria-hidden','false');
    document.body.classList.add('is-locked');$('lightboxClose').focus();
  }
  function updateLightbox(){
    const photo=activePhotoSet[activePhotoIndex];if(!photo)return;
    $('lightboxImage').src=photo.src;$('lightboxImage').alt=photo.alt || photo.caption || 'Nossa fotografia';
    $('lightboxCaption').textContent=[photo.date,photo.caption].filter(Boolean).join(' · ');
    $('lightboxPrev').disabled=activePhotoIndex===0;$('lightboxNext').disabled=activePhotoIndex===activePhotoSet.length-1;
  }
  function changePhoto(delta){
    activePhotoIndex=Math.min(activePhotoSet.length-1,Math.max(0,activePhotoIndex+delta));updateLightbox();
  }
  function closeLightbox(){
    $('lightbox').classList.remove('is-open');$('lightbox').setAttribute('aria-hidden','true');
    document.body.classList.remove('is-locked');
  }

  function setupFinale(){
    document.querySelectorAll('.finale-button').forEach(button=>button.addEventListener('click',()=>{
      $('finalAnswer').textContent='Então que venham os próximos mil capítulos. Eu te amo! ♡';
      burstHearts(75);
    }));
  }
  function burstHearts(count){
    const layer=$('confettiLayer');
    if(!layer || motionReduced)return;
    for(let i=0;i<count;i++){
      const s=document.createElement('span');s.className='confetti-heart';s.textContent=['♥','♡','✦','✧'][i%4];
      s.style.left=`${Math.random()*100}%`;s.style.setProperty('--shift',`${Math.random()*240-120}px`);
      s.style.setProperty('--delay',`${Math.random()*1.3}s`);s.style.setProperty('--dur',`${3.3+Math.random()*2}s`);
      s.style.setProperty('--color',['#f7bac2','#e0a2cd','#f4d3ad','#ea829e'][i%4]);
      s.style.fontSize=`${14+Math.random()*20}px`;
      layer.append(s);setTimeout(()=>s.remove(),7000);
    }
  }

  const audioChords=[
    [261.63,329.63,392.0],[220.0,261.63,329.63],[174.61,220.0,261.63],[196.0,246.94,293.66]
  ];
  function playAmbientChord(){
    if(!soundContext||soundContext.state==='closed')return;
    const t=soundContext.currentTime+.06;
    audioChords[soundChordIndex%audioChords.length].forEach((frequency,index)=>{
      const osc=soundContext.createOscillator();const gain=soundContext.createGain();
      osc.type=index===1?'triangle':'sine';osc.frequency.value=frequency;
      gain.gain.setValueAtTime(0.00001,t);
      gain.gain.exponentialRampToValueAtTime(index===1?.011:.016,t+.7);
      gain.gain.setValueAtTime(index===1?.011:.016,t+2.6);
      gain.gain.exponentialRampToValueAtTime(.00001,t+3.55);
      osc.connect(gain).connect(soundContext.destination);
      osc.start(t);osc.stop(t+3.58);
    });
    soundChordIndex++;
  }
  async function setupSound(){
    const button=$('soundToggle'),label=$('soundLabel');
    button.addEventListener('click',async()=>{
      if(soundOn){stopSound();return;}
      try{
        if(config.musicUrl){currentMusic=new Audio(config.musicUrl);currentMusic.loop=true;currentMusic.volume=.45;await currentMusic.play();}
        else{
          const AudioAPI=window.AudioContext||window.webkitAudioContext;
          if(!AudioAPI)throw new Error('Sem suporte a áudio');
          soundContext=new AudioAPI();await soundContext.resume();playAmbientChord();soundTimer=setInterval(playAmbientChord,3500);
        }
        soundOn=true;button.setAttribute('aria-pressed','true');label.textContent='Pausar trilha';button.setAttribute('aria-label','Pausar trilha sonora');
      }catch(error){stopSound();label.textContent='Áudio indisponível';setTimeout(()=>label.textContent='Tocar trilha',2500);}
    });
  }
  function stopSound(){
    if(soundTimer)clearInterval(soundTimer);soundTimer=null;
    if(soundContext){soundContext.close().catch(()=>{});soundContext=null;}
    if(currentMusic){currentMusic.pause();currentMusic=null;}
    soundOn=false;$('soundToggle').setAttribute('aria-pressed','false');$('soundToggle').setAttribute('aria-label','Ativar trilha sonora');$('soundLabel').textContent='Tocar trilha';
  }

  // Inicia somente depois que o HTML foi montado, independentemente do modo de abertura.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', begin, { once: true });
  } else {
    begin();
  }
})();
