// Moteur de défilement du kit « scroll » (voir README §Le moteur). Un seul module, sans dépendance.
//  · chaque `[data-scroll]` reçoit une progression 0→1 dans sa variable CSS `--p`, lissée par un lerp dans rAF ;
//    modes : pin (section haute, contenu sticky natif), reveal (entrée dans la fenêtre), hero (sortie du hero) ;
//  · `data-steps="N"` → `data-step` + classe `is-active` sur les `[data-i]` du temps courant (Story) ;
//  · le rail mesure son débattement (`--travel`), les `[data-count]` comptent une fois, la vidéo du hero est montée ici.
//  · Rien ne change de position/taille en CSS depuis ce script : transform/opacity seulement, via les variables.
//  · `prefers-reduced-motion: reduce` → on ne fait rien : l'état de repos servi dans le HTML est déjà correct.
(() => {
  const mm = q => !!(window.matchMedia && window.matchMedia(q).matches);
  const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const root = document.documentElement;
  const reduce = mm('(prefers-reduced-motion: reduce)');

  /* ---- vidéo du hero : jamais dans le HTML servi, montée seulement si les conditions sont bonnes ---- */
  const mountVideo = () => {
    const h = document.querySelector('[data-video]');
    if (!h || reduce) return;
    const c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return;
    const d = h.dataset, mobile = mm('(max-width: 820px)');
    const mp4 = mobile ? d.videoPortrait : d.video, webm = mobile ? d.webmPortrait : d.webm, poster = (mobile && d.posterPortrait) || d.poster;
    if (!mp4) return;
    const v = document.createElement('video');
    v.className = 'hero__video'; v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', '');
    v.preload = 'metadata'; if (poster) v.poster = poster;
    if (webm) { const s = document.createElement('source'); s.src = webm; s.type = 'video/webm'; v.appendChild(s); }
    const s2 = document.createElement('source'); s2.src = mp4; s2.type = 'video/mp4'; v.appendChild(s2);
    v.addEventListener('playing', () => h.classList.add('is-live'), { once: true });
    h.appendChild(v); v.play().catch(() => {});
  };
  mountVideo();
  if (reduce) return;
  root.classList.add('has-motion');

  /* ---- compteurs : « 1 200 », « 4,9/5 », « 48 h » — la partie numérique compte, le reste ne bouge pas ---- */
  const count = el => {
    const m = /^(\D*)(\d[\d\s'’.,]*\d|\d)(.*)$/s.exec(el.textContent.trim());
    if (!m) return;
    const raw = m[2], sep = (raw.match(/[\s'’]/) || [''])[0], dec = raw.includes(',') ? ',' : '.';
    const clean = raw.replace(/[\s'’]/g, '').replace(',', '.'), n = parseFloat(clean), digits = (clean.split('.')[1] || '').length;
    if (!isFinite(n)) return;
    const fmt = v => { let [a, b] = v.toFixed(digits).split('.'); if (sep) a = a.replace(/\B(?=(\d{3})+(?!\d))/g, sep); return a + (b ? dec + b : ''); };
    const t0 = performance.now(), D = 1100;
    const tick = t => { const k = clamp((t - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = m[1] + fmt(n * e) + m[3]; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };

  /* ---- les sections ---- */
  const items = [].map.call(document.querySelectorAll('[data-scroll]'), el => ({ el, mode: el.dataset.scroll, steps: +el.dataset.steps || 0, cur: -1, target: 0, step: -1, on: false }));
  const rails = () => { document.querySelectorAll('[data-rail]').forEach(el => { const vp = el.querySelector('.rail__viewport'), tr = el.querySelector('.rail__track'); if (vp && tr) el.style.setProperty('--travel', Math.max(0, tr.scrollWidth - vp.clientWidth) + 'px'); }); };
  const setStep = (el, s) => { el.dataset.step = s; el.querySelectorAll('[data-i]').forEach(n => n.classList.toggle('is-active', +n.dataset.i === s)); };
  const enter = it => { it.on = true; it.el.classList.add('is-in'); it.el.querySelectorAll('[data-count]').forEach(count); };

  const measure = () => {
    const vh = window.innerHeight;
    for (const it of items) {
      const r = it.el.getBoundingClientRect(); let t;
      if (it.mode === 'pin') { const range = r.height - vh; t = range > 0 ? -r.top / range : (r.top <= 0 ? 1 : 0); }
      else if (it.mode === 'hero') t = -r.top / Math.max(1, r.height * 0.9);
      else t = (vh - r.top) / (vh * 0.45);   // reveal : 0 quand le haut entre par le bas, 1 quand il atteint 55 % de la fenêtre
      it.target = clamp(t);
    }
  };
  let raf = 0;
  const LERP = 0.16;
  const frame = () => {
    let busy = false;
    for (const it of items) {
      let c = it.cur < 0 ? it.target : it.cur + (it.target - it.cur) * LERP;   // première mesure : on se pose sans glisser
      if (Math.abs(it.target - c) < 0.0005) c = it.target;
      if (c !== it.cur) {
        it.cur = c; it.el.style.setProperty('--p', c.toFixed(4));
        if (!it.on && (c > 0.02 || it.mode === 'hero')) enter(it);
        if (it.steps > 1) { const s = Math.round(c * (it.steps - 1)); if (s !== it.step) { it.step = s; setStep(it.el, s); } }
      }
      if (it.cur !== it.target) busy = true;
    }
    raf = busy ? requestAnimationFrame(frame) : 0;
  };
  const kick = () => { measure(); if (!raf) raf = requestAnimationFrame(frame); };
  rails(); kick();
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', () => { rails(); kick(); });
  window.addEventListener('load', () => { rails(); kick(); });
})();
