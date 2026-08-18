/* =========================================================
   PANTES GOLD & JEWELRY — customer.js  v2
   ---------------------------------------------------------
   Halaman berbagi harga ke customer — TIDAK ADA video, TIDAK ADA
   slideshow otomatis. Semua kategori harga ditampilkan sekaligus
   dalam kartu yang bisa di-scroll bebas oleh customer, dengan
   navigasi cepat (chip) untuk lompat ke kategori tertentu.

   PENTING: file ini BERGANTUNG pada:
   - config.js (dimuat SEBELUM file ini) → CONFIG, PAGE_META,
     COL_LABEL, DEMO_DATA, resolveMode(), esc(), fmtRp(),
     fetchJSONWithRetry(), validateAllPayload().
   - html2canvas (dimuat SEBELUM file ini, dari CDN) → dipakai
     untuk fitur "Unduh Gambar".
   ========================================================= */

let lastPages = {};
let lastCokim = { global: null, trimas: null };
let lastDateLabel = '';

/* ═══════════════════════════════════════════════════════
   RENDER — header cokim
═══════════════════════════════════════════════════════ */
function renderCustomerCokim(cokim) {
  const el = document.getElementById('csCokim');
  if (!el) return;
  const g = cokim && cokim.global != null ? fmtRp(cokim.global) : '—';
  const t = cokim && cokim.trimas != null ? fmtRp(cokim.trimas) : '—';
  el.innerHTML =
    `<span class="cs-pill"><b>PATOKAN GLOBAL</b> ${esc(g)}</span>` +
    `<span class="cs-pill"><b>PATOKAN TRIMAS</b> ${esc(t)}</span>`;
}

/* ═══════════════════════════════════════════════════════
   RENDER — quick nav chips (hanya untuk kategori yang punya data)
═══════════════════════════════════════════════════════ */
function buildQuickNav(pages) {
  const nav = document.getElementById('csQuickNav');
  if (!nav) return;
  nav.innerHTML = '';
  PAGE_META.forEach(meta => {
    const rows = Array.isArray(pages[meta.key]) ? pages[meta.key] : [];
    if (!rows.length) return;
    const chip = document.createElement('a');
    chip.href = '#sec-' + meta.key;
    chip.className = 'cs-chip ' + meta.accent;
    chip.textContent = meta.title;
    nav.appendChild(chip);
  });
}

/** Bangun HTML kartu-kartu tabel harga dari data pages. Dipakai BERSAMA oleh
    tampilan utama (#csMain) dan node ekspor gambar (lihat buildExportNode())
    — satu sumber logika supaya keduanya selalu konsisten, tidak ada risiko
    tampilan utama dan hasil gambar unduhan berbeda karena logika ganda. */
function buildPriceCardsHTML(pages, withIds) {
  let html = '';
  PAGE_META.forEach(meta => {
    const rows = Array.isArray(pages[meta.key]) ? pages[meta.key] : [];
    if (!rows.length) return;

    const theadCells = meta.cols.map(c => `<th>${esc(COL_LABEL[c] || c.toUpperCase())}</th>`).join('');
    const bodyRows = rows.map(row => {
      const cells = meta.cols.map(c => {
        const raw = row[c];
        const val = c === 'id' ? esc(String(raw ?? '—')) : fmtRp(raw);
        return `<td>${val}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    html += `
      <section class="cs-card ${meta.accent}"${withIds ? ` id="sec-${meta.key}"` : ''}>
        <h2 class="cs-card-title">${esc(meta.title)}</h2>
        <div class="cs-table-wrap">
          <table class="cs-table">
            <thead><tr>${theadCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </section>`;
  });
  return html;
}

/* ═══════════════════════════════════════════════════════
   RENDER — kartu tabel harga penuh (tanpa batas 10 baris,
   karena ini halaman scroll customer, bukan slide TV)
═══════════════════════════════════════════════════════ */
function renderCustomerTables(pages) {
  const main = document.getElementById('csMain');
  if (!main) return;
  const html = buildPriceCardsHTML(pages, true);
  main.innerHTML = html || '<p class="cs-empty">Belum ada data harga. Coba tekan Refresh, atau hubungi toko.</p>';
}

/* ═══════════════════════════════════════════════════════
   TOAST kecil (konfirmasi aksi)
═══════════════════════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('csToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ═══════════════════════════════════════════════════════
   SINKRONISASI TINGGI FOOTER — footer sticky isinya bisa berubah
   tinggi (jumlah kategori, ukuran layar, dsb), jadi diukur otomatis
   lewat ResizeObserver supaya konten di atasnya tidak pernah
   ketutupan/terpotong (pelajaran dari perbaikan topbar TV).
═══════════════════════════════════════════════════════ */
const csFooter = document.getElementById('csFooter');
function syncFooterHeight() {
  if (!csFooter) return;
  document.documentElement.style.setProperty('--cs-footer-h', csFooter.offsetHeight + 'px');
}
if (csFooter) {
  if (window.ResizeObserver) new ResizeObserver(syncFooterHeight).observe(csFooter);
  else window.addEventListener('resize', syncFooterHeight);
  syncFooterHeight();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncFooterHeight);
}

/* ═══════════════════════════════════════════════════════
   AKSI: Cetak
═══════════════════════════════════════════════════════ */
document.getElementById('csPrint').addEventListener('click', () => window.print());

/* ═══════════════════════════════════════════════════════
   AKSI: Bagikan — pakai Web Share API kalau tersedia (mobile,
   langsung buka pilihan WhatsApp/dll bawaan HP), fallback ke
   salin link, fallback lagi ke buka WhatsApp Web.
═══════════════════════════════════════════════════════ */
document.getElementById('csShare').addEventListener('click', async () => {
  const url = window.location.href;
  const text = 'Cek daftar harga emas & perhiasan terbaru Pantes Gold & Jewelry:';
  if (navigator.share) {
    try { await navigator.share({ title: 'Daftar Harga — Pantes Gold & Jewelry', text, url }); }
    catch (e) { /* pengguna membatalkan share sheet — tidak perlu ditangani */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    showToast('Link berhasil disalin ✓');
  } catch (e) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank', 'noopener,noreferrer');
  }
});

/* ═══════════════════════════════════════════════════════
   AKSI: Unduh Gambar — merender kartu harga (di luar layar,
   TANPA elemen sticky/fixed seperti quicknav/footer supaya hasil
   gambar rapi) lalu mengonversinya jadi file PNG lewat html2canvas.
═══════════════════════════════════════════════════════ */
function buildExportNode() {
  const wrap = document.createElement('div');
  // Ditaruh di luar area pandang (bukan display:none, supaya tetap
  // punya ukuran nyata dan bisa dirender html2canvas dengan benar).
  wrap.style.cssText = 'position:absolute; left:-10000px; top:0; width:720px; background:#f7efdc; font-family:Montserrat,Segoe UI,sans-serif;';

  const g = lastCokim && lastCokim.global != null ? fmtRp(lastCokim.global) : '—';
  const t = lastCokim && lastCokim.trimas != null ? fmtRp(lastCokim.trimas) : '—';

  wrap.innerHTML = `
    <div style="background:linear-gradient(160deg,#241206 0%,#3b1f0a 55%,#241206 100%); padding:28px 26px 24px; text-align:center;">
      <p style="margin:0 0 4px; font-size:12px; letter-spacing:3px; text-transform:uppercase; color:#f0c862; font-weight:700;">Pantes Gold &amp; Jewelry</p>
      <h1 style="margin:0 0 6px; font-family:'Playfair Display',Georgia,serif; font-style:italic; font-weight:800; font-size:34px; color:#fff;">Daftar Harga Hari Ini</h1>
      <p style="margin:0 0 16px; font-size:13px; color:#f0c862;">${esc(lastDateLabel)}</p>
      <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
        <span style="background:rgba(255,255,255,.06); border:1px solid rgba(240,200,98,.28); border-radius:20px; padding:6px 16px; font-size:12px; color:#fdf3da;"><b style="color:#f0c862;">GLOBAL</b> ${esc(g)}</span>
        <span style="background:rgba(255,255,255,.06); border:1px solid rgba(240,200,98,.28); border-radius:20px; padding:6px 16px; font-size:12px; color:#fdf3da;"><b style="color:#f0c862;">TRIMAS</b> ${esc(t)}</span>
      </div>
    </div>
    <div style="padding:20px 18px;">${buildPriceCardsHTML(lastPages, false)}</div>
    <div style="text-align:center; padding:4px 18px 22px; font-size:11px; color:#5c3d1f; opacity:.7;">
      Pantes Gold &amp; Jewelry — Jl. AH. Nasution No.219, Pasirjati, Ujung Berung, Bandung · harga sewaktu-waktu dapat berubah
    </div>`;
  return wrap;
}

document.getElementById('csDownload').addEventListener('click', async () => {
  if (typeof html2canvas !== 'function') {
    showToast('Fitur unduh gambar belum siap, coba lagi sebentar…');
    return;
  }
  const btn = document.getElementById('csDownload');
  btn.classList.add('is-loading');
  showToast('Menyiapkan gambar…');
  const node = buildExportNode();
  document.body.appendChild(node);
  try {
    const canvas = await html2canvas(node, { backgroundColor: '#f7efdc', scale: 2, useCORS: true, logging: false });
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    link.download = `harga-pantesgold-${stamp}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Gambar berhasil diunduh ✓');
  } catch (err) {
    console.error('Gagal membuat gambar:', err);
    showToast('Gagal membuat gambar: ' + err.message);
  } finally {
    document.body.removeChild(node);
    btn.classList.remove('is-loading');
  }
});

/* ═══════════════════════════════════════════════════════
   LOAD DATA — sekali saat halaman dibuka + tombol Refresh manual
   (konsisten dengan prinsip TV signage: tidak ada auto-polling)
═══════════════════════════════════════════════════════ */
async function loadCustomer() {
  const updatedEl = document.getElementById('csUpdated');
  updatedEl.textContent = 'Memuat data…';
  const { mode, reason } = resolveMode();

  try {
    let data;
    if (mode === 'demo') {
      await new Promise(r => setTimeout(r, 200));
      data = DEMO_DATA;
    } else {
      data = validateAllPayload(await fetchJSONWithRetry(`${CONFIG.GAS_URL}?action=all`, CONFIG.FETCH_TIMEOUT));
    }

    lastPages = data.pages || {};
    lastCokim = data.cokim || { global: null, trimas: null };

    renderCustomerCokim(lastCokim);
    buildQuickNav(lastPages);
    renderCustomerTables(lastPages);

    const now = new Date();
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const tgl = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    lastDateLabel = tgl;
    document.getElementById('csDate').textContent = tgl;
    updatedEl.textContent = (mode === 'demo' ? '🔵 Demo Mode — ' : '') + `Update terakhir: ${jam}`;
  } catch (err) {
    console.error('loadCustomer error:', err);
    updatedEl.textContent = 'Gagal memuat data terbaru — menampilkan data contoh. (' + err.message + ')';
    lastPages = DEMO_DATA.pages;
    lastCokim = DEMO_DATA.cokim;
    renderCustomerCokim(lastCokim);
    buildQuickNav(lastPages);
    renderCustomerTables(lastPages);
    lastDateLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('csDate').textContent = lastDateLabel;
  } finally {
    syncFooterHeight(); // konten footer bisa berubah tinggi (mis. pesan error lebih panjang)
  }
}
document.getElementById('csRefresh').addEventListener('click', loadCustomer);

loadCustomer();
