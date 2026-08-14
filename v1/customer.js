/* =========================================================
   PANTES GOLD & JEWELRY — customer.js
   ---------------------------------------------------------
   Halaman berbagi harga ke customer — TIDAK ADA video, TIDAK ADA
   slideshow otomatis. Semua kategori harga ditampilkan sekaligus
   dalam kartu yang bisa di-scroll bebas oleh customer, dengan
   navigasi cepat (chip) untuk lompat ke kategori tertentu.

   PENTING: file ini BERGANTUNG pada config.js yang harus dimuat
   LEBIH DULU di customer.html (CONFIG, PAGE_META, COL_LABEL,
   DEMO_DATA, resolveMode(), esc(), fmtRp(), fetchJSON(),
   validateAllPayload()).
   ========================================================= */

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

/* ═══════════════════════════════════════════════════════
   RENDER — kartu tabel harga penuh (tanpa batas 10 baris,
   karena ini halaman scroll customer, bukan slide TV)
═══════════════════════════════════════════════════════ */
function renderCustomerTables(pages) {
  const main = document.getElementById('csMain');
  if (!main) return;
  main.innerHTML = '';
  let any = false;

  PAGE_META.forEach(meta => {
    const rows = Array.isArray(pages[meta.key]) ? pages[meta.key] : [];
    if (!rows.length) return;
    any = true;

    const theadCells = meta.cols.map(c => `<th>${esc(COL_LABEL[c] || c.toUpperCase())}</th>`).join('');
    const bodyRows = rows.map(row => {
      const cells = meta.cols.map(c => {
        const raw = row[c];
        const val = c === 'id' ? esc(String(raw ?? '—')) : fmtRp(raw);
        return `<td>${val}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const section = document.createElement('section');
    section.className = 'cs-card ' + meta.accent;
    section.id = 'sec-' + meta.key;
    section.innerHTML = `
      <h2 class="cs-card-title">${esc(meta.title)}</h2>
      <div class="cs-table-wrap">
        <table class="cs-table">
          <thead><tr>${theadCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
    main.appendChild(section);
  });

  if (!any) main.innerHTML = '<p class="cs-empty">Belum ada data harga. Coba tekan Refresh, atau hubungi toko.</p>';
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
      data = validateAllPayload(await fetchJSON(`${CONFIG.GAS_URL}?action=all`, CONFIG.FETCH_TIMEOUT));
    }

    renderCustomerCokim(data.cokim);
    buildQuickNav(data.pages || {});
    renderCustomerTables(data.pages || {});

    const now = new Date();
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const tgl = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('csDate').textContent = tgl;
    updatedEl.textContent = (mode === 'demo' ? '🔵 Demo Mode — ' : '') + `Update terakhir: ${jam}`;
  } catch (err) {
    console.error('loadCustomer error:', err);
    updatedEl.textContent = 'Gagal memuat data terbaru — menampilkan data contoh. (' + err.message + ')';
    renderCustomerCokim(DEMO_DATA.cokim);
    buildQuickNav(DEMO_DATA.pages);
    renderCustomerTables(DEMO_DATA.pages);
    document.getElementById('csDate').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}
document.getElementById('csRefresh').addEventListener('click', loadCustomer);

loadCustomer();
