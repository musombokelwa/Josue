/**
 * script.js — Cadeau anniversaire Salama
 * Logique : Accès, Enveloppe, Slideshow, Audio, Compteur, Modals
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────
     1. PARTICULES DE FOND (BLEU CIEL ATMOSPHÈRE)
  ────────────────────────────────────────────── */
  const pCanvas = document.getElementById('particles-canvas');
  const pCtx    = pCanvas.getContext('2d');
  let particles = [];

  function resizePCanvas() {
    pCanvas.width  = window.innerWidth;
    pCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizePCanvas);
  resizePCanvas();

  class Particle {
    constructor(initialY) {
      this.reset(initialY);
    }
    reset(startY) {
      this.x       = Math.random() * pCanvas.width;
      this.y       = startY !== undefined ? startY : pCanvas.height + 20;
      this.size    = Math.random() * 14 + 8;
      this.vy      = Math.random() * 0.7 + 0.3;
      this.vx      = (Math.random() - 0.5) * 0.4;
      this.alpha   = Math.random() * 0.38 + 0.15;
      this.symbol  = Math.random() > 0.45 ? '❤' : '✦';
    }
    update() {
      this.y -= this.vy;
      this.x += this.vx;
      if (this.y < -30) this.reset();
    }
    draw() {
      pCtx.save();
      pCtx.globalAlpha = this.alpha;
      pCtx.font = `${this.size}px serif`;
      pCtx.fillStyle = this.symbol === '❤' ? '#fca5a5' : '#bae6fd';
      pCtx.fillText(this.symbol, this.x, this.y);
      pCtx.restore();
    }
  }

  for (let i = 0; i < 22; i++) {
    particles.push(new Particle(Math.random() * window.innerHeight));
  }

  (function animate() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  })();


  /* ──────────────────────────────────────────────
     2. CONFETTIS
  ────────────────────────────────────────────── */
  const cCanvas = document.getElementById('confetti-canvas');
  const cCtx    = cCanvas.getContext('2d');
  let confetti  = [];

  function resizeCCanvas() {
    cCanvas.width  = window.innerWidth;
    cCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCCanvas);
  resizeCCanvas();

  function burstConfetti() {
    const palette = ['#dc2626','#0ea5e9','#fbbf24','#ec4899','#ffffff','#a3e635'];
    confetti = Array.from({ length: 120 }, () => ({
      x:    window.innerWidth  / 2,
      y:    window.innerHeight * 0.42,
      r:    Math.random() * 6 + 3,
      dx:   (Math.random() - 0.5) * 20,
      dy:   (Math.random() - 0.65) * 18,
      color: palette[Math.floor(Math.random() * palette.length)],
      tilt:  0,
      tiltSpeed: Math.random() * 0.1 + 0.04,
      alpha: 1,
    }));
    renderConfetti();
  }

  function renderConfetti() {
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    let active = false;
    confetti.forEach(p => {
      p.x     += p.dx;
      p.y     += p.dy;
      p.dy    += 0.32;
      p.dx    *= 0.98;
      p.tilt  += p.tiltSpeed;
      p.alpha -= 0.007;
      if (p.alpha > 0 && p.y < cCanvas.height + 20) {
        active = true;
        cCtx.save();
        cCtx.globalAlpha = Math.max(0, p.alpha);
        cCtx.fillStyle   = p.color;
        cCtx.beginPath();
        cCtx.ellipse(p.x + Math.sin(p.tilt) * 8, p.y, p.r, p.r * 0.5, p.tilt, 0, Math.PI * 2);
        cCtx.fill();
        cCtx.restore();
      }
    });
    if (active) requestAnimationFrame(renderConfetti);
    else cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
  }


  /* ──────────────────────────────────────────────
     3. AUDIO — CHANSON CHRÉTIENNE D'ANNIVERSAIRE
  ────────────────────────────────────────────── */
  const mainAudio   = document.getElementById('main-audio');
  const eqBars      = document.getElementById('eq-bars');
  const musicIcon   = document.getElementById('music-icon');
  const musicToggle = document.getElementById('music-toggle-btn');
  const customInput = document.getElementById('custom-audio-input');
  const slide5Btn   = document.getElementById('slide5-play-btn');
  const slide5Icon  = document.getElementById('slide5-play-icon');
  const slide5Text  = document.getElementById('slide5-play-text');

  let audioEl   = mainAudio;
  let audioPlaying = false;

  // Web Audio fallback (si mp3 bloqué)
  let audioCtx = null;
  let synthTimer = null;
  const NOTES = [261.63,329.63,392.00,523.25,440.00,523.25,659.25,349.23,440.00,523.25,587.33];
  let noteStep = 0;

  function playTone(freq, dur = 0.9) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (_) {}
  }

  function startSynth() {
    if (synthTimer) return;
    synthTimer = setInterval(() => {
      playTone(NOTES[noteStep % NOTES.length]);
      noteStep++;
    }, 750);
  }

  function stopSynth() {
    clearInterval(synthTimer);
    synthTimer = null;
  }

  function startAudio() {
    if (audioEl) {
      audioEl.play().then(() => {
        audioPlaying = true;
        setAudioUI(true);
      }).catch(() => {
        // Navigateur bloque l'autoplay — synth de secours
        startSynth();
        audioPlaying = true;
        setAudioUI(true);
      });
    }
  }

  function stopAudio() {
    if (audioEl) audioEl.pause();
    stopSynth();
    audioPlaying = false;
    setAudioUI(false);
  }

  function toggleAudio() {
    audioPlaying ? stopAudio() : startAudio();
  }

  function setAudioUI(on) {
    if (eqBars)     eqBars.classList.toggle('paused', !on);
    if (musicIcon)  musicIcon.textContent = on ? '♫' : '♪';
    if (slide5Icon) slide5Icon.textContent = on ? '⏸' : '▶';
    if (slide5Text) slide5Text.textContent = on ? 'Pause' : 'Écouter';
  }

  musicToggle?.addEventListener('click', toggleAudio);
  slide5Btn?.addEventListener('click', toggleAudio);

  customInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    stopAudio();
    const url = URL.createObjectURL(file);
    audioEl = new Audio(url);
    audioEl.loop = true;
    startAudio();
  });


  /* ──────────────────────────────────────────────
     4. VÉRIFICATION DATE ET ANIMATION ENVELOPPE
  ────────────────────────────────────────────── */
  const lockScreen  = document.getElementById('lock-screen');
  const slidesSection = document.getElementById('slides-section');
  const audioWidget = document.getElementById('audio-widget');
  const authForm    = document.getElementById('auth-form');
  const dobInput    = document.getElementById('dob-input');
  const errorMsg    = document.getElementById('error-msg');
  const envelope    = document.getElementById('envelope');

  dobInput?.addEventListener('input', () => {
    errorMsg.hidden = true;
    dobInput.classList.remove('invalid');
  });

  function isValidDate(val) {
    const v = (val || '').trim().replace(/[/.]/g, '-');
    return ['2-11-2006','02-11-2006','2006-11-02','2006-11-2','02112006','2112006'].includes(v);
  }

  authForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = dobInput.value;

    if (!isValidDate(val)) {
      // Erreur : tremblement enveloppe
      envelope.classList.remove('shake');
      void envelope.offsetWidth;
      envelope.classList.add('shake');
      dobInput.classList.add('invalid');
      errorMsg.hidden = false;
      playTone(160, 0.25);
      envelope.addEventListener('animationend', () => {
        envelope.classList.remove('shake');
      }, { once: true });
      return;
    }

    // Succès
    errorMsg.hidden = true;
    dobInput.classList.remove('invalid');

    // Ouvrir l'enveloppe
    envelope.classList.add('open');

    // Confettis
    setTimeout(burstConfetti, 400);

    // Démarrer la musique
    setTimeout(() => {
      startAudio();
      audioWidget.hidden = false;
    }, 600);

    // Transitions vers les slides
    setTimeout(() => {
      lockScreen.classList.add('leaving');
      lockScreen.addEventListener('animationend', () => {
        lockScreen.hidden = true;
        slidesSection.hidden = false;
        void slidesSection.offsetWidth;
        slidesSection.classList.add('visible');
        initSlides();
      }, { once: true });
    }, 2200);
  });


  /* ──────────────────────────────────────────────
     5. SLIDESHOW AUTOMATIQUE
  ────────────────────────────────────────────── */
  const SLIDE_DURATION = 9000; // ms par slide

  let currentSlide  = 0;
  let isAutoplay    = true;
  let autoTimer     = null;
  let progressTimer = null;
  let progressStart = null;

  const slides      = document.querySelectorAll('.slide');
  const dots        = document.querySelectorAll('.dot');
  const progressFill = document.getElementById('progress-fill');
  const slidesWrap  = document.getElementById('slides-wrap');

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides[currentSlide].classList.remove('slide--active');
    dots[currentSlide].classList.remove('active');
    dots[currentSlide].setAttribute('aria-selected', 'false');

    currentSlide = index;

    slides[currentSlide].classList.add('slide--active');
    dots[currentSlide].classList.add('active');
    dots[currentSlide].setAttribute('aria-selected', 'true');

    resetProgress();
  }

  function resetProgress() {
    cancelAnimationFrame(progressTimer);
    clearTimeout(autoTimer);
    if (progressFill) progressFill.style.width = '0%';
    if (!isAutoplay) return;

    progressStart = performance.now();

    function tick(now) {
      const elapsed  = now - progressStart;
      const progress = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
      if (progressFill) progressFill.style.width = `${progress}%`;
      if (elapsed < SLIDE_DURATION) {
        progressTimer = requestAnimationFrame(tick);
      }
    }
    progressTimer = requestAnimationFrame(tick);
    autoTimer = setTimeout(() => goToSlide(currentSlide + 1), SLIDE_DURATION);
  }

  function pauseAutoplay() {
    clearTimeout(autoTimer);
    cancelAnimationFrame(progressTimer);
  }

  function setAutoplay(on) {
    isAutoplay = on;
    const btn = document.getElementById('autoplay-btn');
    if (btn) {
      btn.textContent   = on ? '⏸' : '▶';
      btn.setAttribute('aria-pressed', String(on));
    }
    on ? resetProgress() : pauseAutoplay();
  }

  function initSlides() {
    goToSlide(0);

    // Pause au survol
    slidesWrap?.addEventListener('mouseenter', pauseAutoplay);
    slidesWrap?.addEventListener('mouseleave', () => { if (isAutoplay) resetProgress(); });

    // Navigation boutons
    document.getElementById('prev-btn')?.addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('next-btn')?.addEventListener('click', () => goToSlide(currentSlide + 1));
    document.getElementById('autoplay-btn')?.addEventListener('click', () => setAutoplay(!isAutoplay));

    // Points de navigation
    dots.forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });

    // Bouton "Ouvrir" du Slide 1
    document.getElementById('btn-continue')?.addEventListener('click', () => goToSlide(1));

    // Bouton "Revivre" du Slide 5
    document.getElementById('btn-replay')?.addEventListener('click', () => {
      burstConfetti();
      goToSlide(0);
    });

    // Clavier
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goToSlide(currentSlide + 1);
      if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   goToSlide(currentSlide - 1);
      if (e.key === ' ') { e.preventDefault(); setAutoplay(!isAutoplay); }
    });

    // Swipe mobile
    let touchX0 = 0;
    slidesWrap?.addEventListener('touchstart', e => { touchX0 = e.changedTouches[0].screenX; }, { passive: true });
    slidesWrap?.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].screenX - touchX0;
      if (Math.abs(dx) > 45) goToSlide(currentSlide + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }


  /* ──────────────────────────────────────────────
     6. COMPTEUR EN DIRECT — 2/11/2006 → MAINTENANT
  ────────────────────────────────────────────── */
  const BIRTH = new Date('2006-11-02T00:00:00');

  function updateCounter() {
    const now  = new Date();
    const diff = now - BIRTH;
    if (diff <= 0) return;

    const totalSec  = Math.floor(diff / 1000);
    const totalMin  = Math.floor(totalSec / 60);
    const totalHr   = Math.floor(totalMin / 60);
    const totalDays = Math.floor(totalHr  / 24);
    const years     = Math.floor(totalDays / 365.25);

    const sec  = totalSec  % 60;
    const min  = totalMin  % 60;
    const hrs  = totalHr   % 24;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = typeof val === 'number' && val < 100
        ? String(val).padStart(2, '0')
        : val.toLocaleString('fr-FR');
    };

    set('count-years',   years);
    set('count-days',    totalDays);
    set('count-hours',   hrs);
    set('count-minutes', min);
    set('count-seconds', sec);
  }

  updateCounter();
  setInterval(updateCounter, 1000);


  /* ──────────────────────────────────────────────
     7. GALERIE — LIGHTBOX
  ────────────────────────────────────────────── */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxCap  = document.getElementById('lightbox-cap');
  const lightboxClose= document.getElementById('lightbox-close');

  document.querySelectorAll('.gallery-card').forEach(card => {
    const open = () => {
      const img  = card.querySelector('.gallery-img');
      const cap  = card.querySelector('.caption-title')?.textContent || '';
      const text = card.querySelector('.caption-text')?.textContent  || '';
      if (!img || !lightbox) return;
      lightboxImg.src   = img.src;
      lightboxImg.alt   = cap;
      lightboxCap.textContent = `${cap} — ${text}`;
      lightbox.showModal();
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  lightboxClose?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });


  /* ──────────────────────────────────────────────
     8. MODAL — MOT SECRET
  ────────────────────────────────────────────── */
  const secretModal = document.getElementById('secret-modal');
  const modalClose  = document.getElementById('modal-close');

  document.getElementById('btn-secret-open')?.addEventListener('click', () => {
    burstConfetti();
    secretModal?.showModal();
  });
  modalClose?.addEventListener('click', () => secretModal?.close());
  secretModal?.addEventListener('click', e => { if (e.target === secretModal) secretModal.close(); });

});
