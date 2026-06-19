/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      PANTES GOLD & JEWELRY — Setup.gs                       ║
 * ║      Jalankan sekali untuk membuat semua sheet otomatis      ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  Cara pakai:                                                 ║
 * ║  1. Buka Google Spreadsheet (kosong/baru)                    ║
 * ║  2. Extensions → Apps Script                                 ║
 * ║  3. Buat file baru: Setup.gs, paste kode ini                 ║
 * ║  4. Pilih fungsi: setupAllSheets                             ║
 * ║  5. Klik ▶ Run                                               ║
 * ║  6. Selesai — semua sheet, header, dan data default dibuat   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/* ═══════════════════════════════════════════════════════════════
   WARNA BRAND PANTES GOLD (sama dengan tampilan website)
═══════════════════════════════════════════════════════════════ */
const C = {
  BROWN_DARK:  '#3b1f0a',   // header gelap
  BROWN_MID:   '#5c2d0e',   // header mid
  GOLD:        '#c9991a',   // border emas
  GOLD_LIGHT:  '#e8b84b',   // emas terang
  GOLD_SHINE:  '#f5d470',   // emas berkilau
  GOLD_PALE:   '#fef8ee',   // latar baris genap
  RED_LOTUS:   '#c0242b',   // header Lotus
  BLUE_UBS:    '#1f4e9e',   // header UBS
  GREEN_ANTAM: '#1a7a3c',   // teks Antam Under
  WHITE:       '#ffffff',
  LIGHT_GRAY:  '#f5f5f5',
};

/* ═══════════════════════════════════════════════════════════════
   FUNGSI UTAMA — panggil ini dari menu Run
═══════════════════════════════════════════════════════════════ */
function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('Asia/Jakarta');

  SpreadsheetApp.getUi().showSidebar(
    HtmlService.createHtmlOutput('<p style="font-family:sans-serif;padding:10px">⏳ Membuat semua sheet...</p>')
      .setTitle('Setup Pantes Gold')
  );

  try {
    // Hapus semua sheet kecuali sheet pertama (tidak bisa hapus semua)
    const existing = ss.getSheets();
    // Buat sheet sementara agar bisa hapus semua yang lain
    const temp = ss.insertSheet('__TEMP__');

    // Hapus semua sheet asli
    existing.forEach(sh => {
      try { ss.deleteSheet(sh); } catch(e) {}
    });

    // Buat semua sheet dalam urutan yang benar
    _setupCONFIG(ss);
    _setupANTAM_2026(ss);
    _setupANTAM_UNDER(ss);
    _setupLOTUS(ss);
    _setupUBS_SNI(ss);
    _setupRESERVED(ss, 'RESERVED_5');
    _setupRESERVED(ss, 'RESERVED_6');
    _setupKADAR_D1(ss);
    _setupKADAR_D2(ss);

    // Hapus sheet sementara
    try { ss.deleteSheet(ss.getSheetByName('__TEMP__')); } catch(e) {}

    // Aktifkan sheet CONFIG
    ss.setActiveSheet(ss.getSheetByName('CONFIG'));

    SpreadsheetApp.getUi().alert(
      '✅ Setup Selesai!',
      'Semua 9 sheet berhasil dibuat:\n\n' +
      '  CONFIG\n' +
      '  1. ANTAM_2026\n' +
      '  2. ANTAM_UNDER\n' +
      '  3. LOTUS\n' +
      '  4. UBS_SNI\n' +
      '  5. RESERVED_5\n' +
      '  6. RESERVED_6\n' +
      '  7. KADAR_D1\n' +
      '  8. KADAR_D2\n\n' +
      'Anda bisa langsung edit data di setiap sheet.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch(err) {
    SpreadsheetApp.getUi().alert('❌ Error: ' + err.message);
  }
}

/* ─── Tambahkan menu di toolbar saat file dibuka ─── */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏅 Pantes Gold Setup')
    .addItem('▶ Buat Semua Sheet Otomatis', 'setupAllSheets')
    .addSeparator()
    .addItem('🔄 Reset Sheet CONFIG', '_setupCONFIG_active')
    .addItem('🔄 Reset Sheet KADAR_D1', '_setupKADAR_D1_active')
    .addItem('🔄 Reset Sheet KADAR_D2', '_setupKADAR_D2_active')
    .addToUi();
}

/* Wrapper fungsi reset individual (dipakai dari menu) */
function _setupCONFIG_active()   { _setupCONFIG(SpreadsheetApp.getActiveSpreadsheet(),   true); }
function _setupKADAR_D1_active() { _setupKADAR_D1(SpreadsheetApp.getActiveSpreadsheet(), true); }
function _setupKADAR_D2_active() { _setupKADAR_D2(SpreadsheetApp.getActiveSpreadsheet(), true); }

/* ═══════════════════════════════════════════════════════════════
   HELPERS UMUM
═══════════════════════════════════════════════════════════════ */

/** Ambil/buat sheet dengan nama tertentu. reset=true → hapus isi lama */
function _getOrCreate(ss, name, reset) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (reset) sh.clearContents();
  sh.clearFormats();
  return sh;
}

/** Format header row: background gelap, teks terang, bold, border emas */
function _headerRow(sheet, row, cols, bgColor, textColor) {
  const range = sheet.getRange(row, 1, 1, cols);
  range.setBackground(bgColor || C.BROWN_DARK)
       .setFontColor(textColor || C.GOLD_SHINE)
       .setFontWeight('bold')
       .setFontSize(11)
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle')
       .setBorder(true, true, true, true, true, true,
                  C.GOLD_LIGHT, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.setRowHeight(row, 36);
}

/** Format data rows dengan warna selang-seling */
function _dataRows(sheet, startRow, numRows, numCols) {
  for (let r = 0; r < numRows; r++) {
    const rowIdx = startRow + r;
    const range  = sheet.getRange(rowIdx, 1, 1, numCols);
    range.setBackground(r % 2 === 0 ? C.WHITE : C.GOLD_PALE)
         .setFontSize(11)
         .setHorizontalAlignment('center')
         .setVerticalAlignment('middle')
         .setBorder(true, true, true, true, true, true,
                    C.GOLD + '88', SpreadsheetApp.BorderStyle.SOLID);
    sheet.setRowHeight(rowIdx, 32);
  }
}

/** Bungkus seluruh tabel dengan border tebal emas */
function _tableBorder(sheet, startRow, numRows, numCols) {
  sheet.getRange(startRow, 1, numRows, numCols)
       .setBorder(true, true, true, true, null, null,
                  C.GOLD, SpreadsheetApp.BorderStyle.SOLID_THICK);
}

/** Beku baris pertama agar header tetap terlihat saat scroll */
function _freezeHeader(sheet) {
  sheet.setFrozenRows(1);
}

/** Tambahkan catatan/komentar ke sel */
function _note(sheet, row, col, text) {
  sheet.getRange(row, col).setNote(text);
}

/* ═══════════════════════════════════════════════════════════════
   SHEET: CONFIG
   Berisi nilai COKIM 1, 2, 3
═══════════════════════════════════════════════════════════════ */
function _setupCONFIG(ss, reset) {
  const sh = _getOrCreate(ss, 'CONFIG', reset);
  sh.setTabColor(C.GOLD);

  // ── Header kolom ──
  sh.getRange('A1:B1').setValues([['PARAMETER', 'NILAI']]);
  _headerRow(sh, 1, 2, C.BROWN_DARK, C.GOLD_SHINE);
  sh.setColumnWidth(1, 160);
  sh.setColumnWidth(2, 200);

  // ── Data COKIM ──
  const data = [
    ['cokim1', 1820000],
    ['cokim2', 1800000],
    ['cokim3', 1750000],
  ];
  sh.getRange('A2:B4').setValues(data);
  _dataRows(sh, 2, 3, 2);
  _tableBorder(sh, 1, 4, 2);
  _freezeHeader(sh);

  // ── Format kolom NILAI sebagai angka ──
  sh.getRange('B2:B4').setNumberFormat('#,##0');

  // ── Catatan deskriptif ──
  _note(sh, 2, 1, 'COKIM 1 — Patokan harga jual emas Daftar 2 (per gram)');
  _note(sh, 3, 1, 'COKIM 2 — Patokan harga terima/beli perhiasan Daftar 1 (per gram)');
  _note(sh, 4, 1, 'COKIM 3 — Nilai cadangan / referensi tambahan');
  _note(sh, 2, 2, 'Ubah angka ini → semua harga dihitung ulang otomatis di website');

  // ── Tambahkan penjelasan di kolom D ──
  sh.getRange('D1').setValue('CARA PAKAI').setFontWeight('bold').setFontColor(C.BROWN_MID);
  sh.getRange('D2').setValue('Ubah nilai di kolom B');
  sh.getRange('D3').setValue('Website auto-update tiap 30 detik');
  sh.getRange('D4').setValue('COKIM 1 > COKIM 2 (jual > beli)');
  sh.setColumnWidth(4, 260);
}

/* ═══════════════════════════════════════════════════════════════
   HELPER: setup sheet LM (ANTAM/LOTUS/UBS) — struktur sama
═══════════════════════════════════════════════════════════════ */
function _setupLMSheet(ss, name, hdrBg, hdrFg, defaultData, reset) {
  const sh = _getOrCreate(ss, name, reset);
  sh.setTabColor(hdrBg);

  // ── Header ──
  sh.getRange('A1:C1').setValues([['gram', 'harga_jual', 'harga_terima']]);
  _headerRow(sh, 1, 3, hdrBg, hdrFg);
  sh.setColumnWidth(1, 80);
  sh.setColumnWidth(2, 200);
  sh.setColumnWidth(3, 200);

  // ── Data default ──
  sh.getRange(2, 1, defaultData.length, 3).setValues(defaultData);
  _dataRows(sh, 2, defaultData.length, 3);
  _tableBorder(sh, 1, defaultData.length + 1, 3);
  _freezeHeader(sh);

  // ── Catatan header ──
  _note(sh, 1, 1, 'Berat dalam gram');
  _note(sh, 1, 2, 'Harga jual ke customer (format: Rp x.xxx.xxx)');
  _note(sh, 1, 3, 'Harga terima dari customer (buyback)');

  // ── Kolom gram rata kiri, harga rata kanan ──
  sh.getRange(2, 1, defaultData.length, 1).setHorizontalAlignment('center');
  sh.getRange(2, 2, defaultData.length, 2).setHorizontalAlignment('center');
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 1: ANTAM_2026
═══════════════════════════════════════════════════════════════ */
function _setupANTAM_2026(ss, reset) {
  _setupLMSheet(ss, 'ANTAM_2026', C.BROWN_MID, C.GOLD_SHINE, [
    ['0.5', 'Rp 955.000',     'Rp 830.000'    ],
    ['1',   'Rp 1.872.000',   'Rp 1.770.000'  ],
    ['2',   'Rp 3.722.000',   'Rp 3.520.000'  ],
    ['5',   'Rp 9.260.000',   'Rp 8.770.000'  ],
    ['10',  'Rp 18.490.000',  'Rp 17.510.000' ],
    ['25',  'Rp 46.125.000',  'Rp 43.700.000' ],
    ['50',  'Rp 92.150.000',  'Rp 87.250.000' ],
    ['100', 'Rp 184.100.000', 'Rp 174.400.000'],
  ], reset);
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 2: ANTAM_UNDER
═══════════════════════════════════════════════════════════════ */
function _setupANTAM_UNDER(ss, reset) {
  _setupLMSheet(ss, 'ANTAM_UNDER', C.BROWN_MID, C.GREEN_ANTAM, [
    ['0.5', 'Rp 940.000',     'Rp 815.000'    ],
    ['1',   'Rp 1.845.000',   'Rp 1.745.000'  ],
    ['2',   'Rp 3.668.000',   'Rp 3.468.000'  ],
    ['5',   'Rp 9.120.000',   'Rp 8.630.000'  ],
    ['10',  'Rp 18.200.000',  'Rp 17.220.000' ],
    ['25',  'Rp 45.400.000',  'Rp 43.000.000' ],
    ['50',  'Rp 90.700.000',  'Rp 85.900.000' ],
    ['100', 'Rp 181.200.000', 'Rp 166.060.000'],
  ], reset);
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 3: LOTUS
═══════════════════════════════════════════════════════════════ */
function _setupLOTUS(ss, reset) {
  _setupLMSheet(ss, 'LOTUS', C.RED_LOTUS, C.WHITE, [
    ['0.5', 'Rp 940.000',     'Rp 815.000'    ],
    ['1',   'Rp 1.845.000',   'Rp 1.745.000'  ],
    ['2',   'Rp 3.668.000',   'Rp 3.468.000'  ],
    ['5',   'Rp 9.120.000',   'Rp 8.630.000'  ],
    ['10',  'Rp 18.200.000',  'Rp 17.220.000' ],
    ['25',  'Rp 45.400.000',  'Rp 43.000.000' ],
    ['50',  'Rp 90.700.000',  'Rp 85.900.000' ],
    ['100', 'Rp 181.200.000', 'Rp 166.060.000'],
  ], reset);
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 4: UBS_SNI
═══════════════════════════════════════════════════════════════ */
function _setupUBS_SNI(ss, reset) {
  _setupLMSheet(ss, 'UBS_SNI', C.BLUE_UBS, C.WHITE, [
    ['0.5', 'Rp 920.000',     'Rp 800.000'    ],
    ['1',   'Rp 1.820.000',   'Rp 1.720.000'  ],
    ['2',   'Rp 3.620.000',   'Rp 3.420.000'  ],
    ['3',   'Rp 5.420.000',   'Rp 5.120.000'  ],
    ['4',   'Rp 7.220.000',   'Rp 6.820.000'  ],
    ['5',   'Rp 9.020.000',   'Rp 8.520.000'  ],
    ['10',  'Rp 17.980.000',  'Rp 16.980.000' ],
    ['25',  'Rp 44.850.000',  'Rp 42.350.000' ],
    ['50',  'Rp 89.600.000',  'Rp 84.600.000' ],
    ['100', 'Rp 179.000.000', 'Rp 169.000.000'],
  ], reset);
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 5 & 6: RESERVED (placeholder kosong)
═══════════════════════════════════════════════════════════════ */
function _setupRESERVED(ss, name) {
  const sh = _getOrCreate(ss, name, true);
  sh.setTabColor('#aaaaaa');
  sh.getRange('A1').setValue('Sheet ini dicadangkan untuk penggunaan mendatang.')
    .setFontColor('#888888').setFontStyle('italic');
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 7: KADAR_D1 — Persentase harga beli perhiasan (Daftar 1)
═══════════════════════════════════════════════════════════════ */
function _setupKADAR_D1(ss, reset) {
  const sh = _getOrCreate(ss, 'KADAR_D1', reset);
  sh.setTabColor(C.GOLD);

  // ── Header ──
  sh.getRange('A1:B1').setValues([['kadar', 'pct']]);
  _headerRow(sh, 1, 2, C.BROWN_DARK, C.GOLD_SHINE);
  sh.setColumnWidth(1, 100);
  sh.setColumnWidth(2, 120);

  // ── Data default ──
  const data = [
    ['6K',  0.25],
    ['7K',  0.25],
    ['8K',  0.28],
    ['9K',  0.32],
    ['16K', 0.70],
    ['17K', 0.73],
    ['18K', 0.78],
  ];
  sh.getRange(2, 1, data.length, 2).setValues(data);
  _dataRows(sh, 2, data.length, 2);
  _tableBorder(sh, 1, data.length + 1, 2);
  _freezeHeader(sh);

  // ── Format kolom pct sebagai persen ──
  sh.getRange(2, 2, data.length, 1).setNumberFormat('0.00%');

  // ── Catatan ──
  _note(sh, 1, 1, 'Kode kadar emas (6K, 7K, 8K, 9K, 16K, 17K, 18K)');
  _note(sh, 1, 2, 'Persentase kadar (desimal). 0.25 = 25%\nRumus: cokim2 × pct → FLOOR ke 500');

  // ── Kolom D: penjelasan rumus ──
  sh.getRange('D1').setValue('RUMUS').setFontWeight('bold').setFontColor(C.BROWN_MID);
  sh.getRange('D2').setValue('Harga Beli = cokim2 × pct');
  sh.getRange('D3').setValue('Dibulatkan FLOOR ke 500');
  sh.getRange('D4').setValue('Contoh: 1.800.000 × 0.25 = 450.000');
  sh.setColumnWidth(4, 280);
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 8: KADAR_D2 — Persentase harga emas (Daftar 2, dengan range)
═══════════════════════════════════════════════════════════════ */
function _setupKADAR_D2(ss, reset) {
  const sh = _getOrCreate(ss, 'KADAR_D2', reset);
  sh.setTabColor(C.GOLD_LIGHT);

  // ── Header ──
  sh.getRange('A1:D1').setValues([['kadar', 'pct_low', 'pct_high', 'high_kadar']]);
  _headerRow(sh, 1, 4, C.BROWN_DARK, C.GOLD_SHINE);
  sh.setColumnWidth(1, 100);
  sh.setColumnWidth(2, 120);
  sh.setColumnWidth(3, 120);
  sh.setColumnWidth(4, 130);

  // ── Data default ──
  const data = [
    ['6K',  0.335, 0.370, false],
    ['7K',  0.400, 0.400, false],
    ['8K',  0.450, 0.480, false],
    ['9K',  0.490, 0.520, false],
    ['16K', 0.765, 0.780, true ],
    ['17K', 0.870, 0.870, true ],
    ['18K', 0.880, 0.880, true ],
  ];
  sh.getRange(2, 1, data.length, 4).setValues(data);
  _dataRows(sh, 2, data.length, 4);
  _tableBorder(sh, 1, data.length + 1, 4);
  _freezeHeader(sh);

  // ── Format kolom pct sebagai persen ──
  sh.getRange(2, 2, data.length, 2).setNumberFormat('0.000%');

  // ── Warna kolom high_kadar: TRUE=merah muda, FALSE=hijau muda ──
  for (let r = 0; r < data.length; r++) {
    const cell  = sh.getRange(r + 2, 4);
    const isHigh = data[r][3];
    cell.setBackground(isHigh ? '#fde8e8' : '#e8fde8')
        .setFontColor(isHigh ? C.RED_LOTUS : C.GREEN_ANTAM)
        .setFontWeight('bold');
  }

  // ── Catatan header ──
  _note(sh, 1, 1, 'Kode kadar emas');
  _note(sh, 1, 2, 'Persentase minimum (batas bawah range harga jual)\n0.335 = 33.5%');
  _note(sh, 1, 3, 'Persentase maksimum (batas atas range harga jual)\nJika sama dengan pct_low → harga tunggal (tidak ada range)');
  _note(sh, 1, 4, 'TRUE  = kadar 16K ke atas → harga terima dikurangi 19.500\nFALSE = kadar 6K–9K     → harga terima = harga jual');

  // ── Penjelasan di kolom F ──
  sh.getRange('F1').setValue('RUMUS HARGA JUAL').setFontWeight('bold').setFontColor(C.BROWN_MID);
  sh.getRange('F2').setValue('Jual_Lo = CEILING(cokim1 × pct_low, 500)');
  sh.getRange('F3').setValue('Jual_Hi = CEILING(cokim1 × pct_high, 500)');
  sh.getRange('F4').setValue('Jika Lo=Hi → tampil 1 angka');
  sh.getRange('F5').setValue('Jika Lo≠Hi → tampil "Rp X – Rp Y"');
  sh.getRange('F7').setValue('RUMUS HARGA TERIMA').setFontWeight('bold').setFontColor(C.BROWN_MID);
  sh.getRange('F8').setValue('6K–9K  → Terima = Jual (identik)');
  sh.getRange('F9').setValue('16K+   → FLOOR(cokim1 × pct_low, 500) − 19.500');
  sh.setColumnWidth(6, 320);

  // ── Validasi data: high_kadar hanya boleh TRUE/FALSE ──
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TRUE', 'FALSE'], true)
    .setAllowInvalid(false)
    .setHelpText('Isi TRUE (untuk 16K ke atas) atau FALSE (untuk 6K–9K)')
    .build();
  sh.getRange(2, 4, data.length, 1).setDataValidation(rule);
}

/* ═══════════════════════════════════════════════════════════════
   OPSIONAL: Fungsi test koneksi API (jalankan manual untuk debug)
═══════════════════════════════════════════════════════════════ */
function testGetCokim() {
  const result = getCokimValues();
  Logger.log('COKIM values: ' + JSON.stringify(result));
}

function testGetSheet(n) {
  const result = getSheetData((n || 1) - 1);
  Logger.log('Sheet ' + (n||1) + ' (' + result.length + ' rows): ' + JSON.stringify(result.slice(0,2)));
}
