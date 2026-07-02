/* =========================================================
   PANTES GOLD & JEWELRY — script.js  v6.0
   ─────────────────────────────────────────────────────────
   PERUBAHAN UTAMA DARI v5.1:
   1. Tab "Harga Emas" (KADAR_D2) sekarang mengambil HARGA
      MENTAH langsung dari Sheets (low / high, buyback low /
      high) — tidak lagi dihitung dari rumus COKIM×pct.
      Format "Rp" & pemisah ribuan sepenuhnya ditangani di JS
      (rp() / fmtRp()) — di Sheets cukup isi ANGKA POLOS.
   2. Sheet baru "UBS_LAMA" ditambahkan di posisi sheet ke-6,
      sehingga UBS, KADAR_D1, KADAR_D2 otomatis bergeser +1.
   3. Tab "Harga Emas": maksimal 7 baris per tab. Lebih dari
      itu → otomatis dibuatkan tab baru (desain sama). Kalau
      cuma ada 1 baris data pun, tabel tetap digambar 7 baris
      (baris kosong) supaya tampilan tetap rapi.
   4. Tab "Logam Mulia" (Antam 2026/Under & UBS/UBS Lama/
      Lotus): maksimal 9 baris per tab, dengan aturan
      pemecahan tab & padding baris yang sama seperti di atas.
   5. Auto-refresh DIMATIKAN. Data hanya dimuat 1x saat
      halaman dibuka. Tombol refresh manual tetap ada, tapi
      jika koneksi putus saat refresh manual, data terakhir
      yang sudah tampil TETAP ditampilkan (tidak hilang/error).
   ╔══════════════════════════════════════════════════════╗
   ║        EDIT NILAI COKIM DI SINI (berlaku demo)      ║
   ║  COKIM 1 → legacy (sudah tidak dipakai tab Harga     ║
   ║            Emas, disisakan utk referensi/cokim bar)  ║
   ║  COKIM 2 → patokan Harga Terima Daftar 1 (6K–18K)  ║
   ║  COKIM 3 → cadangan / referensi                     ║
   ╚══════════════════════════════════════════════════════╝ */
/**
 * rp(n) — helper format Rupiah untuk data manual
 * ------------------------------------------------
 * Tulis angka TANPA titik dan TANPA "Rp" → rp() yang format otomatis.
 *
 *   rp(955000)     →  "Rp 955.000"
 *   rp(1872000)    →  "Rp 1.872.000"
 *   rp(184100000)  →  "Rp 184.100.000"
 *
 * Cara update data: cukup ubah angkanya, titik dan "Rp" muncul sendiri.
 */
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const COKIM = {
  cokim1: 1_820_000,   // legacy — lihat catatan di atas
  cokim2: 1_800_000,   // per gram — Daftar 1 Harga Terima 6K–18K
  cokim3: 1_750_000,   // cadangan
};
/* ─── KONFIGURASI KADAR — DAFTAR 1 (harga terima / harga beli perhiasan)
   Rumus: cokim2 × pct  →  FLOOR ke 500                    ─────────── */
const KADAR_D1 = [
  { kadar: '6K',  pct: 0.25 },
  { kadar: '7K',  pct: 0.25 },
  { kadar: '8K',  pct: 0.28 },
  { kadar: '9K',  pct: 0.32 },
  { kadar: '16K', pct: 0.70 },
  { kadar: '17K', pct: 0.73 },
  { kadar: '18K', pct: 0.78 },
];
/* ─── KADAR_D2 (Tab "Harga Emas") ───────────────────────────────────
   Sheet KADAR_D2 sekarang berisi HARGA MENTAH (bukan rumus %):
     kolom sheet : kadar | harga_low | harga_high | buyback_low | buyback_high
   Isi angka POLOS (tanpa titik, tanpa "Rp") — kosongkan sel yang
   tidak ada datanya (mis. cuma ada 1 harga → isi salah satu saja).
   Data di bawah ini HANYA fallback/demo kalau Sheets gagal dimuat. */
const KADAR_D2 = [
  { kadar: '6K',  harga_low: 610000,   harga_high: 673000,   buyback_low: 602000,   buyback_high: 602000   },
  { kadar: '7K',  harga_low: 728000,   harga_high: 728000,   buyback_low: 728000,   buyback_high: 728000   },
  { kadar: '8K',  harga_low: 819000,   harga_high: 873000,   buyback_low: 819000,   buyback_high: 873000   },
  { kadar: '9K',  harga_low: 891800,   harga_high: 946400,   buyback_low: 891800,   buyback_high: 946400   },
  { kadar: '16K', harga_low: 1392300,  harga_high: 1419600,  buyback_low: 1372800,  buyback_high: 1400100  },
  { kadar: '17K', harga_low: 1583400,  harga_high: 1583400,  buyback_low: 1563900,  buyback_high: 1563900  },
  { kadar: '18K', harga_low: 1601600,  harga_high: 1601600,  buyback_low: 1582100,  buyback_high: 1582100  },
];
/* ─── MANUAL: ANTAM 2026 ─────────────────────────────── */
/* Tulis angka mentah — rp() otomatis tambah "Rp" dan pemisah titik */
const ANTAM_2026 = [
  { gram: '0.5', jual: rp(955000),     terima: rp(830000)     },
  { gram: '1',   jual: rp(1872000),    terima: rp(1770000)    },
  { gram: '2',   jual: rp(3722000),    terima: rp(3520000)    },
  { gram: '5',   jual: rp(9260000),    terima: rp(8770000)    },
  { gram: '10',  jual: rp(18490000),   terima: rp(17510000)   },
  { gram: '25',  jual: rp(46125000),   terima: rp(43700000)   },
  { gram: '50',  jual: rp(92150000),   terima: rp(87250000)   },
  { gram: '100', jual: rp(184100000),  terima: rp(174400000)  },
];
/* ─── MANUAL: ANTAM UNDER 2026 ──────────────────────── */
const ANTAM_UNDER = [
  { gram: '0.5', jual: rp(940000),     terima: rp(815000)     },
  { gram: '1',   jual: rp(1845000),    terima: rp(1745000)    },
  { gram: '2',   jual: rp(3668000),    terima: rp(3468000)    },
  { gram: '5',   jual: rp(9120000),    terima: rp(8630000)    },
  { gram: '10',  jual: rp(18200000),   terima: rp(17220000)   },
  { gram: '25',  jual: rp(45400000),   terima: rp(43000000)   },
  { gram: '50',  jual: rp(90700000),   terima: rp(85900000)   },
  { gram: '100', jual: rp(181200000),  terima: rp(166060000)  },
];
/* ─── MANUAL: LOTUS ARCHI ───────────────────────────── */
const LOTUS = [
  { gram: '0.5', jual: rp(940000),     terima: rp(815000)     },
  { gram: '1',   jual: rp(1845000),    terima: rp(1745000)    },
  { gram: '2',   jual: rp(3668000),    terima: rp(3468000)    },
  { gram: '5',   jual: rp(9120000),    terima: rp(8630000)    },
  { gram: '10',  jual: rp(18200000),   terima: rp(17220000)   },
  { gram: '25',  jual: rp(45400000),   terima: rp(43000000)   },
  { gram: '50',  jual: rp(90700000),   terima: rp(85900000)   },
  { gram: '100', jual: rp(181200000),  terima: rp(166060000)  },
];
/* ─── MANUAL: UBS SNI (Baru) ────────────────────────── */
const UBS = [
  { gram: '0.5', jual: rp(920000),     terima: rp(800000)     },
  { gram: '1',   jual: rp(1820000),    terima: rp(1720000)    },
  { gram: '2',   jual: rp(3620000),    terima: rp(3420000)    },
  { gram: '3',   jual: rp(5420000),    terima: rp(5120000)    },
  { gram: '4',   jual: rp(7220000),    terima: rp(6820000)    },
  { gram: '5',   jual: rp(9020000),    terima: rp(8520000)    },
  { gram: '10',  jual: rp(17980000),   terima: rp(16980000)   },
  { gram: '25',  jual: rp(44850000),   terima: rp(42350000)   },
  { gram: '50',  jual: rp(89600000),   terima: rp(84600000)   },
  { gram: '100', jual: rp(179000000),  terima: rp(169000000)  },
];
/* ─── MANUAL: UBS LAMA (sheet baru, posisi sheet ke-6) ─ */
const UBS_LAMA = [
  { gram: '0.5', jual: rp(910000),     terima: rp(790000)     },
  { gram: '1',   jual: rp(1800000),    terima: rp(1700000)    },
  { gram: '2',   jual: rp(3580000),    terima: rp(3380000)    },
  { gram: '3',   jual: rp(5360000),    terima: rp(5060000)    },
  { gram: '4',   jual: rp(7140000),    terima: rp(6740000)    },
  { gram: '5',   jual: rp(8920000),    terima: rp(8420000)    },
  { gram: '10',  jual: rp(17780000),   terima: rp(16780000)   },
  { gram: '25',  jual: rp(44350000),   terima: rp(41850000)   },
  { gram: '50',  jual: rp(88600000),   terima: rp(83600000)   },
  { gram: '100', jual: rp(177000000),  terima: rp(167000000)  },
];
/* ═══════════════════════════════════════════════════════
   CONFIG
   ─────────────────────────────────────────────────────
   DEMO_MODE: true  → semua data dari konstanta di atas
   DEMO_MODE: false → semua data dari Google Sheets
   Cukup ubah DEMO_MODE dan isi GAS_URL setelah deploy.
   Auto-refresh DIMATIKAN (data dimuat 1x saat halaman dibuka).
═══════════════════════════════════════════════════════ */
const CONFIG = {
  SLIDE_DURATION: 15_000,      // ms antar slide (15 detik)
  DEMO_MODE: false,            // false = data live dari Google Sheets
  /* URL deployment Google Apps Script (Pantes Gold & Jewelry)
     PENTING: setiap kali Anda Deploy > New version, Apps Script BISA
     membuat URL /exec baru. Selalu cek URL terbaru di:
     Deploy > Manage Deployments > kolom "Web app" > salin URL itu
     ke baris GAS_URL di bawah ini. */
  GAS_URL: 'https://script.google.com/macros/s/AKfycbyrUKkAB300kR7odx_8EYWWSc6FmJafBIDWtXGAUzP-mTF4S6jmE10o_uDkRlaLaWN0/exec',
  /* Pemetaan sheet index (disesuaikan dengan urutan di Spreadsheet).
     UBS_LAMA baru disisipkan di posisi ke-6, jadi UBS/KADAR_D1/
     KADAR_D2 semua bergeser +1 dibanding versi sebelumnya. */
  SHEETS: {
    CONFIG:      'cokim', // ?action=cokim
    DAFTAR_1:    1,       // (hasil generate — tidak difetch langsung)
    HARGA_EMAS:  2,       // (hasil generate — tidak difetch langsung)
    ANTAM_2026:  3,
    ANTAM_UNDER: 4,
    LOTUS:       5,
    UBS_LAMA:    6,       // sheet baru
    UBS:         7,       // bergeser dari 6 -> 7
    KADAR_D1:    8,       // bergeser dari 7 -> 8
    KADAR_D2:    9,       // bergeser dari 8 -> 9
  },
  /* Batas baris per tab sebelum otomatis dipecah ke tab baru */
  PAGINATION: {
    HARGA_EMAS_MAX_ROWS:   7,
    LOGAM_MULIA_MAX_ROWS:  9,
  },
};
/* ═══════════════════════════════════════════════════════
   FORMULA ENGINE & FORMAT HELPERS
═══════════════════════════════════════════════════════ */
const ceil500  = v => Math.ceil(v  / 500) * 500;
const floor500 = v => Math.floor(v / 500) * 500;
const fmtRp    = v => 'Rp ' + Math.round(v).toLocaleString('id-ID');
/**
 * fmtRangeOrSingle(lo, hi) — dipakai tab "Harga Emas".
 * - lo & hi ada & beda   -> "Rp X - Rp Y"
 * - lo & hi ada & sama   -> "Rp X"
 * - cuma salah satu ada  -> tampilkan yang ada saja
 * - keduanya kosong      -> "-"
 */
function fmtRangeOrSingle(lo, hi) {
  const hasLo = typeof lo === 'number' && !isNaN(lo);
  const hasHi = typeof hi === 'number' && !isNaN(hi);
  if (hasLo && hasHi) return lo === hi ? fmtRp(lo) : `${fmtRp(lo)} – ${fmtRp(hi)}`;
  if (hasLo) return fmtRp(lo);
  if (hasHi) return fmtRp(hi);
  return '—';
}
/**
 * parseKadarD1(rows) — konversi baris JSON dari Sheets ke format KADAR_D1
 * Kolom Spreadsheet: kadar | pct
 */
function parseKadarD1(rows) {
  return rows.map(r => ({
    kadar: String(r.kadar).trim(),
    pct:   parseFloat(r.pct),
  })).filter(r => r.kadar && !isNaN(r.pct));
}
/**
 * parseKadarD2(rows) — konversi baris JSON dari Sheets (tab Harga Emas)
 * Kolom Spreadsheet: kadar | harga_low | harga_high | buyback_low | buyback_high
 * Semua kolom harga boleh dikosongkan (artinya data itu tidak ada).
 * Angka di Sheets ditulis POLOS — pemisah ribuan/"Rp" ditangani di JS.
 */
function parseKadarD2(rows) {
  const num = v => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(String(v).replace(/[^\d.-]/g, ''));
    return isNaN(n) ? null : n;
  };
  return rows.map(r => ({
    kadar:        String(r.kadar ?? r.KADAR ?? '').trim(),
    harga_low:    num(r.harga_low    ?? r.hargalow    ?? r['harga low']),
    harga_high:   num(r.harga_high   ?? r.hargahigh   ?? r['harga high']),
    buyback_low:  num(r.buyback_low  ?? r.buybacklow  ?? r['buyback low']),
    buyback_high: num(r.buyback_high ?? r.buybackhigh ?? r['buyback high']),
  })).filter(r => r.kadar);
}
/**
 * buildDaftar1(kadarList) — Harga Terima (harga beli perhiasan)
 * Rumus: cokim2 × pct → FLOOR ke 500
 */
function buildDaftar1(kadarList) {
  return (kadarList || KADAR_D1).map(({ kadar, pct }) => ({
    kadar,
    harga: fmtRp(floor500(COKIM.cokim2 * pct)),
  }));
}
/**
 * buildHargaEmas(kadarList) — Tab "Harga Emas"
 * Sekarang HANYA memformat harga mentah dari Sheets (low/high,
 * buyback low/high) — tidak ada lagi perhitungan dari COKIM.
 */
function buildHargaEmas(kadarList) {
  return (kadarList || KADAR_D2).map(({ kadar, harga_low, harga_high, buyback_low, buyback_high }) => ({
    kadar,
    harga_jual:   fmtRangeOrSingle(harga_low, harga_high),
    harga_terima: fmtRangeOrSingle(buyback_low, buyback_high),
  }));
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
   SLIDESHOW ENGINE (dinamis — jumlah slide bisa berubah
   setiap loadAll() karena pemecahan tab otomatis)
═══════════════════════════════════════════════════════ */
const progressBar   = document.getElementById('progressBar');
const slideDotsWrap = document.getElementById('slideDots');
const sw            = document.getElementById('slideshowWrap');

let slides      = [];
let dots        = [];
let TOTAL       = 0;
let currentIdx  = 0;
let paused      = false;
let progressRAF = null;
let progStart   = null;

/**
 * refreshSlideshow() — panggil setiap kali jumlah/isi slide berubah
 * (mis. sesudah render data baru). Membangun ulang daftar slide,
 * titik navigasi (dots), dan mempertahankan slide aktif jika masih ada.
 */
function refreshSlideshow() {
  const prevActiveEl = slides[currentIdx] || null;

  slides = Array.from(document.querySelectorAll('.slide'));
  TOTAL  = slides.length;

  const counts = {};
  slides.forEach(s => {
    const g = s.dataset.group || s.id || 'slide';
    counts[g] = (counts[g] || 0) + 1;
  });
  const seen = {};

  slideDotsWrap.innerHTML = '';
  slides.forEach((s, i) => {
    const g = s.dataset.group || s.id || 'slide';
    seen[g] = (seen[g] || 0) + 1;
    const label = s.dataset.label || `Slide ${i + 1}`;
    const title = counts[g] > 1 ? `${label} (${seen[g]}/${counts[g]})` : label;

    const b = document.createElement('button');
    b.className     = 'dot';
    b.dataset.slide = String(i);
    b.title = title;
    slideDotsWrap.appendChild(b);
  });
  dots = Array.from(slideDotsWrap.querySelectorAll('.dot'));
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    stopProgress();
    goTo(i, i > currentIdx ? 'next' : 'prev');
    if (!paused) startProgress();
  }));

  let newIdx = 0;
  if (prevActiveEl && slides.includes(prevActiveEl)) newIdx = slides.indexOf(prevActiveEl);

  slides.forEach((s, i) => {
    s.classList.remove('exit-left', 'exit-right');
    s.classList.toggle('active', i === newIdx);
  });
  dots.forEach((d, i) => d.classList.toggle('active', i === newIdx));
  currentIdx = newIdx;

  if (!paused) startProgress();
}

function goTo(idx, dir = 'next') {
  if (!TOTAL || idx === currentIdx) return;
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
  if (!TOTAL) return;
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
function flash(el) {
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** padRows(rows, size) — potong/tambal array supaya panjangnya == size
 *  (null = baris kosong, dipakai supaya tabel selalu terlihat penuh/rapi) */
function padRows(rows, size) {
  const out = (rows || []).slice(0, size);
  while (out.length < size) out.push(null);
  return out;
}
/** pageCountFor(length, maxRows) — jumlah tab yang dibutuhkan, minimal 1 */
function pageCountFor(length, maxRows) {
  return Math.max(1, Math.ceil(Math.max(length, 0) / maxRows));
}
/* ═══════════════════════════════════════════════════════
   RENDER — SLIDE 0: DAFTAR 1 (price cells) — TIDAK berubah
═══════════════════════════════════════════════════════ */
function renderDaftar1(rows) {
  const grid = document.getElementById('daftar1Grid');
  if (!grid) return;
  if (!rows || !rows.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;color:#fff;text-align:center;padding:30px">Tidak ada data</div>';
    return;
  }
  const left  = rows.filter((_, i) => i < 4);
  const right = rows.filter((_, i) => i >= 4);
  while (right.length < 4) right.push(null);
  grid.innerHTML = '';
  for (let r = 0; r < 4; r++) {
    const lRow = left[r]  || null;
    const rRow = right[r] || null;
    if (lRow) grid.appendChild(makeS1Cell(lRow, r));
    else      grid.appendChild(makeEmptyCell());
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
   RENDER (INTO) — fungsi render "polos" yang menggambar 1 halaman
   tabel ke dalam elemen tertentu. Dipakai oleh fungsi *Paginated()
   di bawah untuk setiap tab/halaman yang dibutuhkan.
═══════════════════════════════════════════════════════ */
function renderHargaEmasInto(tbody, rows, size) {
  if (!tbody) return;
  const padded = padRows(rows, size);
  tbody.innerHTML = '';
  padded.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.style.animationDelay = i * 0.04 + 's';
    if (!row) {
      tr.classList.add('row-empty');
      tr.innerHTML = '<td>\u00A0</td><td>\u00A0</td><td>\u00A0</td>';
      tbody.appendChild(tr);
      return;
    }
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
function renderS3Into(body, antam2026, antamUnder, size) {
  if (!body) return;
  const a = padRows(antam2026, size);
  const u = padRows(antamUnder, size);
  body.innerHTML = '';
  for (let i = 0; i < size; i++) {
    const ai = a[i], ui = u[i];
    const row = document.createElement('div');
    row.className = 's3-row' + ((!ai && !ui) ? ' row-empty' : '');
    row.style.animationDelay = i * 0.035 + 's';
    row.innerHTML = `
      <div class="s3-gram-val">${esc((ai && ai.gram) || (ui && ui.gram) || '\u00A0')}</div>
      <div class="s3-val">${esc((ai && (ai.jual   || ai.harga_jual))   || '\u00A0')}</div>
      <div class="s3-val">${esc((ai && (ai.terima || ai.harga_terima)) || '\u00A0')}</div>
      <div class="s3-val s3-val-green">${esc((ui && (ui.jual   || ui.harga_jual))   || '\u00A0')}</div>
      <div class="s3-val s3-val-green">${esc((ui && (ui.terima || ui.harga_terima)) || '\u00A0')}</div>`;
    body.appendChild(row);
  }
  flash(body);
}
function renderS4Into(body, ubs, ubslama, lotus, size) {
  if (!body) return;
  const u  = padRows(ubs, size);
  const ul = padRows(ubslama, size);
  const l  = padRows(lotus, size);
  body.innerHTML = '';
  for (let i = 0; i < size; i++) {
    const ui = u[i], uli = ul[i], li = l[i];
    const row = document.createElement('div');
    row.className = 's4-row' + ((!ui && !uli && !li) ? ' row-empty' : '');
    row.style.animationDelay = i * 0.035 + 's';
    row.innerHTML = `
      <div class="s4-val">${esc((ui && ui.gram) || '\u00A0')}</div>
      <div class="s4-val">${esc((ui && (ui.jual   || ui.harga_jual))   || '\u00A0')}</div>
      <div class="s4-val">${esc((ui && (ui.terima || ui.harga_terima)) || '\u00A0')}</div>
      <div class="s4-val">${esc((uli && uli.gram) || '\u00A0')}</div>
      <div class="s4-val">${esc((uli && (uli.jual   || uli.harga_jual))   || '\u00A0')}</div>
      <div class="s4-val">${esc((uli && (uli.terima || uli.harga_terima)) || '\u00A0')}</div>
      <div class="s4-val">${esc((li && li.gram) || '\u00A0')}</div>
      <div class="s4-val">${esc((li && (li.jual   || li.harga_jual))   || '\u00A0')}</div>
      <div class="s4-val">${esc((li && (li.terima || li.harga_terima)) || '\u00A0')}</div>`;
    body.appendChild(row);
  }
  flash(body);
}
/* ═══════════════════════════════════════════════════════
   PAGINASI TAB OTOMATIS
   ─────────────────────────────────────────────────────
   GROUPS memetakan setiap "grup" tab ke elemen template-nya
   di HTML (slide1 = Harga Emas, slide2 = LM Antam, slide3 =
   LM UBS/UBS Lama/Lotus). Kalau data melebihi batas baris,
   dibuatkan klon dari template tsb (desain identik) dan
   disisipkan tepat setelah slide sebelumnya supaya urutan
   slide tetap benar.
═══════════════════════════════════════════════════════ */
const GROUPS = {
  emas:  { templateId: 'slide1', maxRows: () => CONFIG.PAGINATION.HARGA_EMAS_MAX_ROWS  },
  antam: { templateId: 'slide2', maxRows: () => CONFIG.PAGINATION.LOGAM_MULIA_MAX_ROWS },
  ubs:   { templateId: 'slide3', maxRows: () => CONFIG.PAGINATION.LOGAM_MULIA_MAX_ROWS },
};
function ensureGroupPages(groupKey, pageCount) {
  const { templateId } = GROUPS[groupKey];
  const template = document.getElementById(templateId);
  if (!template) return [];
  // buang klon lama (jumlah data bisa berubah tiap refresh)
  document.querySelectorAll(`.slide-clone-${groupKey}`).forEach(el => el.remove());
  const pages = [template];
  let anchor = template;
  for (let i = 1; i < pageCount; i++) {
    const clone = template.cloneNode(true);
    clone.classList.add('slide-clone-' + groupKey);
    clone.classList.remove('active', 'exit-left', 'exit-right');
    clone.id = `${templateId}-p${i + 1}`;
    anchor.after(clone);
    anchor = clone;
    pages.push(clone);
  }
  return pages;
}
function renderHargaEmasPaginated(rows) {
  const maxRows = GROUPS.emas.maxRows();
  const pages   = ensureGroupPages('emas', pageCountFor(rows.length, maxRows));
  pages.forEach((el, i) => {
    const tbody = el.querySelector('tbody');
    const slice = rows.slice(i * maxRows, i * maxRows + maxRows);
    renderHargaEmasInto(tbody, slice, maxRows);
  });
}
function renderLmAntamPaginated(antam2026, antamUnder) {
  const maxRows  = GROUPS.antam.maxRows();
  const totalLen = Math.max(antam2026.length, antamUnder.length);
  const pages    = ensureGroupPages('antam', pageCountFor(totalLen, maxRows));
  pages.forEach((el, i) => {
    const body   = el.querySelector('.s3-body');
    const aSlice = antam2026.slice(i * maxRows, i * maxRows + maxRows);
    const uSlice = antamUnder.slice(i * maxRows, i * maxRows + maxRows);
    renderS3Into(body, aSlice, uSlice, maxRows);
  });
}
function renderLmUbsPaginated(ubs, ubslama, lotus) {
  const maxRows  = GROUPS.ubs.maxRows();
  const totalLen = Math.max(ubs.length, ubslama.length, lotus.length);
  const pages    = ensureGroupPages('ubs', pageCountFor(totalLen, maxRows));
  pages.forEach((el, i) => {
    const body    = el.querySelector('.s4-body');
    const uSlice  = ubs.slice(i * maxRows, i * maxRows + maxRows);
    const ulSlice = ubslama.slice(i * maxRows, i * maxRows + maxRows);
    const lSlice  = lotus.slice(i * maxRows, i * maxRows + maxRows);
    renderS4Into(body, uSlice, ulSlice, lSlice, maxRows);
  });
}
/* ═══════════════════════════════════════════════════════
   LOAD DATA (1x saja — auto-refresh dimatikan)
   ─────────────────────────────────────────────────────
   Promise.allSettled dipakai supaya 1 sheet gagal tidak
   menggagalkan semua data. `lastGood` menyimpan data REAL
   terakhir yang berhasil dimuat — kalau refresh manual gagal
   (mis. internet putus), data lama itu yang dipakai lagi
   (bukan data demo), jadi tampilan tidak pernah error/kosong.
═══════════════════════════════════════════════════════ */
async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} dari ${url}`);
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

let lastGood = null; // { cfg, raw1, raw2, raw3, raw7, raw4, rawKD1, rawKD2 }

async function loadAll() {
  setStatus('loading', 'Memuat data…');
  document.getElementById('btnRefresh').classList.add('spinning');

  try {
    if (CONFIG.DEMO_MODE) {
      await new Promise(r => setTimeout(r, 280));
      const d1 = buildDaftar1(KADAR_D1);
      const d2 = buildHargaEmas(KADAR_D2);
      const d3 = ANTAM_2026;
      const d4 = ANTAM_UNDER;
      const d5 = LOTUS;
      const d6 = UBS;
      const d7 = UBS_LAMA;

      renderCokimBar();
      renderDaftar1(d1);
      renderHargaEmasPaginated(d2);
      renderLmAntamPaginated(d3, d4);
      renderLmUbsPaginated(d6, d7, d5);
      refreshSlideshow();
      setStatus('online', 'Demo Mode');
      return;
    }

    const url = CONFIG.GAS_URL;

    const results = await Promise.allSettled([
      fetchJSON(`${url}?action=cokim`),                        // 0
      fetchJSON(`${url}?sheet=${CONFIG.SHEETS.ANTAM_2026}`),    // 1
      fetchJSON(`${url}?sheet=${CONFIG.SHEETS.ANTAM_UNDER}`),   // 2
      fetchJSON(`${url}?sheet=${CONFIG.SHEETS.LOTUS}`),         // 3
      fetchJSON(`${url}?sheet=${CONFIG.SHEETS.UBS_LAMA}`),      // 4  (sheet baru)
      fetchJSON(`${url}?sheet=${CONFIG.SHEETS.UBS}`),           // 5
      fetchJSON(`${url}?sheet=${CONFIG.SHEETS.KADAR_D1}`),      // 6
      fetchJSON(`${url}?sheet=${CONFIG.SHEETS.KADAR_D2}`),      // 7
    ]);

    const errors = [];
    const val = (i, fallback) => {
      if (results[i].status === 'fulfilled') return results[i].value;
      errors.push((results[i].reason && results[i].reason.message) || `Gagal mengambil data #${i}`);
      return fallback;
    };

    const cfg    = val(0, lastGood ? lastGood.cfg    : {});
    const raw1   = val(1, lastGood ? lastGood.raw1   : []); // ANTAM_2026
    const raw2   = val(2, lastGood ? lastGood.raw2   : []); // ANTAM_UNDER
    const raw3   = val(3, lastGood ? lastGood.raw3   : []); // LOTUS
    const raw7   = val(4, lastGood ? lastGood.raw7   : []); // UBS_LAMA
    const raw4   = val(5, lastGood ? lastGood.raw4   : []); // UBS
    const rawKD1 = val(6, lastGood ? lastGood.rawKD1 : []); // KADAR_D1
    const rawKD2 = val(7, lastGood ? lastGood.rawKD2 : []); // KADAR_D2

    if (cfg && cfg.cokim1 != null) {
      COKIM.cokim1 = Number(cfg.cokim1) || COKIM.cokim1;
      COKIM.cokim2 = Number(cfg.cokim2) || COKIM.cokim2;
      COKIM.cokim3 = Number(cfg.cokim3) || COKIM.cokim3;
    }

    const sheetKD1 = Array.isArray(rawKD1) && rawKD1.length ? parseKadarD1(rawKD1) : KADAR_D1;
    const sheetKD2 = Array.isArray(rawKD2) && rawKD2.length ? parseKadarD2(rawKD2) : KADAR_D2;

    const d1 = buildDaftar1(sheetKD1);
    const d2 = buildHargaEmas(sheetKD2);
    const d3 = Array.isArray(raw1) ? raw1 : ANTAM_2026;
    const d4 = Array.isArray(raw2) ? raw2 : ANTAM_UNDER;
    const d5 = Array.isArray(raw3) ? raw3 : LOTUS;
    const d6 = Array.isArray(raw4) ? raw4 : UBS;
    const d7 = Array.isArray(raw7) ? raw7 : UBS_LAMA;

    // simpan sebagai "data baik terakhir" — dipakai sbg fallback
    // kalau refresh manual berikutnya gagal (internet putus dll)
    lastGood = { cfg, raw1, raw2, raw3, raw7, raw4, rawKD1, rawKD2 };

    if (errors.length) {
      console.warn('Sebagian data gagal dimuat dari Sheets (data terakhir tetap dipakai):', errors);
    }

    renderCokimBar();
    renderDaftar1(d1);
    renderHargaEmasPaginated(d2);
    renderLmAntamPaginated(d3, d4);
    renderLmUbsPaginated(d6, d7, d5); // urutan tampil: UBS Baru, UBS Lama, Lotus
    refreshSlideshow();
    setStatus('online', errors.length ? 'Online (sebagian data terakhir)' : 'Online');
  } catch (err) {
    console.error('loadAll error:', err);
    setStatus('error', 'Gagal memuat data baru — menampilkan data terakhir');
  } finally {
    document.getElementById('btnRefresh').classList.remove('spinning');
  }
}
document.getElementById('btnRefresh').addEventListener('click', loadAll);
/* ═══════════════════════════════════════════════════════
   INIT — data dimuat 1x saja saat halaman dibuka.
   Auto-refresh (setInterval) sengaja DIHAPUS: kalau internet
   tiba-tiba putus, layar tetap menampilkan data yang sudah
   berhasil dimuat sebelumnya, tidak error/kosong.
═══════════════════════════════════════════════════════ */
refreshSlideshow();
loadAll();
