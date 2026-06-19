/**
 * =========================================================
 *  PANTES GOLD & JEWELRY — Google Apps Script  v2
 *  File: Code.gs
 *
 *  Cara deploy:
 *  1. Buka Google Spreadsheet Anda
 *  2. Extensions → Apps Script → paste kode ini
 *  3. Ganti SPREADSHEET_ID di bawah
 *  4. Deploy → New Deployment → Web App
 *     Execute as : Me
 *     Who has access : Anyone
 *  5. Salin URL → tempel ke CONFIG.GAS_URL di script.js
 *  6. Set DEMO_MODE: false di script.js
 * =========================================================
 *
 *  STRUKTUR SPREADSHEET (8 sheet, urutan penting):
 *  ─────────────────────────────────────────────────
 *  Sheet 1  →  ANTAM_2026      (gram | harga_jual | harga_terima)
 *  Sheet 2  →  ANTAM_UNDER     (gram | harga_jual | harga_terima)
 *  Sheet 3  →  LOTUS           (gram | harga_jual | harga_terima)
 *  Sheet 4  →  UBS_SNI         (gram | harga_jual | harga_terima)
 *  Sheet 5  →  (reserved)
 *  Sheet 6  →  (reserved)
 *  Sheet 7  →  KADAR_D1        (kadar | pct)
 *  Sheet 8  →  KADAR_D2        (kadar | pct_low | pct_high | high_kadar)
 *  Sheet CONFIG → tidak bernomor, diakses via ?action=cokim
 * =========================================================
 */

// ── GANTI dengan ID Spreadsheet Anda ──────────────────────
// URL Spreadsheet: https://docs.google.com/spreadsheets/d/[ID]/edit
const SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET_ANDA';
// ──────────────────────────────────────────────────────────

function doGet(e) {
  const action = e.parameter.action || '';
  const sheet  = parseInt(e.parameter.sheet || '0');

  let result;

  try {
    if (action === 'cokim') {
      result = getCokimValues();
    } else if (sheet >= 1 && sheet <= 8) {
      result = getSheetData(sheet - 1);   // 0-indexed
    } else {
      result = { error: 'Parameter tidak valid. Gunakan ?sheet=1..8 atau ?action=cokim' };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ─────────────────────────────────────────────────────────
   getCokimValues()
   Ambil COKIM dari sheet bernama "CONFIG"

   Format sheet CONFIG:
     A1: cokim1   B1: 1820000
     A2: cokim2   B2: 1800000
     A3: cokim3   B3: 1750000
───────────────────────────────────────────────────────── */
function getCokimValues() {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('CONFIG');
  if (!sheet) return { error: 'Sheet CONFIG tidak ditemukan' };

  const data  = sheet.getRange('A1:B3').getValues();
  const cokim = {};
  data.forEach(row => {
    const key = String(row[0]).trim().toLowerCase();
    if (key) cokim[key] = Number(row[1]);
  });
  return cokim;
  // Returns: { cokim1: 1820000, cokim2: 1800000, cokim3: 1750000 }
}

/* ─────────────────────────────────────────────────────────
   getSheetData(index)
   Ambil semua data dari sheet berdasarkan urutan (0-indexed)
   Baris pertama = header kolom, baris berikutnya = data

   Sheet 0 (sheet=1) → ANTAM_2026    : gram | harga_jual | harga_terima
   Sheet 1 (sheet=2) → ANTAM_UNDER   : gram | harga_jual | harga_terima
   Sheet 2 (sheet=3) → LOTUS         : gram | harga_jual | harga_terima
   Sheet 3 (sheet=4) → UBS_SNI       : gram | harga_jual | harga_terima
   Sheet 4 (sheet=5) → (reserved)
   Sheet 5 (sheet=6) → (reserved)
   Sheet 6 (sheet=7) → KADAR_D1      : kadar | pct
   Sheet 7 (sheet=8) → KADAR_D2      : kadar | pct_low | pct_high | high_kadar
───────────────────────────────────────────────────────── */
function getSheetData(sheetIndex) {
  const ss     = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();

  if (sheetIndex >= sheets.length) {
    return { error: `Sheet index ${sheetIndex} tidak ada (total: ${sheets.length})` };
  }

  const sheet   = sheets[sheetIndex];
  const data    = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g, '_'));

  return data.slice(1)
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const val = row[i];
        // Konversi tipe data otomatis
        if (val === true || String(val).toUpperCase() === 'TRUE')       obj[h] = true;
        else if (val === false || String(val).toUpperCase() === 'FALSE') obj[h] = false;
        else if (typeof val === 'number')                                obj[h] = val;
        else                                                             obj[h] = String(val).trim();
      });
      return obj;
    });
}

/**
 * ═══════════════════════════════════════════════════════
 * FORMAT DATA SPREADSHEET LENGKAP
 * ═══════════════════════════════════════════════════════
 *
 * Sheet "CONFIG" (nama sheet, bukan nomor):
 * ┌──────────┬──────────┐
 * │ A        │ B        │
 * ├──────────┼──────────┤
 * │ cokim1   │ 1820000  │
 * │ cokim2   │ 1800000  │
 * │ cokim3   │ 1750000  │
 * └──────────┴──────────┘
 *
 * Sheet 1 — ANTAM_2026 / Sheet 2 — ANTAM_UNDER
 * Sheet 3 — LOTUS      / Sheet 4 — UBS_SNI
 * ┌──────┬─────────────┬──────────────┐
 * │ gram │ harga_jual  │ harga_terima │
 * ├──────┼─────────────┼──────────────┤
 * │ 0.5  │ Rp 955.000  │ Rp 830.000   │
 * │ 1    │ Rp 1.872.000│ Rp 1.770.000 │
 * │ 2    │ Rp 3.722.000│ Rp 3.520.000 │
 * │ 5    │ ...         │ ...          │
 * └──────┴─────────────┴──────────────┘
 * Catatan: isi dengan string "Rp x.xxx.xxx" atau angka
 *          (jika angka, website akan format otomatis)
 *
 * Sheet 7 — KADAR_D1 (persentase untuk Daftar 1)
 * ┌───────┬──────┐
 * │ kadar │ pct  │
 * ├───────┼──────┤
 * │ 6K    │ 0.25 │
 * │ 7K    │ 0.25 │
 * │ 8K    │ 0.28 │
 * │ 9K    │ 0.32 │
 * │ 16K   │ 0.70 │
 * │ 17K   │ 0.73 │
 * │ 18K   │ 0.78 │
 * └───────┴──────┘
 *
 * Sheet 8 — KADAR_D2 (persentase untuk Daftar 2 / Harga Emas)
 * ┌───────┬─────────┬──────────┬────────────┐
 * │ kadar │ pct_low │ pct_high │ high_kadar │
 * ├───────┼─────────┼──────────┼────────────┤
 * │ 6K    │ 0.335   │ 0.370    │ FALSE      │
 * │ 7K    │ 0.400   │ 0.400    │ FALSE      │
 * │ 8K    │ 0.450   │ 0.480    │ FALSE      │
 * │ 9K    │ 0.490   │ 0.520    │ FALSE      │
 * │ 16K   │ 0.765   │ 0.780    │ TRUE       │
 * │ 17K   │ 0.870   │ 0.870    │ TRUE       │
 * │ 18K   │ 0.880   │ 0.880    │ TRUE       │
 * └───────┴─────────┴──────────┴────────────┘
 *
 * Catatan penting:
 * - Kolom high_kadar: isi TRUE untuk 16K ke atas, FALSE untuk 6K–9K
 * - Jika pct_low = pct_high → harga tampil tunggal
 * - Jika pct_low ≠ pct_high → harga tampil sebagai range "Rp X – Rp Y"
 * - Semua persentase dalam bentuk desimal (0.25 = 25%)
 * ═══════════════════════════════════════════════════════
 */
