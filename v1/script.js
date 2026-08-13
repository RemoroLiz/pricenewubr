/* =========================================================
   PANTES GOLD & JEWELRY — script.js  v6 (Data-driven + Video)
   ---------------------------------------------------------
   PRINSIP DESAIN:
   - 1 sheet Spreadsheet = 1 "page" website (tidak ada lagi 1 page
     yang menggabungkan 2 sheet).
   - Semua data (harga + cokim + video) diambil SEKALI saat load
     (?action=all). TIDAK ADA auto-refresh/polling — hanya tombol
     Refresh manual yang memanggil ulang data.
   - Tiap page dipecah otomatis maksimal 10 baris/slide. Jika data
     > 10 baris, dibuat slide lanjutan dengan judul yang sama +
     penanda halaman, mis. "EMASKU (2/3)".
   - Panel video berjalan independen (autoplay + loop, playlist),
     TIDAK ikut reset saat tabel harga bergeser slide.
   ========================================================= */

/* ═══════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════ */
const CONFIG = {
  SLIDE_DURATION: 12_000,     // ms per slide tabel harga
  ROWS_PER_PAGE:  10,         // maksimum baris per slide (wajib sesuai requirement)
  DEMO_MODE:      true,       // true = pakai data contoh lokal; false = ambil dari Google Sheets
  /* URL deployment Google Apps Script (Web App /exec).
     PENTING: setiap kali Deploy > New version, Apps Script BISA
     membuat URL /exec baru — selalu perbarui baris ini. */
  GAS_URL: 'https://script.google.com/macros/s/GANTI_DENGAN_URL_DEPLOYMENT_ANDA/exec',
};

/* Urutan & judul page (harus selaras dengan SHEET_PAGES di Code.gs) */
const PAGE_META = [
  { key: 'NOTA_LUAR',   title: 'HARGA NOTA LUAR',                      cols: ['id', 'harga_terima'], accent: 'accent-gold'  },
  { key: 'HARGA_EMAS',  title: 'HARGA EMAS PERHIASAN',                 cols: ['id', 'jual', 'beli'],  accent: 'accent-brown' },
  { key: 'ANTAM_2026',  title: 'LM ANTAM CERTIEYE REDMARK 2026',       cols: ['id', 'jual', 'beli'],  accent: 'accent-gold'  },
  { key: 'ANTAM_UNDER', title: 'LM ANTAM CERTIEYE REDMARK UNDER 2026', cols: ['id', 'jual', 'beli'],  accent: 'accent-green' },
  { key: 'ARCHI',       title: 'LM LOTUS ARCHI',                       cols: ['id', 'jual', 'beli'],  accent: 'accent-red'   },
  { key: 'UBS_NEW',     title: 'LM UBS SNI (BARU)',                    cols: ['id', 'jual', 'beli'],  accent: 'accent-blue'  },
  { key: 'EMASKU',      title: 'EMASKU',                               cols: ['id', 'jual', 'beli'],  accent: 'accent-gold'  },
];
const COL_LABEL = { id: 'KADAR / GRAM', harga_terima: 'HARGA TERIMA', jual: 'HARGA JUAL', beli: 'HARGA BELI' };

/* ═══════════════════════════════════════════════════════
   DATA CONTOH (dipakai hanya jika DEMO_MODE = true)
═══════════════════════════════════════════════════════ */
const DEMO_DATA = {
  cokim: { global: 1820000, trimas: 1800000 },
  videos: [],
  pages: {
    NOTA_LUAR: [
      { id: '6K',  harga_terima: 450000 }, { id: '7K',  harga_terima: 450000 },
      { id: '8K',  harga_terima: 504000 }, { id: '9K',  harga_terima: 576000 },
      { id: '16K', harga_terima: 1260000 }, { id: '17K', harga_terima: 1314000 },
      { id: '18K', harga_terima: 1404000 },
    ],
    HARGA_EMAS: [
      { id: '6K',  jual: 673000,  beli: 609500 }, { id: '7K',  jual: 728000,  beli: 728000 },
      { id: '8K',  jual: 874000,  beli: 819000 }, { id: '9K',  jual: 947000,  beli: 891500 },
      { id: '16K', jual: 1420000, beli: 1373500 }, { id: '17K', jual: 1583000, beli: 1564000 },
      { id: '18K', jual: 1602000, beli: 1582500 },
    ],
    ANTAM_2026: [
      { id: '0.5', jual: 955000, beli: 830000 }, { id: '1', jual: 1872000, beli: 1770000 },
      { id: '2', jual: 3722000, beli: 3520000 }, { id: '5', jual: 9260000, beli: 8770000 },
      { id: '10', jual: 18490000, beli: 17510000 }, { id: '25', jual: 46125000, beli: 43700000 },
      { id: '50', jual: 92150000, beli: 87250000 }, { id: '100', jual: 184100000, beli: 174400000 },
    ],
    ANTAM_UNDER: [
      { id: '0.5', jual: 940000, beli: 815000 }, { id: '1', jual: 1845000, beli: 1745000 },
      { id: '2', jual: 3668000, beli: 3468000 }, { id: '5', jual: 9120000, beli: 8630000 },
      { id: '10', jual: 18200000, beli: 17220000 }, { id: '25', jual: 45400000, beli: 43000000 },
      { id: '50', jual: 90700000, beli: 85900000 }, { id: '100', jual: 181200000, beli: 166060000 },
    ],
    ARCHI: [
      { id: '0.5', jual: 940000, beli: 815000 }, { id: '1', jual: 1845000, beli: 1745000 },
      { id: '2', jual: 3668000, beli: 3468000 }, { id: '5', jual: 9120000, beli: 8630000 },
    ],
    UBS_NEW: [
      { id: '0.5', jual: 920000, beli: 800000 }, { id: '1', jual: 1820000, beli: 1720000 },
      { id: '2', jual: 3620000, beli: 3420000 }, { id: '5', jual: 9020000, beli: 8520000 },
    ],
    EMASKU: [
      { id: '1', jual: 1850000, beli: 1750000 }, { id: '2', jual: 3670000, beli: 3470000 },
    ],
  },
};

/* ═══════════════════════════════════════════════════════
   HELPERS UMUM
═══════════════════════════════════════════════════════ */
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtRp = v => {
  if (v === '' || v === null || v === undefined) return '—';
  const n = Number(v);
  return isNaN(n) ? esc(String(v)) : 'Rp ' + n.toLocaleString('id-ID');
};
/** Bagi array jadi beberapa chunk maksimal `size` item */
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
/** Validasi ketat ID media (Drive file ID / YouTube video ID) — pertahanan
    berlapis di sisi klien meski server (Code.gs) sudah memvalidasi juga. */
const isValidDriveFileId   = id => /^[a-zA-Z0-9_-]{10,}$/.test(String(id || ''));
const isValidYoutubeId     = id => /^[a-zA-Z0-9_-]{11}$/.test(String(id || ''));
const isValidMediaId = v => v.platform === 'youtube' ? isValidYoutubeId(v.fileId) : isValidDriveFileId(v.fileId);

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

/* ═══════════════════════════════════════════════════════
   BUILD SLIDES — pecah tiap page jadi slide-slide (max 10 baris)
═══════════════════════════════════════════════════════ */
function buildTableSlides(pages) {
  const slides = [];
  PAGE_META.forEach(meta => {
    const rows = Array.isArray(pages[meta.key]) ? pages[meta.key] : [];
    if (!rows.length) return;
    const parts = chunk(rows, CONFIG.ROWS_PER_PAGE);
    parts.forEach((part, i) => {
      slides.push({
        type: 'table',
        key: meta.key,
        title: parts.length > 1 ? `${meta.title} (${i + 1}/${parts.length})` : meta.title,
        cols: meta.cols,
        accent: meta.accent,
        rows: part,
      });
    });
  });
  return slides;
}

/* ═══════════════════════════════════════════════════════
   RENDER — Topbar cokim & clock
═══════════════════════════════════════════════════════ */
function renderCokimBar(cokim) {
  const el = document.getElementById('cokimBar');
  if (!el) return;
  const g = cokim && cokim.global != null ? fmtRp(cokim.global) : '—';
  const t = cokim && cokim.trimas != null ? fmtRp(cokim.trimas) : '—';
  el.innerHTML =
    `<span class="ck-label">GLOBAL</span><span class="ck-val">${esc(g)}</span>` +
    `<span class="ck-sep">·</span>` +
    `<span class="ck-label">TRIMAS</span><span class="ck-val">${esc(t)}</span>`;
}
const pad = n => String(n).padStart(2, '0');
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById('date').textContent  = `${pad(now.getDate())} / ${pad(now.getMonth() + 1)} / ${now.getFullYear()}`;
}
setInterval(updateClock, 1000);
updateClock();

function setStatus(state, text) {
  document.getElementById('statusDot').className = 'sdot ' + state;
  document.getElementById('statusText').textContent = text;
}

/* ═══════════════════════════════════════════════════════
   RENDER — Slide tabel (dipakai untuk SEMUA page harga)
═══════════════════════════════════════════════════════ */
function renderTableSlide(slide, index) {
  const el = document.createElement('div');
  el.className = 'slide';
  el.dataset.index = index;

  const theadCells = slide.cols.map(c => `<th>${esc(COL_LABEL[c] || c.toUpperCase())}</th>`).join('');
  const bodyRows = slide.rows.map((row, i) => {
    const cells = slide.cols.map(c => {
      const raw = row[c];
      const val = c === 'id' ? esc(String(raw ?? '—')) : fmtRp(raw);
      return `<td>${val}</td>`;
    }).join('');
    return `<tr style="animation-delay:${(i * 0.04).toFixed(2)}s">${cells}</tr>`;
  }).join('');

  el.innerHTML = `
    <div class="page-bg ${slide.accent}">
      <div class="slide-header">
        <div class="sh-brand"><img src="assets/pantesputih.png" class="brand-logo-img" alt="Pantes Logo"/></div>
        <div class="sh-center"><span class="sh-title">${esc(slide.title)}</span></div>
        <div class="sh-trimas"><img src="assets/trimas_putih.png" class="trimas-logo-img" alt="Trimas"/></div>
      </div>
      <div class="table-wrap">
        <table class="price-table">
          <thead><tr>${theadCells}</tr></thead>
          <tbody>${bodyRows || `<tr><td colspan="${slide.cols.length}" class="td-empty">Tidak ada data</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;
  return el;
}

/* ═══════════════════════════════════════════════════════
   VIDEO PANEL — playlist independen, autoplay + loop
   Video TIDAK dibuat ulang saat tabel berganti slide, sehingga
   pemutaran tidak pernah terputus oleh transisi slideshow tabel.
═══════════════════════════════════════════════════════ */
const VideoPanel = (() => {
  let list = [];
  let idx = 0;
  let rotateTimer = null;

  function driveStreamSrc(fileId)  { return `https://drive.google.com/uc?export=download&id=${fileId}`; }
  function drivePreviewSrc(fileId) { return `https://drive.google.com/file/d/${fileId}/preview`; }
  function youtubeEmbedSrc(id, loopSingle) {
    // autoplay=1 + mute=1 wajib agar autoplay diizinkan browser tanpa interaksi user.
    // controls=0, modestbranding=1, rel=0, iv_load_policy=3 → tampilan bersih utk signage.
    // loop=1&playlist=ID → trik resmi YouTube agar 1 video looping terus-menerus.
    const base = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1` +
      `&rel=0&iv_load_policy=3&playsinline=1&fs=0&disablekb=1`;
    return loopSingle ? `${base}&loop=1&playlist=${id}` : base;
  }

  function mount(videos) {
    stopRotate();
    list = (videos || []).filter(v => v.platform && isValidMediaId(v));
    const panel = document.getElementById('videoPanel');
    if (!panel) return;
    if (!list.length) { panel.classList.add('empty'); panel.innerHTML = ''; return; }
    panel.classList.remove('empty');
    idx = 0;
    playCurrent(panel);
  }

  function playCurrent(panel) {
    stopRotate();
    const v = list[idx];
    if (!v) return;

    if (v.platform === 'youtube') {
      panel.innerHTML = `
        <div class="video-frame">
          <iframe id="signageVideoFrame" src="${youtubeEmbedSrc(v.fileId, list.length <= 1)}"
            allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin allow-presentation"
            referrerpolicy="no-referrer" frameborder="0"></iframe>
          <div class="video-caption">${esc(v.judul)}</div>
        </div>`;
      // YouTube iframe tanpa IFrame API tidak mengirim event 'ended' ke halaman kita,
      // jadi playlist multi-video dirotasi berdasarkan durasi (kolom F sheet VIDEO).
      if (list.length > 1) rotateTimer = setTimeout(next, v.durasi * 1000);
      return;
    }

    // platform === 'drive'
    panel.innerHTML = `
      <div class="video-frame">
        <video id="signageVideo" autoplay muted playsinline ${list.length <= 1 ? 'loop' : ''}></video>
        <div class="video-caption">${esc(v.judul)}</div>
      </div>`;
    const videoEl = document.getElementById('signageVideo');
    const source = document.createElement('source');
    source.src = driveStreamSrc(v.fileId);
    source.type = 'video/mp4';
    videoEl.appendChild(source);

    videoEl.addEventListener('ended', next, { once: true });
    videoEl.addEventListener('error', () => fallbackToIframe(panel, v), { once: true });
    videoEl.play().catch(() => { /* autoplay diblokir browser: biarkan diam, tetap muted+loop siap */ });
  }

  function fallbackToIframe(panel, v) {
    // Jika pemutaran langsung Drive gagal (mis. file besar / izin berbeda),
    // gunakan Google Drive preview embed sebagai cadangan.
    panel.innerHTML = `
      <div class="video-frame">
        <iframe id="signageVideoFrame" src="${drivePreviewSrc(v.fileId)}"
          allow="autoplay" sandbox="allow-scripts allow-same-origin allow-presentation"
          referrerpolicy="no-referrer" frameborder="0"></iframe>
        <div class="video-caption">${esc(v.judul)}</div>
      </div>`;
    if (list.length > 1) rotateTimer = setTimeout(next, v.durasi * 1000);
  }

  function stopRotate() { if (rotateTimer) { clearTimeout(rotateTimer); rotateTimer = null; } }

  function next() {
    if (!list.length) return;
    idx = (idx + 1) % list.length;
    const panel = document.getElementById('videoPanel');
    if (panel) playCurrent(panel);
  }

  return { mount };
})();

/* ═══════════════════════════════════════════════════════
   SLIDESHOW ENGINE (tabel harga saja — video tidak ikut)
═══════════════════════════════════════════════════════ */
let slides = [];
let currentIdx = 0;
let paused = false;
let progressRAF = null;
let progStart = null;
const progressBar = document.getElementById('progressBar');

function renderSlideshow(tableSlides) {
  const wrap = document.getElementById('slideshowWrap');
  const dotsWrap = document.getElementById('slideDots');
  wrap.innerHTML = '';
  dotsWrap.innerHTML = '';
  slides = tableSlides;

  if (!slides.length) {
    wrap.innerHTML = '<div class="empty-state">Belum ada data harga. Cek Spreadsheet / klik Refresh.</div>';
    return;
  }

  slides.forEach((s, i) => {
    const el = renderTableSlide(s, i);
    if (i === 0) el.classList.add('active');
    wrap.appendChild(el);

    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.title = s.title;
    dot.addEventListener('click', () => { stopProgress(); goTo(i, i > currentIdx ? 'next' : 'prev'); if (!paused) startProgress(); });
    dotsWrap.appendChild(dot);
  });

  currentIdx = 0;
  startProgress();
}

function goTo(idx, dir = 'next') {
  const dots = Array.from(document.querySelectorAll('.dot'));
  const nodes = Array.from(document.querySelectorAll('#slideshowWrap .slide'));
  if (!nodes.length || idx === currentIdx) return;
  const prev = currentIdx;
  currentIdx = ((idx % nodes.length) + nodes.length) % nodes.length;
  nodes[prev].classList.remove('active');
  nodes[prev].classList.add(dir === 'next' ? 'exit-left' : 'exit-right');
  setTimeout(() => nodes[prev].classList.remove('exit-left', 'exit-right'), 700);
  nodes[currentIdx].classList.add('active');
  dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));
}
const nextSlide = () => goTo(currentIdx + 1, 'next');
const prevSlide = () => goTo(currentIdx - 1, 'prev');

function startProgress() {
  cancelAnimationFrame(progressRAF);
  if (!slides.length) return;
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';
  progStart = performance.now();
  function tick(now) {
    const pct = Math.min(((now - progStart) / CONFIG.SLIDE_DURATION) * 100, 100);
    progressBar.style.width = pct + '%';
    if (pct < 100) {
      progressRAF = requestAnimationFrame(tick);
    } else {
      nextSlide();
      progStart = performance.now();
      progressRAF = requestAnimationFrame(tick);
    }
  }
  progressRAF = requestAnimationFrame(tick);
}
const stopProgress = () => cancelAnimationFrame(progressRAF);
function togglePause() {
  paused = !paused;
  const btn = document.getElementById('btnPause');
  if (paused) { stopProgress(); btn.textContent = '▶'; btn.title = 'Lanjutkan'; }
  else { startProgress(); btn.innerHTML = '&#9646;&#9646;'; btn.title = 'Pause'; }
}
document.getElementById('btnNext').addEventListener('click', () => { stopProgress(); nextSlide(); if (!paused) startProgress(); });
document.getElementById('btnPrev').addEventListener('click', () => { stopProgress(); prevSlide(); if (!paused) startProgress(); });
document.getElementById('btnPause').addEventListener('click', togglePause);
document.addEventListener('keydown', e => {
  if (['ArrowRight', 'ArrowDown'].includes(e.key)) { stopProgress(); nextSlide(); if (!paused) startProgress(); }
  if (['ArrowLeft', 'ArrowUp'].includes(e.key))   { stopProgress(); prevSlide(); if (!paused) startProgress(); }
  if (e.key === ' ') { e.preventDefault(); togglePause(); }
});
let touchX = 0;
const sw = document.getElementById('slideshowWrap');
sw.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
sw.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) { stopProgress(); dx < 0 ? nextSlide() : prevSlide(); if (!paused) startProgress(); }
});

/* ═══════════════════════════════════════════════════════
   LOAD DATA — HANYA dipanggil saat load awal & klik Refresh manual
   (tidak ada setInterval polling, sesuai permintaan)
═══════════════════════════════════════════════════════ */
async function loadAll() {
  setStatus('loading', 'Memuat data…');
  document.getElementById('btnRefresh').classList.add('spinning');
  try {
    let data;
    if (CONFIG.DEMO_MODE) {
      await new Promise(r => setTimeout(r, 250));
      data = DEMO_DATA;
    } else {
      data = await fetchJSON(`${CONFIG.GAS_URL}?action=all`);
    }

    renderCokimBar(data.cokim);
    renderSlideshow(buildTableSlides(data.pages || {}));
    VideoPanel.mount(data.videos || []);

    setStatus('online', CONFIG.DEMO_MODE ? 'Demo Mode' : 'Online — data dimuat sekali saat halaman dibuka');
  } catch (err) {
    console.error('loadAll error:', err);
    setStatus('error', 'Gagal memuat data: ' + err.message);
  } finally {
    document.getElementById('btnRefresh').classList.remove('spinning');
  }
}
document.getElementById('btnRefresh').addEventListener('click', loadAll);

/* ═══════════════════════════════════════════════════════
   INIT — load sekali, TIDAK ADA auto-refresh/polling
═══════════════════════════════════════════════════════ */
loadAll();
