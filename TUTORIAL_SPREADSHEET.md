# Tutorial Koneksi Google Spreadsheet → Website Pantes Gold

---

## BAGIAN 1 — STRUKTUR DATABASE SPREADSHEET

### Buat 1 file Google Spreadsheet dengan 7 sheet:

| No | Nama Sheet | Digunakan untuk |
|----|------------|-----------------|
| 1  | `CONFIG`   | Nilai COKIM (patokan harga) |
| 2  | `DAFTAR_1` | Harga Terima Perhiasan (Slide 1) |
| 3  | `HARGA_EMAS` | Harga Jual & Terima Perhiasan per Kadar (Slide 2) |
| 4  | `ANTAM_2026` | LM Antam Certieye Redmark 2026 (Slide 3) |
| 5  | `ANTAM_UNDER` | LM Antam Certieye Redmark Under 2026 (Slide 3) |
| 6  | `LOTUS` | LM Lotus Archi (Slide 3 & 4) |
| 7  | `UBS_SNI` | LM UBS SNI Baru (Slide 4) |

---

## BAGIAN 2 — FORMAT TIAP SHEET

### Sheet 1: CONFIG
> Baris 1 = header (A1, B1), baris 2–4 = data

| A | B |
|---|---|
| **cokim1** | 1820000 |
| **cokim2** | 1800000 |
| **cokim3** | 1750000 |

---

### Sheet 2: DAFTAR_1
> Baris 1 = header, baris 2 dst = data

| kadar | harga_beli |
|-------|------------|
| 6K | 450000 |
| 7K | 450000 |
| 8K | 504000 |
| 9K | 576000 |
| 16K | 1260000 |
| 17K | 1314000 |
| 18K | 1404000 |

> **Catatan:** Jika DEMO_MODE = true, kolom ini diabaikan dan dihitung dari COKIM. Isi ini hanya untuk mode Online.

---

### Sheet 3: HARGA_EMAS

| kadar | harga_jual | harga_terima |
|-------|------------|--------------|
| 6K | 607000 – 673000 | 609500 – 672500 |
| 7K | 728000 | 728000 |
| 8K | 819000 – 874000 | 819000 – 873000 |
| 9K | 892000 – 947000 | 891500 – 945500 |
| 16K | 1393000 – 1420000 | 1373500 – 1400500 |
| 17K | 1583000 | 1564000 |
| 18K | 1602000 | 1582500 |

> **Catatan:** Jika DEMO_MODE = true, dihitung otomatis dari COKIM 1 menggunakan rumus di script.js.

---

### Sheet 4: ANTAM_2026

| gram | harga_jual | harga_terima |
|------|------------|--------------|
| 0.5 | Rp 955.000 | Rp 830.000 |
| 1 | Rp 1.872.000 | Rp 1.770.000 |
| 2 | Rp 3.722.000 | Rp 3.520.000 |
| 5 | Rp 9.260.000 | Rp 8.770.000 |
| 10 | Rp 18.490.000 | Rp 17.510.000 |
| 25 | Rp 46.125.000 | Rp 43.700.000 |
| 50 | Rp 92.150.000 | Rp 87.250.000 |
| 100 | Rp 184.100.000 | Rp 174.400.000 |

---

### Sheet 5: ANTAM_UNDER (format sama dengan ANTAM_2026)

| gram | harga_jual | harga_terima |
|------|------------|--------------|
| 0.5 | Rp 940.000 | Rp 815.000 |
| 1 | Rp 1.845.000 | Rp 1.745.000 |
| ... | ... | ... |

---

### Sheet 6: LOTUS (format sama)

| gram | harga_jual | harga_terima |
|------|------------|--------------|
| 0.5 | Rp 940.000 | Rp 815.000 |
| 1 | Rp 1.845.000 | Rp 1.745.000 |
| ... | ... | ... |

---

### Sheet 7: UBS_SNI

| gram | harga_jual | harga_terima |
|------|------------|--------------|
| 0.5 | Rp 920.000 | Rp 800.000 |
| 1 | Rp 1.820.000 | Rp 1.720.000 |
| 2 | Rp 3.620.000 | Rp 3.420.000 |
| 3 | Rp 5.420.000 | Rp 5.120.000 |
| 4 | Rp 7.220.000 | Rp 6.820.000 |
| 5 | Rp 9.020.000 | Rp 8.520.000 |
| 10 | Rp 17.980.000 | Rp 16.980.000 |
| 25 | Rp 44.850.000 | Rp 42.350.000 |
| 50 | Rp 89.600.000 | Rp 84.600.000 |
| 100 | Rp 179.000.000 | Rp 169.000.000 |

---

## BAGIAN 3 — MEMBUAT GOOGLE APPS SCRIPT

### Langkah-langkah:

**1. Buka Spreadsheet Anda**
   - Klik menu **Extensions → Apps Script**

**2. Hapus kode default, paste kode berikut:**

```javascript
// ================================================
// PANTES GOLD — Google Apps Script  (Code.gs)
// ================================================

const SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET_ANDA';

// Peta nama sheet
const SHEET_MAP = {
  '1': 'DAFTAR_1',
  '2': 'HARGA_EMAS',
  '3': 'ANTAM_2026',
  '4': 'ANTAM_UNDER',
  '5': 'LOTUS',
  '6': 'UBS_SNI',
};

function doGet(e) {
  const action = e.parameter.action || '';
  const sheet  = e.parameter.sheet  || '';
  let result;

  if (action === 'cokim') {
    result = getCokimValues();
  } else if (SHEET_MAP[sheet]) {
    result = getSheetData(SHEET_MAP[sheet]);
  } else {
    result = { error: 'Parameter tidak valid. Gunakan ?sheet=1..6 atau ?action=cokim' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getCokimValues() {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('CONFIG');
    if (!sheet) return { error: 'Sheet CONFIG tidak ditemukan' };
    const data  = sheet.getRange('A1:B3').getValues();
    const cokim = {};
    data.forEach(row => {
      const key = String(row[0]).trim().toLowerCase();
      if (key) cokim[key] = Number(row[1]);
    });
    return cokim;   // { cokim1: 1820000, cokim2: 1800000, cokim3: 1750000 }
  } catch (err) {
    return { error: err.message };
  }
}

function getSheetData(sheetName) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { error: 'Sheet ' + sheetName + ' tidak ditemukan' };

    const data    = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0].map(h => String(h).trim());
    return data.slice(1)
      .filter(row => row.some(c => c !== '' && c !== null))
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i] != null ? String(row[i]) : ''; });
        return obj;
      });
  } catch (err) {
    return { error: err.message };
  }
}
```

---

## BAGIAN 4 — DEPLOY APPS SCRIPT

**3. Simpan file (Ctrl+S)**

**4. Klik Deploy → New Deployment**
   - Type: **Web App**
   - Description: `Pantes Harga API v1`
   - Execute as: **Me**
   - Who has access: **Anyone** ← wajib agar website bisa akses

**5. Klik Deploy → Authorize → Allow**

**6. Salin URL deployment** yang muncul:
   ```
   https://script.google.com/macros/s/AKfyc.../exec
   ```

---

## BAGIAN 5 — SAMBUNGKAN KE WEBSITE

**7. Buka `script.js`**, cari bagian CONFIG di paling atas:

```javascript
const CONFIG = {
  SLIDE_DURATION:   15_000,
  REFRESH_INTERVAL: 30_000,
  DEMO_MODE: true,            // ← UBAH KE false
  GAS_URL: 'https://script.google.com/macros/s/AKfycbyiyeDrNRhNGrv0Z895h1u0KDgbOFK1DlvAmXWbeZ_e5SdPl6UQNFF1__Nxq5xCM2j8/exec',  // ← PASTE URL DI SINI
};
```

Ubah menjadi:

```javascript
const CONFIG = {
  SLIDE_DURATION:   15_000,
  REFRESH_INTERVAL: 30_000,
  DEMO_MODE: false,           // ← false = pakai Google Sheets
  GAS_URL: 'https://script.google.com/macros/s/AKfyc.../exec',  // ← URL Anda
};
```

**8. Simpan `script.js`, refresh browser** — data akan otomatis diambil dari Spreadsheet.

---

## BAGIAN 6 — CARA KERJA ENDPOINT

| URL | Fungsi |
|-----|--------|
| `…/exec?action=cokim` | Ambil COKIM 1, 2, 3 dari sheet CONFIG |
| `…/exec?sheet=1` | Data DAFTAR_1 (slide 0) |
| `…/exec?sheet=2` | Data HARGA_EMAS (slide 1) |
| `…/exec?sheet=3` | Data ANTAM_2026 (slide 2 kiri) |
| `…/exec?sheet=4` | Data ANTAM_UNDER (slide 2 kanan) |
| `…/exec?sheet=5` | Data LOTUS (slide 3 kanan) |
| `…/exec?sheet=6` | Data UBS_SNI (slide 3 kiri) |

---

## BAGIAN 7 — CARA UPDATE HARGA

### Update COKIM (otomatis hitung semua harga perhiasan):
1. Buka Spreadsheet → Sheet **CONFIG**
2. Ubah nilai di kolom B (cokim1, cokim2, atau cokim3)
3. Website akan mengambil nilai baru saat refresh 30 detik berikutnya

### Update harga LM (Antam, Lotus, UBS):
1. Buka sheet yang sesuai (misal: **ANTAM_2026**)
2. Edit langsung nilai di kolom `harga_jual` atau `harga_terima`
3. Website update otomatis setiap 30 detik

### Update manual seketika:
- Klik tombol **Refresh** di pojok kanan atas website

---

## BAGIAN 8 — TIPS & TROUBLESHOOTING

| Masalah | Solusi |
|---------|--------|
| Data tidak muncul | Pastikan Apps Script sudah di-deploy ulang setelah edit kode |
| Error CORS | Pastikan "Who has access" = **Anyone** saat deploy |
| Status merah "Gagal" | Cek GAS_URL sudah benar dan DEMO_MODE = false |
| Harga tidak berubah | Cek nama kolom di sheet harus persis: `kadar`, `harga_jual`, `harga_terima`, `gram` |
| Deploy baru tidak jalan | Setelah edit Code.gs, selalu buat **New Deployment** (jangan update yang lama) |

---

## BAGIAN 9 — CARA MENDAPATKAN ID SPREADSHEET

URL Spreadsheet Anda:
```
https://docs.google.com/spreadsheets/d/[INI_ADALAH_ID_NYA]/edit
```

Salin bagian antara `/d/` dan `/edit` → itulah ID yang diisi di `SPREADSHEET_ID`.

