/* =========================================================
   PANTES GOLD & JEWELRY — script.js  v5

   ╔══════════════════════════════════════════════════════╗
   ║        EDIT NILAI COKIM DI SINI (berlaku demo)      ║
   ║  COKIM 1 → patokan Harga Jual Emas Daftar 2         ║
   ║  COKIM 2 → patokan Harga Terima Daftar 1 (6K–18K)  ║
   ║  COKIM 3 → cadangan / referensi                     ║
   ╚══════════════════════════════════════════════════════╝ */

const COKIM = {
  cokim1: 1_820_000,   // per gram — Daftar 2 Harga Emas jual
  cokim2: 1_800_000,   // per gram — Daftar 1 & Daftar 2 Harga Terima 6K–9K
  cokim3: 1_750_000,   // cadangan
};

/* ─── KONFIGURASI KADAR ────────────────────────────────
   DAFTAR 1 (harga terima / harga beli perhiasan):
     Rumus: cokim2 × pct  →  FLOOR ke 500

   DAFTAR 2 HARGA EMAS:
     Harga Jual   : cokim1 × pctHigh → CEILING ke 500
     Harga Terima :
       6K – 9K  : SAMA dengan harga di Daftar 1
                  = cokim2 × pct Daftar1 → FLOOR ke 500
       16K–18K  : cokim1 × pctLow  → FLOOR ke 500  – 19.500
─────────────────────────────────────────────────────── */

/* Daftar 1 — satu persentase per kadar */
const KADAR_D1 = [
  { kadar: '6K',  pct: 0.25 },
  { kadar: '7K',  pct: 0.25 },
  { kadar: '8K',  pct: 0.28 },
  { kadar: '9K',  pct: 0.32 },
  { kadar: '16K', pct: 0.70 },
  { kadar: '17K', pct: 0.73 },
  { kadar: '18K', pct: 0.78 },
];

/* Lookup table: kadar → pct Daftar 1 (dipakai untuk harga terima 6–9K di Daftar 2) */
const D1_PCT = Object.fromEntries(KADAR_D1.map(k => [k.kadar, k.pct]));

/* Daftar 2 — range persentase jual, dan apakah highKadar (16K+) */
const KADAR_D2 = [
  { kadar: '6K',  pctLow: 0.335, pctHigh: 0.370, highKadar: false },
  { kadar: '7K',  pctLow: 0.400, pctHigh: 0.400, highKadar: false },
  { kadar: '8K',  pctLow: 0.450, pctHigh: 0.480, highKadar: false },
  { kadar: '9K',  pctLow: 0.490, pctHigh: 0.520, highKadar: false },
  { kadar: '16K', pctLow: 0.765, pctHigh: 0.780, highKadar: true  },
  { kadar: '17K', pctLow: 0.870, pctHigh: 0.870, highKadar: true  },
  { kadar: '18K', pctLow: 0.880, pctHigh: 0.880, highKadar: true  },
];

/* ─── MANUAL: ANTAM 2026 ─────────────────────────────── */
const ANTAM_2026 = [
  { gram: '0.5', jual: 'Rp 955.000',     terima: 'Rp 830.000'     },
  { gram: '1',   jual: 'Rp 1.872.000',   terima: 'Rp 1.770.000'   },
  { gram: '2',   jual: 'Rp 3.722.000',   terima: 'Rp 3.520.000'   },
  { gram: '5',   jual: 'Rp 9.260.000',   terima: 'Rp 8.770.000'   },
  { gram: '10',  jual: 'Rp 18.490.000',  terima: 'Rp 17.510.000'  },
  { gram: '25',  jual: 'Rp 46.125.000',  terima: 'Rp 43.700.000'  },
  { gram: '50',  jual: 'Rp 92.150.000',  terima: 'Rp 87.250.000'  },
  { gram: '100', jual: 'Rp 184.100.000', terima: 'Rp 174.400.000' },
];

/* ─── MANUAL: ANTAM UNDER 2026 ──────────────────────── */
const ANTAM_UNDER = [
  { gram: '0.5', jual: 'Rp 940.000',     terima: 'Rp 815.000'     },
  { gram: '1',   jual: 'Rp 1.845.000',   terima: 'Rp 1.745.000'   },
  { gram: '2',   jual: 'Rp 3.668.000',   terima: 'Rp 3.468.000'   },
  { gram: '5',   jual: 'Rp 9.120.000',   terima: 'Rp 8.630.000'   },
  { gram: '10',  jual: 'Rp 18.200.000',  terima: 'Rp 17.220.000'  },
  { gram: '25',  jual: 'Rp 45.400.000',  terima: 'Rp 43.000.000'  },
  { gram: '50',  jual: 'Rp 90.700.000',  terima: 'Rp 85.900.000'  },
  { gram: '100', jual: 'Rp 181.200.000', terima: 'Rp 166.060.000' },
];

/* ─── MANUAL: LOTUS ARCHI ───────────────────────────── */
const LOTUS = [
  { gram: '0.5', jual: 'Rp 940.000',     terima: 'Rp 815.000'     },
  { gram: '1',   jual: 'Rp 1.845.000',   terima: 'Rp 1.745.000'   },
  { gram: '2',   jual: 'Rp 3.668.000',   terima: 'Rp 3.468.000'   },
  { gram: '5',   jual: 'Rp 9.120.000',   terima: 'Rp 8.630.000'   },
  { gram: '10',  jual: 'Rp 18.200.000',  terima: 'Rp 17.220.000'  },
  { gram: '25',  jual: 'Rp 45.400.000',  terima: 'Rp 43.000.000'  },
  { gram: '50',  jual: 'Rp 90.700.000',  terima: 'Rp 85.900.000'  },
  { gram: '100', jual: 'Rp 181.200.000', terima: 'Rp 166.060.000' },
];

/* ─── MANUAL: UBS SNI (Baru) ────────────────────────── */
const UBS = [
  { gram: '0.5', jual: 'Rp 920.000',     terima: 'Rp 800.000'     },
  { gram: '1',   jual: 'Rp 1.820.000',   terima: 'Rp 1.720.000'   },
  { gram: '2',   jual: 'Rp 3.620.000',   terima: 'Rp 3.420.000'   },
  { gram: '3',   jual: 'Rp 5.420.000',   terima: 'Rp 5.120.000'   },
  { gram: '4',   jual: 'Rp 7.220.000',   terima: 'Rp 6.820.000'   },
  { gram: '5',   jual: 'Rp 9.020.000',   terima: 'Rp 8.520.000'   },
  { gram: '10',  jual: 'Rp 17.980.000',  terima: 'Rp 16.980.000'  },
  { gram: '25',  jual: 'Rp 44.850.000',  terima: 'Rp 42.350.000'  },
  { gram: '50',  jual: 'Rp 89.600.000',  terima: 'Rp 84.600.000'  },
  { gram: '100', jual: 'Rp 179.000.000', terima: 'Rp 169.000.000' },
];

/* ═══════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════ */
const CONFIG = {
  SLIDE_DURATION:   15_000,    // ms antar slide (15 detik)
  REFRESH_INTERVAL: 30_000,    // ms auto-refresh data
  DEMO_MODE: true,             // true = hitung dari COKIM, false = Google Sheets

  /* Ganti dengan URL deployment Google Apps Script Anda */
  GAS_URL: 'https://script.google.com/macros/s/GANTI_URL_ANDA/exec',
};

/* ═══════════════════════════════════════════════════════
   FORMULA ENGINE
═══════════════════════════════════════════════════════ */
const ceil500  = v => Math.ceil(v  / 500) * 500;
const floor500 = v => Math.floor(v / 500) * 500;
const fmtRp    = v => 'Rp ' + Math.round(v).toLocaleString('id-ID');
const fmtRange = (lo, hi) => lo === hi ? fmtRp(lo) : `${fmtRp(lo)} – ${fmtRp(hi)}`;

/**
 * DAFTAR 1 — Harga Terima (harga beli perhiasan)
 * Rumus: cokim2 × pct → FLOOR ke 500
 */
function buildDaftar1() {
  return KADAR_D1.map(({ kadar, pct }) => ({
    kadar,
    harga: fmtRp(floor500(COKIM.cokim2 * pct)),
  }));
}

/**
 * DAFTAR 2 — Harga Emas
 * Harga Jual  : cokim1 × pctHigh -> CEILING ke 500
 * Harga Terima:
 *   6K-9K   : IDENTIK dengan harga beli Daftar 1
 *              -> diambil langsung dari buildDaftar1() per kadar
 *              -> tidak dihitung ulang agar 100% sama
 *   16K-18K : cokim1 × pct -> FLOOR ke 500 - 19.500
 */
function buildHargaEmas() {
  // Buat lookup harga beli Daftar 1: { '6K': 'Rp 450.000', ... }
  const hargaBeli = Object.fromEntries(
    buildDaftar1().map(row => [row.kadar, row.harga])
  );

  return KADAR_D2.map(({ kadar, pctLow, pctHigh, highKadar }) => {
    // Harga Jual: cokim1 x pct -> CEILING 500
    const jualLo = ceil500(COKIM.cokim1 * pctLow);
    const jualHi = ceil500(COKIM.cokim1 * pctHigh);

    // Harga Terima:
    //   6K-9K   : SAMA PERSIS dengan harga jual (cokim1 x pct -> CEILING 500)
    //   16K-18K : cokim1 x pct -> FLOOR 500 - 19.500
    let terimaStr;
    if (!highKadar) {
      // 6K-9K: harga terima = harga jual (nilai identik)
      terimaStr = fmtRange(jualLo, jualHi);
    } else {
      // 16K-18K: cokim1 x pct -> floor - 19.500
      const terLo = floor500(COKIM.cokim1 * pctLow)  - 19500;
      const terHi = floor500(COKIM.cokim1 * pctHigh) - 19500;
      terimaStr = fmtRange(terLo, terHi);
    }

    return {
      kadar,
      harga_jual:   fmtRange(jualLo, jualHi),
      harga_terima: terimaStr,
      isRange:      pctLow !== pctHigh,
    };
  });
}

/* ═══════════════════════════════════════════════════════
   CLOCK
═══════════════════════════════════════════════════════ */
const pad = n => String(n).padStart(2, '0');

function updateClock() {
  const now   = new Date();
  const hms   = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dmy   = `${pad(now.getDate())} / ${pad(now.getMonth()+1)} / ${now.getFullYear()}`;
  const short = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;

  document.getElementById('clock').textContent = hms;
  document.getElementById('date').textContent  = dmy;

  const hd = document.getElementById('hhiDate');
  if (hd) hd.textContent = short;
}
setInterval(updateClock, 1000);
updateClock();

/* ═══════════════════════════════════════════════════════
   STATUS
═══════════════════════════════════════════════════════ */
function setStatus(state, text) {
  document.getElementById('statusDot').className    = 'sdot ' + state;
  document.getElementById('statusText').textContent = text;
}

/* ═══════════════════════════════════════════════════════
   COKIM BAR
═══════════════════════════════════════════════════════ */
function renderCokimBar() {
  const el = document.getElementById('cokimBar');
  if (!el) return;
  el.innerHTML =
    `<span class="ck-label">C1</span><span class="ck-val">${fmtRp(COKIM.cokim1)}</span>` +
    `<span class="ck-sep">·</span>` +
    `<span class="ck-label">C2</span><span class="ck-val">${fmtRp(COKIM.cokim2)}</span>` +
    `<span class="ck-sep">·</span>` +
    `<span class="ck-label">C3</span><span class="ck-val">${fmtRp(COKIM.cokim3)}</span>`;
}

/* ═══════════════════════════════════════════════════════
   SLIDESHOW ENGINE
═══════════════════════════════════════════════════════ */
const slides      = Array.from(document.querySelectorAll('.slide'));
const dots        = Array.from(document.querySelectorAll('.dot'));
const progressBar = document.getElementById('progressBar');
const TOTAL       = slides.length;

let currentIdx  = 0;
let paused      = false;
let progressRAF = null;
let progStart   = null;

function goTo(idx, dir = 'next') {
  if (idx === currentIdx) return;
  const prev = currentIdx;
  currentIdx = ((idx % TOTAL) + TOTAL) % TOTAL;

  slides[prev].classList.remove('active');
  slides[prev].classList.add(dir === 'next' ? 'exit-left' : 'exit-right');
  setTimeout(() => slides[prev].classList.remove('exit-left', 'exit-right'), 700);

  slides[currentIdx].classList.add('active');
  dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));

  if (!paused) startProgress();
}

const nextSlide = () => goTo(currentIdx + 1, 'next');
const prevSlide = () => goTo(currentIdx - 1, 'prev');

function startProgress() {
  cancelAnimationFrame(progressRAF);
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';
  progStart = performance.now();

  function tick(now) {
    const pct = Math.min(((now - progStart) / CONFIG.SLIDE_DURATION) * 100, 100);
    progressBar.style.width = pct + '%';
    pct < 100 ? (progressRAF = requestAnimationFrame(tick)) : nextSlide();
  }
  progressRAF = requestAnimationFrame(tick);
}

const stopProgress = () => cancelAnimationFrame(progressRAF);

function togglePause() {
  paused = !paused;
  const btn = document.getElementById('btnPause');
  if (paused) {
    stopProgress();
    btn.textContent = '▶';
    btn.title = 'Lanjutkan';
  } else {
    startProgress();
    btn.innerHTML = '&#9646;&#9646;';
    btn.title = 'Pause';
  }
}

/* Button listeners */
document.getElementById('btnNext').addEventListener('click', () => {
  stopProgress(); nextSlide(); if (!paused) startProgress();
});
document.getElementById('btnPrev').addEventListener('click', () => {
  stopProgress(); prevSlide(); if (!paused) startProgress();
});
document.getElementById('btnPause').addEventListener('click', togglePause);

dots.forEach((dot, i) => dot.addEventListener('click', () => {
  stopProgress();
  goTo(i, i > currentIdx ? 'next' : 'prev');
  if (!paused) startProgress();
}));

document.addEventListener('keydown', e => {
  if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
    stopProgress(); nextSlide(); if (!paused) startProgress();
  }
  if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
    stopProgress(); prevSlide(); if (!paused) startProgress();
  }
  if (e.key === ' ') { e.preventDefault(); togglePause(); }
});

/* Swipe */
let touchX = 0;
const sw = document.getElementById('slideshowWrap');
sw.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
sw.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) {
    stopProgress();
    dx < 0 ? nextSlide() : prevSlide();
    if (!paused) startProgress();
  }
});

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const nowStr = () => new Date().toLocaleTimeString('id-ID',
  { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function flash(el) {
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ═══════════════════════════════════════════════════════
   RENDER — SLIDE 0: DAFTAR 1 (price cells)
═══════════════════════════════════════════════════════ */
function renderDaftar1(rows) {
  const grid = document.getElementById('daftar1Grid');
  if (!grid) return;
  if (!rows || !rows.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;color:#fff;text-align:center;padding:30px">Tidak ada data</div>';
    return;
  }

  /* Layout: index 0–3 = LEFT column (6K,7K,8K,9K), index 4+ = RIGHT column */
  const left  = rows.filter((_, i) => i < 4);
  const right = rows.filter((_, i) => i >= 4);
  while (right.length < 4) right.push(null); // pad to 4 rows

  grid.innerHTML = '';
  for (let r = 0; r < 4; r++) {
    const lRow = left[r]  || null;
    const rRow = right[r] || null;

    // Left cell
    if (lRow) grid.appendChild(makeS1Cell(lRow, r));
    else      grid.appendChild(makeEmptyCell());

    // Right cell
    if (rRow) grid.appendChild(makeS1Cell(rRow, r + 0.1));
    else      grid.appendChild(makeEmptyCell());
  }
  flash(grid);
}

function makeS1Cell(row, delay) {
  const cell = document.createElement('div');
  cell.className = 's1-cell';
  cell.style.animationDelay = delay * 0.05 + 's';
  const kadar = row.kadar || Object.values(row)[0] || '—';
  const harga = row.harga || row.harga_beli || row['Harga Beli'] || '—';
  cell.innerHTML = `
    <div class="s1-kadar">
      <span class="s1-kadar-text">${esc(kadar)}<span class="s1-kadar-rp"> Rp</span></span>
    </div>
    <div class="s1-harga">
      <span class="s1-harga-val">${esc(harga)}</span>
    </div>`;
  return cell;
}

function makeEmptyCell() {
  const d = document.createElement('div');
  d.className = 's1-cell s1-cell-empty';
  return d;
}

/* ═══════════════════════════════════════════════════════
   RENDER — SLIDE 1: HARGA EMAS (full-width table)
═══════════════════════════════════════════════════════ */
function renderHargaEmas(rows) {
  const tbody = document.getElementById('tbodyHargaEmas');
  if (!tbody) return;
  if (!rows || !rows.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="td-empty">Tidak ada data</td></tr>';
    return;
  }
  tbody.innerHTML = '';
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.style.animationDelay = i * 0.04 + 's';

    const kadar = row.kadar || '—';
    const jual  = row.harga_jual   || '—';
    const terima= row.harga_terima || '—';
    const isRange = String(jual).includes('–') || String(terima).includes('–');

    [kadar, jual, terima].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      if (isRange && val !== kadar) td.classList.add('td-range');
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  flash(tbody.closest('table'));
}

/* ═══════════════════════════════════════════════════════
   RENDER — SLIDE 2: LM ANTAM 2026 + UNDER 2026
═══════════════════════════════════════════════════════ */
function renderS3(antam2026, antamUnder) {
  const body = document.getElementById('s3Body');
  if (!body) return;
  const len = Math.max(antam2026.length, antamUnder.length);
  body.innerHTML = '';
  for (let i = 0; i < len; i++) {
    const a = antam2026[i]  || {};
    const u = antamUnder[i] || {};
    const row = document.createElement('div');
    row.className = 's3-row';
    row.style.animationDelay = i * 0.035 + 's';
    row.innerHTML = `
      <div class="s3-gram-val">${esc(a.gram || u.gram || '—')}</div>
      <div class="s3-val">${esc(a.jual  || a.harga_jual   || '—')}</div>
      <div class="s3-val">${esc(a.terima|| a.harga_terima || '—')}</div>
      <div class="s3-val s3-val-green">${esc(u.jual  || u.harga_jual   || '—')}</div>
      <div class="s3-val s3-val-green">${esc(u.terima|| u.harga_terima || '—')}</div>`;
    body.appendChild(row);
  }
  flash(body);
}

/* ═══════════════════════════════════════════════════════
   RENDER — SLIDE 3: LM UBS SNI + LM LOTUS ARCHI
═══════════════════════════════════════════════════════ */
function renderS4(ubs, lotus) {
  const body = document.getElementById('s4Body');
  if (!body) return;
  const len = Math.max(ubs.length, lotus.length);
  body.innerHTML = '';
  for (let i = 0; i < len; i++) {
    const u = ubs[i]   || {};
    const l = lotus[i] || {};
    const row = document.createElement('div');
    row.className = 's4-row';
    row.style.animationDelay = i * 0.035 + 's';
    row.innerHTML = `
      <div class="s4-val">${esc(u.gram || '—')}</div>
      <div class="s4-val">${esc(u.jual  || u.harga_jual   || '—')}</div>
      <div class="s4-val">${esc(u.terima|| u.harga_terima || '—')}</div>
      <div class="s4-val">${esc(l.gram || '—')}</div>
      <div class="s4-val">${esc(l.jual  || l.harga_jual   || '—')}</div>
      <div class="s4-val">${esc(l.terima|| l.harga_terima || '—')}</div>`;
    body.appendChild(row);
  }
  flash(body);
}

/* ═══════════════════════════════════════════════════════
   LOAD ALL DATA
═══════════════════════════════════════════════════════ */
async function loadAll() {
  setStatus('loading', 'Memuat data…');
  document.getElementById('btnRefresh').classList.add('spinning');

  try {
    let d1, d2, d3, d4, d5, d6;

    if (CONFIG.DEMO_MODE) {
      await new Promise(r => setTimeout(r, 280));

      d1 = buildDaftar1();
      d2 = buildHargaEmas();
      d3 = ANTAM_2026;
      d4 = ANTAM_UNDER;
      d5 = LOTUS;
      d6 = UBS;

    } else {
      /* ── Google Sheets via Apps Script ── */
      const url = CONFIG.GAS_URL;
      const [rCfg, r1, r2, r3, r4, r5, r6] = await Promise.all([
        fetch(`${url}?action=cokim`, { cache: 'no-store' }),
        fetch(`${url}?sheet=1`,      { cache: 'no-store' }),
        fetch(`${url}?sheet=2`,      { cache: 'no-store' }),
        fetch(`${url}?sheet=3`,      { cache: 'no-store' }),
        fetch(`${url}?sheet=4`,      { cache: 'no-store' }),
        fetch(`${url}?sheet=5`,      { cache: 'no-store' }),
        fetch(`${url}?sheet=6`,      { cache: 'no-store' }),
      ]);

      const cfg = await rCfg.json();
      if (cfg && cfg.cokim1 != null) {
        COKIM.cokim1 = Number(cfg.cokim1) || COKIM.cokim1;
        COKIM.cokim2 = Number(cfg.cokim2) || COKIM.cokim2;
        COKIM.cokim3 = Number(cfg.cokim3) || COKIM.cokim3;
      }

      [d1, d2, d3, d4, d5, d6] = await Promise.all([
        r1.json(), r2.json(), r3.json(), r4.json(), r5.json(), r6.json()
      ]);
    }

    renderCokimBar();
    renderDaftar1(d1);
    renderHargaEmas(d2);
    renderS3(d3, d4);
    renderS4(d6, d5);

    setStatus('online', CONFIG.DEMO_MODE ? 'Demo Mode' : 'Online');

  } catch (err) {
    console.error('loadAll error:', err);
    setStatus('error', 'Gagal mengambil data');
  } finally {
    document.getElementById('btnRefresh').classList.remove('spinning');
  }
}

document.getElementById('btnRefresh').addEventListener('click', loadAll);

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
loadAll();
setInterval(loadAll, CONFIG.REFRESH_INTERVAL);
startProgress();
