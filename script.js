/* ══════════════════════════════════════════════
   WEDDING INVITATION — script.js
   Fathima Shehama & Mohamed Nafees · July 2026
   ══════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   0. Utility
───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function pad(n) { return String(n).padStart(2, '0'); }

/* ─────────────────────────────────────────────
   1. Particle System
───────────────────────────────────────────── */
(function initParticles() {
  const canvas = $('#particle-canvas');
  const ctx = canvas.getContext('2d');
  let pts = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const TYPES = [
    { r: 1.3, col: '201,168,76',  aBase: .45 },
    { r: .85, col: '185,165,218', aBase: .35 },
    { r: 1.6, col: '232,208,138', aBase: .28 },
    { r: .6,  col: '255,255,255', aBase: .18 },
  ];

  function makeParticle() {
    const t = TYPES[Math.floor(Math.random() * TYPES.length)];
    return {
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  t.r + Math.random() * .7,
      dx: (Math.random() - .5) * .22,
      dy: -(Math.random() * .42 + .06),
      alpha: t.aBase + Math.random() * .18,
      col:   t.col,
      tw:    Math.random() * Math.PI * 2,
      twSpd: Math.random() * .025 + .008,
    };
  }

  for (let i = 0; i < 140; i++) pts.push(makeParticle());

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.tw += p.twSpd;
      const a = p.alpha * (.65 + .35 * Math.sin(p.tw));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col},${a})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.y < -10) Object.assign(p, makeParticle(), { y: canvas.height + 10 });
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─────────────────────────────────────────────
   2. Section / Nav Dot Management
───────────────────────────────────────────── */
const PAGE_IDS = ['page-envelope', 'page-card', 'page-countdown', 'page-map', 'page-wishes'];
let currentPage = 0;

function goTo(index) {
  index = Math.max(0, Math.min(index, PAGE_IDS.length - 1));
  currentPage = index;
  $('#' + PAGE_IDS[index]).scrollIntoView({ behavior: 'smooth' });
  updateDots(index);
}

function updateDots(idx) {
  $$('.ndot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

// Wire nav dot buttons
$$('.ndot').forEach(btn => {
  btn.addEventListener('click', () => goTo(+btn.dataset.sec));
});

// Wire scroll-cue arrows
$$('.page-scroll-cue').forEach(el => {
  el.addEventListener('click', () => goTo(+el.dataset.target));
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(currentPage + 1); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(currentPage - 1); }
});

// Intersection observer — show dots + animate sections
const navDots = $('#nav-dots');
const observer = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('in'), i * 100);
      });
      const idx = PAGE_IDS.indexOf(en.target.id);
      if (idx >= 0) { currentPage = idx; updateDots(idx); }
    }
  });
}, { threshold: .28 });

$$('.page').forEach(p => observer.observe(p));
setTimeout(() => navDots.classList.add('show'), 1400);

/* ─────────────────────────────────────────────
   3. Envelope Animation
───────────────────────────────────────────── */
let envOpened = false;

function openEnvelope() {
  if (envOpened) return;
  envOpened = true;

  const env  = $('#envelope');
  env.classList.add('opening');

  setTimeout(() => {
    env.classList.add('opened');

    setTimeout(() => {
      $('#envScene').style.display = 'none';

      // show card
      const card = $('#invitation-card');
      card.classList.remove('hidden');
      card.classList.add('visible');

      // scroll to card section
      goTo(1);

      // start scratch after card appears
      setTimeout(initScratch, 900);
    }, 650);
  }, 980);
}

const envScene = $('#envScene');
envScene.addEventListener('click',    openEnvelope);
envScene.addEventListener('keydown',  e => e.key === 'Enter' && openEnvelope());

/* ─────────────────────────────────────────────
   4. 3-D Card Tilt
───────────────────────────────────────────── */
const cardEl = $('#invCard');
if (cardEl) {
  document.addEventListener('mousemove', e => {
    const r = cardEl.getBoundingClientRect();
    const rx = -((e.clientY - r.top  - r.height / 2) / r.height) * 10;
    const ry =  ((e.clientX - r.left - r.width  / 2) / r.width)  * 10;
    cardEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  document.addEventListener('mouseleave', () => { cardEl.style.transform = ''; });
}

/* ─────────────────────────────────────────────
   5. Venue Pill → Map
───────────────────────────────────────────── */
const venuePill = $('#venuePill');
if (venuePill) {
  venuePill.addEventListener('click',   () => goTo(3));
  venuePill.addEventListener('keydown', e => e.key === 'Enter' && goTo(3));
}

/* ─────────────────────────────────────────────
   6. Scratch-to-Reveal Date
───────────────────────────────────────────── */
function initScratch() {
  const wrap   = $('#scratchWrap');
  const canvas = $('#scratchCanvas');
  const hint   = $('#scratchSub');
  const done   = $('#scratchDone');
  if (!wrap || !canvas) return;

  const W = wrap.offsetWidth;
  const H = wrap.offsetHeight;
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');

  // base gradient
  const grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0,   '#7a4a9a');
  grd.addColorStop(.45, '#5a2c78');
  grd.addColorStop(1,   '#3a1858');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // diagonal line pattern
  for (let i = 0; i < W + H; i += 5) {
    ctx.strokeStyle = `rgba(255,255,255,${i % 20 === 0 ? .06 : .02})`;
    ctx.lineWidth = .5;
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(0, i); ctx.stroke();
  }

  // repeated text
  ctx.fillStyle = 'rgba(255,255,255,.065)';
  ctx.font = '10px serif';
  for (let x = 0; x < W; x += 55)
    for (let y = 0; y < H; y += 17)
      ctx.fillText('✦ SCRATCH', x, y + 13);

  // gold border
  ctx.strokeStyle = 'rgba(201,168,76,.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  // switch to erasing mode
  ctx.globalCompositeOperation = 'destination-out';

  let pressing = false;

  function getXY(e) {
    const r = canvas.getBoundingClientRect();
    return e.touches
      ? { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }
      : { x: e.clientX - r.left,            y: e.clientY - r.top };
  }

  function scrub(e) {
    if (!pressing) return;
    e.preventDefault();
    const { x, y } = getXY(e);
    const rg = ctx.createRadialGradient(x, y, 0, x, y, 26);
    rg.addColorStop(0, 'rgba(0,0,0,1)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    checkReveal();
  }

  function checkReveal() {
    const data = ctx.getImageData(0, 0, W, H).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 128) transparent++;
    if (transparent / (W * H) > .54) revealDate();
  }

  function revealDate() {
    canvas.style.opacity    = '0';
    canvas.style.transition = 'opacity .6s';
    canvas.style.pointerEvents = 'none';
    hint.style.display = 'none';
    done.style.display = 'block';
    spawnConfetti(60);
  }

  canvas.addEventListener('mousedown',  e => { pressing = true;  scrub(e); });
  canvas.addEventListener('mousemove',  scrub);
  canvas.addEventListener('mouseup',    () => pressing = false);
  canvas.addEventListener('mouseleave', () => pressing = false);
  canvas.addEventListener('touchstart', e => { pressing = true;  scrub(e); }, { passive: false });
  canvas.addEventListener('touchmove',  scrub, { passive: false });
  canvas.addEventListener('touchend',   () => pressing = false);
}

/* ─────────────────────────────────────────────
   7. Countdown Timer
───────────────────────────────────────────── */
(function initCountdown() {
  const WEDDING = new Date('2026-07-11T20:00:00');
  const START   = new Date('2026-01-01T00:00:00');
  const C = 2 * Math.PI * 88; // ring circumference

  let prevVals = {};

  function setNum(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    const str = pad(val);
    if (str !== prevVals[id]) {
      el.textContent = str;
      el.classList.remove('flip');
      void el.offsetWidth; // reflow
      el.classList.add('flip');
      prevVals[id] = str;
    }
  }

  function tick() {
    const now  = new Date();
    const diff = WEDDING - now;

    if (diff <= 0) {
      ['cd-d','cd-h','cd-m','cd-s'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      return;
    }

    setNum('cd-d', Math.floor(diff / 86400000));
    setNum('cd-h', Math.floor((diff % 86400000) / 3600000));
    setNum('cd-m', Math.floor((diff % 3600000)  / 60000));
    setNum('cd-s', Math.floor((diff % 60000)    / 1000));

    // ring — % of the year elapsed toward the wedding
    const total   = WEDDING - START;
    const elapsed = now - START;
    const pct     = Math.max(0, Math.min(1, elapsed / total));

    const ring = document.getElementById('ringProgress');
    if (ring) ring.style.strokeDashoffset = C * (1 - pct);
    const pctEl = document.getElementById('ringPct');
    if (pctEl) pctEl.textContent = Math.round(pct * 100) + '%';
  }

  tick();
  setInterval(tick, 1000);
})();

/* ─────────────────────────────────────────────
   8. Confetti
───────────────────────────────────────────── */
function spawnConfetti(count = 70) {
  const COLORS = ['#c9a84c','#b3a0c8','#f0e8f5','#7a5f9a','#e8d08a','#ffffff','#ffd700','#d4b8e0'];
  const container = $('#confetti-container');
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = 6 + Math.random() * 8;
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -20px;
      width: ${size}px;
      height: ${size}px;
      background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
      animation-delay: ${Math.random() * 1.6}s;
      animation-duration: ${1.8 + Math.random() * 1.4}s;
      border-radius: ${Math.random() > .5 ? '50%' : '2px'};
    `;
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ─────────────────────────────────────────────
   9. Wishes Wall
───────────────────────────────────────────── */
// ── Pre-seeded sample wishes ──
const SEED_WISHES = [
  { name: 'Ahmed & Layla',    relation: 'Family',   text: 'May Allah bless your union with endless love, happiness, and barakah. Wishing you a lifetime of joy together! 💍',        time: '2 days ago' },
  { name: 'Rania Malik',      relation: 'Friend',   text: 'Fathima, you are the most beautiful bride. May your home be filled with laughter and love always. 🌸',                    time: '1 day ago'  },
  { name: 'Uncle Nasser',     relation: 'Family',   text: 'Barakallahu Lakuma! Two hearts joined in the name of Allah — there is no stronger foundation. 🤲',                         time: '1 day ago'  },
  { name: 'Zara & Tariq',     relation: 'Friend',   text: 'May every day of your marriage be sweeter than the last. Congratulations to the beautiful couple! ✨',                      time: '5 hrs ago'  },
  { name: 'Mrs. Hana School', relation: 'Colleague', text: 'Wishing Mohamed and Fathima a lifetime of partnership, understanding, and unwavering love. Mabrook! 🕊️',                time: '3 hrs ago'  },
  { name: 'Salma & Kids',     relation: 'Neighbour', text: 'You two are perfect for each other — watching this love story blossom has been a true blessing. ❤️',                     time: '1 hr ago'   },
];

const wall     = $('#wishesWall');
const emptyMsg = $('#wishesEmpty');
let wishes = [...SEED_WISHES];

function timeAgo() {
  return 'Just now';
}

function renderWishes() {
  wall.innerHTML = '';
  if (wishes.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';
  wishes.forEach((w, i) => {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <p class="wish-text">${escapeHTML(w.text)}</p>
      <div class="wish-meta">
        <span class="wish-author">${escapeHTML(w.name)}</span>
        <span class="wish-relation">${escapeHTML(w.relation)}</span>
        <span class="wish-time">${w.time}</span>
      </div>
    `;
    wall.appendChild(card);
  });
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

renderWishes();

// ── Char counter ──
const wishMsg   = $('#wishMsg');
const charCount = $('#charCount');
wishMsg.addEventListener('input', () => {
  charCount.textContent = wishMsg.value.length;
});

// ── Emoji quick-add ──
$$('.emoji-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    wishMsg.value += btn.dataset.e;
    charCount.textContent = wishMsg.value.length;
    wishMsg.focus();
  });
});

// ── Submit ──
const submitBtn = $('#wishSubmitBtn');
const wfError   = $('#wfError');
const wishName  = $('#wishName');
const wishRel   = $('#wishRelation');

submitBtn.addEventListener('click', () => {
  wfError.textContent = '';
  const name = wishName.value.trim();
  const msg  = wishMsg.value.trim();
  const rel  = wishRel.value;

  if (!name) { wfError.textContent = 'Please enter your name.'; wishName.focus(); return; }
  if (!msg)  { wfError.textContent = 'Please write a wish.';    wishMsg.focus();  return; }

  // Add to top
  wishes.unshift({ name, relation: rel || 'Guest', text: msg, time: timeAgo() });
  renderWishes();

  // Reset
  wishName.value = '';
  wishRel.value  = '';
  wishMsg.value  = '';
  charCount.textContent = '0';

  // Success feedback
  submitBtn.textContent = '✦ Wish Sent! ✦';
  submitBtn.style.background = 'linear-gradient(135deg, #5a8a4c, #3a6a2c)';
  setTimeout(() => {
    submitBtn.textContent = '✦ Send My Wish ✦';
    submitBtn.style.background = '';
  }, 2800);

  spawnConfetti(55);

  // Scroll to wall
  setTimeout(() => wall.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
});
