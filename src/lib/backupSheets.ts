import 'server-only';
import { google, sheets_v4 } from 'googleapis';
import { supabaseAdmin } from 'lib/supabaseAdmin';
import { jumlahLabel } from 'variables/dropshipPenjualan';
import { bulanKeyFromIso, bulanKeyWib, bulanWib } from 'utils/bulanJakarta';

/**
 * Logika backup ke Google Spreadsheet (dipakai bersama oleh tombol
 * "Backup Sekarang" di Setting dan oleh cron backup otomatis).
 *
 * - Satu TAB per bulan-tahun, nama otomatis (mis. "September 2026").
 * - Tab bulan yang sama dihitung ulang & diperbarui; bulan berganti = tab baru.
 * - Batas pergantian bulan = 00:00 WIB (Asia/Jakarta), BUKAN jam server.
 * - `bulanTarget` = momen yang berada di bulan yang mau di-backup (default:
 *   bulan berjalan). Dipakai cron untuk membackup bulan SEBELUMNYA setelah
 *   bulan berganti.
 */

const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

type Color = { red: number; green: number; blue: number };
const hex = (h: string): Color => ({
  red: parseInt(h.slice(1, 3), 16) / 255,
  green: parseInt(h.slice(3, 5), 16) / 255,
  blue: parseInt(h.slice(5, 7), 16) / 255,
});
const WHITE = hex('#FFFFFF');
const BORDER = hex('#9AA5C0');
const NAVY = hex('#1B254B');

type Theme = { section: Color; header: Color; zebra: Color; total: Color };
const THEME_PENJUALAN: Theme = {
  section: hex('#4318FF'),
  header: hex('#2B1BB5'),
  zebra: hex('#EEF0FF'),
  total: hex('#D6D9FF'),
};
const THEME_REFUND: Theme = {
  section: hex('#E23B3B'),
  header: hex('#A61E1E'),
  zebra: hex('#FFEFEF'),
  total: hex('#FFD3D3'),
};
const THEME_DENDA: Theme = {
  section: hex('#E08A00'),
  header: hex('#A85F00'),
  zebra: hex('#FFF6E5'),
  total: hex('#FFE2A8'),
};
const THEME_MEMBER: Theme = {
  section: hex('#05A672'),
  header: hex('#04704E'),
  zebra: hex('#E8FBF3'),
  total: hex('#BDF0DA'),
};

type Req = sheets_v4.Schema$Request;

export class BackupConfigError extends Error {}

export async function ambilSheetId(): Promise<string> {
  const { data: settingRow } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'google_sheet_id')
    .maybeSingle();
  return settingRow?.value || process.env.GOOGLE_SHEET_ID || '';
}

export async function jalankanBackup(opts: {
  sheetId: string;
  bulanTarget?: Date;
  actorId?: string | null;
}) {
  const { sheetId } = opts;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(
    /\\n/g,
    '\n',
  );
  if (!sheetId) {
    throw new BackupConfigError(
      'Sheet ID belum diatur. Buka Setting -> Backup ke Google Spreadsheet, lalu isi Sheet ID-nya dulu.',
    );
  }
  if (!clientEmail || !privateKey) {
    throw new BackupConfigError(
      'Kredensial Google Service Account belum dikonfigurasi di server (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY).',
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const now = new Date();
  const bulanDipilih = opts.bulanTarget ?? now;
  const { tahun: tahunWib, bulan: bulanWibIdx } = bulanWib(bulanDipilih);
  const bulanLabel = `${BULAN_ID[bulanWibIdx]} ${tahunWib}`;
  const sheetName = bulanLabel;
  const monthKey = bulanKeyWib(bulanDipilih);
  const q = `'${sheetName.replace(/'/g, "''")}'`; // nama tab berspasi WAJIB diquote

  const inThisMonth = (iso: string | null | undefined) =>
    bulanKeyFromIso(iso) === monthKey;

  // ---------------- Data bulan ini ----------------
  const [
    { data: penjualanRows },
    { data: refundRows },
    { data: profileRows },
    { data: iklanRows },
    { data: dendaRows },
  ] = await Promise.all([
    supabaseAdmin.from('penjualan').select('*'),
    supabaseAdmin.from('refund').select('*'),
    supabaseAdmin.from('profiles').select('id, nama, role'),
    supabaseAdmin.from('iklan_topup').select('*'),
    supabaseAdmin.from('denda_toko').select('*'),
  ]);

  const namaMember = new Map<string, string>();
  (profileRows || []).forEach((p: any) => namaMember.set(p.id, p.nama));

  const byDateAsc = (key: string) => (a: any, b: any) =>
    new Date(a[key]).getTime() - new Date(b[key]).getTime();

  const penjualanBulanIni = (penjualanRows || [])
    .filter((p: any) => inThisMonth(p.tanggal_transaksi))
    .sort(byDateAsc('tanggal_transaksi'));
  const refundBulanIni = (refundRows || [])
    .filter((r: any) => inThisMonth(r.tanggal))
    .sort(byDateAsc('tanggal'));

  // Denda Toko bulan ini (murni pencatatan, tidak masuk hitungan profit).
  const dendaBulanIni = (dendaRows || [])
    .filter((d: any) => inThisMonth(d.tanggal))
    .sort(byDateAsc('tanggal'));

  const fmtTanggal = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso || '-';
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
  };

  // ---------------- Tab & ukuran grid ----------------
  const sheetIdNum = await ensureSheetExists(sheets, sheetId, sheetName);

  // ---------------- Layout blok berdampingan ----------------
  const GAP = 2; // jumlah kolom kosong antar blok
  const P_HEAD = [
    'No Pesanan AL', 'Tanggal', 'Toko', 'Pembeli', 'Member',
    'Jumlah Produk', 'Produk', 'SKU', 'Omzet', 'Modal', 'Profit', 'Status',
  ];
  const P_W = [200, 105, 170, 150, 130, 90, 340, 200, 120, 120, 120, 105];
  const R_HEAD = [
    'Tanggal', 'Nama Pembeli', 'Toko', 'Member', 'Produk', 'SKU',
    'Status', 'Omzet', 'Profit',
  ];
  const R_W = [105, 160, 170, 130, 300, 190, 95, 120, 120];
  const M_HEAD = [
    'Nama Member', 'Jumlah Transaksi', 'Total Omzet', 'Total Modal',
    'Profit Penjualan', 'Top Up Iklan', 'Profit Bersih', 'Total Refund',
  ];
  const M_W = [180, 115, 135, 135, 140, 130, 140, 135];

  const P_START = 0;
  const R_START = P_START + P_HEAD.length + GAP;
  const M_START = R_START + R_HEAD.length + GAP;
  const D_HEAD = ['Tanggal', 'Nama Toko', 'Pemilik Toko', 'Keterangan', 'Jumlah Denda'];
  const D_W = [105, 190, 150, 300, 135];
  const D_START = M_START + M_HEAD.length + GAP;
  const TOTAL_COLS = D_START + D_HEAD.length;

  const grid: any[][] = [];
  const put = (r: number, c: number, v: any) => {
    while (grid.length <= r) grid.push([]);
    const row = grid[r];
    while (row.length <= c) row.push('');
    row[c] = v;
  };
  const styles: Req[] = [];

  const range = (r0: number, r1: number, c0: number, c1: number) => ({
    sheetId: sheetIdNum,
    startRowIndex: r0,
    endRowIndex: r1,
    startColumnIndex: c0,
    endColumnIndex: c1,
  });
  const fmt = (
    r0: number, r1: number, c0: number, c1: number,
    format: sheets_v4.Schema$CellFormat,
  ) => {
    styles.push({
      repeatCell: {
        range: range(r0, r1, c0, c1),
        cell: { userEnteredFormat: format },
        fields: `userEnteredFormat(${Object.keys(format).join(',')})`,
      },
    });
  };
  const merge = (r: number, c0: number, c1: number) =>
    styles.push({
      mergeCells: { range: range(r, r + 1, c0, c1), mergeType: 'MERGE_ALL' },
    });

  // Baris tetap
  const ROW_TITLE = 0;
  const ROW_SUB = 1;
  const ROW_SECTION = 3;
  const ROW_HEADER = 4;
  const ROW_DATA = 5;

  // Judul besar
  put(ROW_TITLE, 0, `LAPORAN PANEL DROPSHIP  |  ${bulanLabel.toUpperCase()}`);
  merge(ROW_TITLE, 0, TOTAL_COLS);
  fmt(ROW_TITLE, ROW_TITLE + 1, 0, TOTAL_COLS, {
    backgroundColor: NAVY,
    textFormat: { bold: true, fontSize: 16, foregroundColor: WHITE },
    horizontalAlignment: 'LEFT',
    verticalAlignment: 'MIDDLE',
  });
  put(
    ROW_SUB, 0,
    `Terakhir di-backup: ${now.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Jakarta' })} WIB  |  Data hanya mencakup bulan ${bulanLabel}`,
  );
  merge(ROW_SUB, 0, TOTAL_COLS);
  fmt(ROW_SUB, ROW_SUB + 1, 0, TOTAL_COLS, {
    backgroundColor: hex('#EEF1FA'),
    textFormat: { italic: true, fontSize: 10, foregroundColor: hex('#4A5578') },
    horizontalAlignment: 'LEFT',
    verticalAlignment: 'MIDDLE',
  });

  /** Render satu blok tabel lengkap dengan style. */
  const renderBlock = (opt: {
    start: number;
    title: string;
    headers: string[];
    data: any[][];
    total: any[];
    theme: Theme;
    currencyCols: number[]; // relatif terhadap awal blok
    centerCols: number[];
    emptyText: string;
  }) => {
    const { start, headers, theme } = opt;
    const end = start + headers.length;

    put(ROW_SECTION, start, opt.title);
    merge(ROW_SECTION, start, end);
    fmt(ROW_SECTION, ROW_SECTION + 1, start, end, {
      backgroundColor: theme.section,
      textFormat: { bold: true, fontSize: 12, foregroundColor: WHITE },
      horizontalAlignment: 'LEFT',
      verticalAlignment: 'MIDDLE',
    });

    headers.forEach((h, i) => put(ROW_HEADER, start + i, h));
    fmt(ROW_HEADER, ROW_HEADER + 1, start, end, {
      backgroundColor: theme.header,
      textFormat: { bold: true, fontSize: 10, foregroundColor: WHITE },
      horizontalAlignment: 'CENTER',
      verticalAlignment: 'MIDDLE',
      wrapStrategy: 'WRAP',
    });

    let r = ROW_DATA;
    if (opt.data.length === 0) {
      put(r, start, opt.emptyText);
      merge(r, start, end);
      fmt(r, r + 1, start, end, {
        textFormat: { italic: true, foregroundColor: hex('#7A849F') },
        horizontalAlignment: 'CENTER',
        verticalAlignment: 'MIDDLE',
      });
      r += 1;
    } else {
      opt.data.forEach((row) => {
        row.forEach((v, i) => put(r, start + i, v));
        r += 1;
      });
      const dStart = ROW_DATA;
      const dEnd = r;
      fmt(dStart, dEnd, start, end, {
        backgroundColor: WHITE,
        textFormat: { fontSize: 10, foregroundColor: hex('#1B254B') },
        verticalAlignment: 'MIDDLE',
        horizontalAlignment: 'LEFT',
        wrapStrategy: 'WRAP',
      });
      for (let rr = dStart; rr < dEnd; rr++) {
        if ((rr - dStart) % 2 === 1) {
          fmt(rr, rr + 1, start, end, { backgroundColor: theme.zebra });
        }
      }
      opt.centerCols.forEach((c) =>
        fmt(dStart, dEnd, start + c, start + c + 1, {
          horizontalAlignment: 'CENTER',
        }),
      );
      opt.currencyCols.forEach((c) =>
        fmt(dStart, dEnd, start + c, start + c + 1, {
          horizontalAlignment: 'RIGHT',
          numberFormat: { type: 'NUMBER', pattern: '"Rp"#,##0' },
        }),
      );
    }

    // Baris total
    opt.total.forEach((v, i) => put(r, start + i, v));
    fmt(r, r + 1, start, end, {
      backgroundColor: theme.total,
      textFormat: { bold: true, fontSize: 10, foregroundColor: hex('#1B254B') },
      verticalAlignment: 'MIDDLE',
    });
    opt.currencyCols.forEach((c) =>
      fmt(r, r + 1, start + c, start + c + 1, {
        horizontalAlignment: 'RIGHT',
        numberFormat: { type: 'NUMBER', pattern: '"Rp"#,##0' },
      }),
    );
    opt.centerCols.forEach((c) =>
      fmt(r, r + 1, start + c, start + c + 1, {
        horizontalAlignment: 'CENTER',
      }),
    );

    // Border seluruh tabel (header s.d. total)
    const b = { style: 'SOLID', width: 1, color: BORDER };
    styles.push({
      updateBorders: {
        range: range(ROW_HEADER, r + 1, start, end),
        top: b, bottom: b, left: b, right: b,
        innerHorizontal: b, innerVertical: b,
      },
    });
    // Garis atas baris total lebih tebal
    styles.push({
      updateBorders: {
        range: range(r, r + 1, start, end),
        top: { style: 'SOLID_MEDIUM', color: theme.header },
      },
    });
    return r + 1; // baris terakhir yang terpakai + 1
  };

  // ---------- Blok 1: Penjualan (per invoice) ----------
  let totalOmzetP = 0;
  let totalModalP = 0;
  const penjualanData = penjualanBulanIni.map((p: any) => {
    const list = Array.isArray(p.produk_list) ? p.produk_list : [];
    const items = [
      {
        nama: p.nama_produk,
        varian: p.varian,
        sku: p.sku_produk,
        jumlah: p.jumlah,
      },
      ...list.map((x: any) => ({
        nama: x.namaProduk,
        varian: x.varian,
        sku: x.skuProduk,
        jumlah: x.jumlah,
      })),
    ].filter((i) => i.nama || i.sku);
    const multi = items.length > 1;
    const produkText = items
      .map(
        (it, i) =>
          `${multi ? `${i + 1}. ` : ''}${it.nama || '-'}${it.varian ? ` (${it.varian})` : ''} (${jumlahLabel(it)})`,
      )
      .join('\n');
    const skuText = items
      .map((it, i) => `${multi ? `${i + 1}. ` : ''}${it.sku || '-'}`)
      .join('\n');
    const omzet = Number(p.harga_jual) || 0;
    const modal = Number(p.modal_shopee) || 0;
    totalOmzetP += omzet;
    totalModalP += modal;
    return [
      p.no_pesanan_al || '-',
      fmtTanggal(p.tanggal_transaksi),
      p.nama_toko || '-',
      p.nama_pembeli || '-',
      namaMember.get(p.owner_id) || '-',
      items.length || 1,
      produkText || '-',
      skuText || '-',
      omzet,
      modal,
      omzet - modal,
      p.status_pengiriman || '-',
    ];
  });
  renderBlock({
    start: P_START,
    title: `PENJUALAN BULAN ${bulanLabel.toUpperCase()}  (per invoice / No Pesanan)`,
    headers: P_HEAD,
    data: penjualanData,
    total: [
      'TOTAL', '', '', '', '',
      penjualanData.reduce((a, r) => a + (r[5] as number), 0),
      '', '', totalOmzetP, totalModalP, totalOmzetP - totalModalP, '',
    ],
    theme: THEME_PENJUALAN,
    currencyCols: [8, 9, 10],
    centerCols: [1, 5, 11],
    emptyText: '(Belum ada transaksi penjualan bulan ini)',
  });

  // ---------- Blok 2: Refund ----------
  let totalOmzetR = 0;
  let totalProfitR = 0;
  const refundData = refundBulanIni.map((r: any) => {
    const omzet = Number(r.omzet) || 0;
    const profit = Number(r.profit) || 0;
    totalOmzetR += omzet;
    totalProfitR += profit;
    return [
      fmtTanggal(r.tanggal),
      r.nama || '-',
      r.nama_toko || '-',
      namaMember.get(r.owner_id) || '-',
      r.nama_produk || '-',
      r.sku || '-',
      r.status || '-',
      omzet,
      profit,
    ];
  });
  renderBlock({
    start: R_START,
    title: `REFUND BULAN ${bulanLabel.toUpperCase()}`,
    headers: R_HEAD,
    data: refundData,
    total: ['TOTAL', '', '', '', '', '', '', totalOmzetR, totalProfitR],
    theme: THEME_REFUND,
    currencyCols: [7, 8],
    centerCols: [0, 6],
    emptyText: '(Belum ada refund bulan ini)',
  });

  // ---------- Blok 3: Total Omzet & Profit per Member ----------
  const perMember = new Map<
    string,
    {
      nama: string;
      transaksi: number;
      omzet: number;
      modal: number;
      refund: number;
      topUp: number;
    }
  >();
  const getM = (ownerId: string | null) => {
    const key = ownerId || 'tanpa-member';
    if (!perMember.has(key)) {
      perMember.set(key, {
        nama: (ownerId && namaMember.get(ownerId)) || '(Tanpa Member)',
        transaksi: 0, omzet: 0, modal: 0, refund: 0, topUp: 0,
      });
    }
    return perMember.get(key)!;
  };
  penjualanBulanIni.forEach((p: any) => {
    const m = getM(p.owner_id);
    m.transaksi += 1;
    m.omzet += Number(p.harga_jual) || 0;
    m.modal += Number(p.modal_shopee) || 0;
  });
  refundBulanIni.forEach((r: any) => {
    getM(r.owner_id).refund += Number(r.omzet) || 0;
  });
  // Top Up iklan bulan ini memotong profit member pemilik toko.
  // Member yang belum punya penjualan tetap muncul (profit bersih minus).
  (iklanRows || [])
    .filter((t: any) => inThisMonth(t.tanggal))
    .forEach((t: any) => {
      getM(t.owner_id).topUp += Number(t.jumlah) || 0;
    });
  const memberSorted = Array.from(perMember.values()).sort(
    (a, b) => b.omzet - a.omzet,
  );
  const gT = memberSorted.reduce((a, m) => a + m.transaksi, 0);
  const gO = memberSorted.reduce((a, m) => a + m.omzet, 0);
  const gM = memberSorted.reduce((a, m) => a + m.modal, 0);
  const gR = memberSorted.reduce((a, m) => a + m.refund, 0);
  const gI = memberSorted.reduce((a, m) => a + m.topUp, 0);
  renderBlock({
    start: M_START,
    title: `TOTAL OMZET & PROFIT PER MEMBER  |  ${bulanLabel.toUpperCase()}`,
    headers: M_HEAD,
    data: memberSorted.map((m) => [
      m.nama, m.transaksi, m.omzet, m.modal, m.omzet - m.modal,
      m.topUp, m.omzet - m.modal - m.topUp, m.refund,
    ]),
    total: ['TOTAL', gT, gO, gM, gO - gM, gI, gO - gM - gI, gR],
    theme: THEME_MEMBER,
    currencyCols: [2, 3, 4, 5, 6, 7],
    centerCols: [1],
    emptyText: '(Belum ada data member bulan ini)',
  });

  // ---------- Blok 4: Denda Toko ----------
  // Murni data: TIDAK dikurangkan dari omzet/profit blok mana pun.
  let totalDendaB = 0;
  const dendaData = dendaBulanIni.map((d: any) => {
    const jumlah = Number(d.jumlah) || 0;
    totalDendaB += jumlah;
    return [
      fmtTanggal(d.tanggal),
      d.nama_toko || '-',
      d.pemilik || namaMember.get(d.owner_id) || '-',
      d.keterangan || '-',
      jumlah,
    ];
  });
  renderBlock({
    start: D_START,
    title: `DENDA TOKO BULAN ${bulanLabel.toUpperCase()}`,
    headers: D_HEAD,
    data: dendaData,
    total: ['TOTAL', '', '', '', totalDendaB],
    theme: THEME_DENDA,
    currencyCols: [4],
    centerCols: [0],
    emptyText: '(Belum ada denda toko bulan ini)',
  });

  // ---------- Lebar kolom, tinggi baris, freeze ----------
  const widths: number[] = [];
  P_W.forEach((w) => widths.push(w));
  for (let i = 0; i < GAP; i++) widths.push(28);
  R_W.forEach((w) => widths.push(w));
  for (let i = 0; i < GAP; i++) widths.push(28);
  M_W.forEach((w) => widths.push(w));
  for (let i = 0; i < GAP; i++) widths.push(28);
  D_W.forEach((w) => widths.push(w));
  widths.forEach((w, i) =>
    styles.push({
      updateDimensionProperties: {
        range: { sheetId: sheetIdNum, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
        properties: { pixelSize: w },
        fields: 'pixelSize',
      },
    }),
  );
  const rowHeight = (r: number, px: number) =>
    styles.push({
      updateDimensionProperties: {
        range: { sheetId: sheetIdNum, dimension: 'ROWS', startIndex: r, endIndex: r + 1 },
        properties: { pixelSize: px },
        fields: 'pixelSize',
      },
    });
  rowHeight(ROW_TITLE, 46);
  rowHeight(ROW_SUB, 26);
  rowHeight(2, 14);
  rowHeight(ROW_SECTION, 34);
  rowHeight(ROW_HEADER, 38);
  // Baris data: tinggi otomatis mengikuti isi (produk multi-baris, dst)
  styles.push({
    autoResizeDimensions: {
      dimensions: {
        sheetId: sheetIdNum,
        dimension: 'ROWS',
        startIndex: ROW_DATA,
        endIndex: Math.max(grid.length, ROW_DATA + 1),
      },
    },
  });
  styles.push({
    updateSheetProperties: {
      properties: {
        sheetId: sheetIdNum,
        gridProperties: { frozenRowCount: ROW_HEADER + 1, hideGridlines: true },
      },
      fields: 'gridProperties.frozenRowCount,gridProperties.hideGridlines',
    },
  });

  // ---------------- Kirim ke Google Sheets ----------------
  // 1) Pastikan grid cukup besar + bersihkan merge/format lama
  //    (tab bulan ini mungkin sudah pernah dibuat dengan layout lama)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetIdNum,
              gridProperties: {
                rowCount: Math.max(grid.length + 30, 200),
                columnCount: Math.max(TOTAL_COLS + 2, 26),
              },
            },
            fields: 'gridProperties.rowCount,gridProperties.columnCount',
          },
        },
        { unmergeCells: { range: { sheetId: sheetIdNum } } },
        {
          updateCells: {
            range: { sheetId: sheetIdNum },
            fields: 'userEnteredFormat',
          },
        },
      ],
    },
  });

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: q,
  });

  // RAW: No Pesanan AL / SKU panjang tetap teks (bukan diubah jadi
  // notasi ilmiah), angka tetap angka.
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${q}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: grid },
  });

  // 2) Terapkan seluruh style (dibagi per 400 request agar aman)
  for (let i = 0; i < styles.length; i += 400) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { requests: styles.slice(i, i + 400) },
    });
  }

  const nowIso = now.toISOString();
  await supabaseAdmin.from('app_settings').upsert({
    key: 'google_sheet_last_backup',
    value: nowIso,
    updated_at: nowIso,
    updated_by: opts.actorId ?? null,
  });

  return {
    sheetName,
    counts: {
      penjualan: penjualanBulanIni.length,
      refund: refundBulanIni.length,
      member: perMember.size,
      denda: dendaBulanIni.length,
    },
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${sheetIdNum}`,
  };
}

async function ensureSheetExists(
  sheetsApi: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string,
): Promise<number> {
  const meta = await sheetsApi.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetName,
  );
  if (existing) return existing.properties?.sheetId ?? 0;

  const res = await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: sheetName } } }],
    },
  });
  return res.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;
}
