import { NextRequest, NextResponse } from 'next/server';
import { google, sheets_v4 } from 'googleapis';
import { supabaseAdmin } from 'lib/supabaseAdmin';
import { supabase } from 'lib/supabaseClient';

/**
 * POST /api/backup-sheets
 *
 * Backup bulanan ke Google Spreadsheet. Konsepnya:
 * - Satu TAB (sheet) per bulan-tahun, nama tab otomatis mengikuti bulan &
 *   tahun SAAT backup dijalankan (contoh: "September 2026").
 * - Isi tab itu HANYA data bulan tersebut: Penjualan, Refund, dan rekap
 *   Total Omzet & Profit per member -- masing-masing di section-nya
 *   sendiri dengan judul yang jelas, biar gampang dibaca/dianalisa.
 * - Backup di bulan yang sama akan menghitung ulang & menimpa isi tab bulan
 *   itu saja (jadi otomatis "update" data terbaru, aman dipencet berkali-
 *   kali). Begitu bulan berganti, tab baru otomatis dibuat -- tab bulan
 *   lama tidak disentuh/tidak hilang.
 * - Sheet ID diatur lewat UI Setting (disimpan di tabel app_settings),
 *   bukan lewat environment variable lagi. Kredensial Service Account
 *   (email & private key) tetap di environment variable karena itu rahasia.
 */

const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const HEADER_BG = { red: 0.263, green: 0.094, blue: 0.984 }; // #4318FF
const HEADER_FG = { red: 1, green: 1, blue: 1 };
const SECTION_BG = { red: 0.914, green: 0.89, blue: 1 }; // #E9E3FF
const TOTAL_BG = { red: 0.957, green: 0.969, blue: 0.984 }; // #F4F7FE

type CellStyleRequest = sheets_v4.Schema$Request;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userErr } =
      await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (!callerProfile || callerProfile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Sheet ID: prioritaskan yang diatur lewat UI (tabel app_settings),
    // fallback ke env var lama supaya setup yang sudah ada tetap jalan.
    const { data: settingRow } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'google_sheet_id')
      .maybeSingle();
    const sheetId = settingRow?.value || process.env.GOOGLE_SHEET_ID;

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(
      /\\n/g,
      '\n',
    );

    if (!sheetId) {
      return NextResponse.json(
        {
          error:
            'Sheet ID belum diatur. Buka Setting -> Backup ke Google Spreadsheet, lalu isi Sheet ID-nya dulu.',
        },
        { status: 400 },
      );
    }
    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        {
          error:
            'Kredensial Google Service Account belum dikonfigurasi di server (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY).',
        },
        { status: 400 },
      );
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const now = new Date();
    const bulanLabel = `${BULAN_ID[now.getMonth()]} ${now.getFullYear()}`;
    const sheetName = bulanLabel; // nama tab = "September 2026"
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const inThisMonth = (iso: string | null | undefined) => {
      if (!iso) return false;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return false;
      return (
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` ===
        monthKey
      );
    };

    // ------------------- Ambil data bulan ini -------------------
    const [
      { data: penjualanRows },
      { data: refundRows },
      { data: profileRows },
    ] = await Promise.all([
      supabaseAdmin.from('penjualan').select('*'),
      supabaseAdmin.from('refund').select('*'),
      supabaseAdmin.from('profiles').select('id, nama, role'),
    ]);

    const namaMember = new Map<string, string>();
    (profileRows || []).forEach((p: any) => namaMember.set(p.id, p.nama));

    const penjualanBulanIni = (penjualanRows || []).filter((p: any) =>
      inThisMonth(p.tanggal_transaksi),
    );
    const refundBulanIni = (refundRows || []).filter((r: any) =>
      inThisMonth(r.tanggal),
    );

    const formatTanggal = (iso: string) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso || '-';
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    // ------------------- Susun baris & style -------------------
    const rows: any[][] = [];
    const styleRequests: CellStyleRequest[] = [];
    const NUM_COLS_PENJUALAN = 12;
    const NUM_COLS_REFUND = 9;
    const NUM_COLS_MEMBER = 6;
    const MAX_COLS = Math.max(
      NUM_COLS_PENJUALAN,
      NUM_COLS_REFUND,
      NUM_COLS_MEMBER,
    );

    const addSectionTitle = (title: string, span: number) => {
      const r = rows.length;
      rows.push([title, ...Array(span - 1).fill('')]);
      styleRequests.push(
        mergeCells(r, 0, span),
        cellFormat(r, 0, span, {
          backgroundColor: SECTION_BG,
          textFormat: { bold: true, fontSize: 12 },
        }),
      );
      return r;
    };

    const addHeaderRow = (headers: string[]) => {
      const r = rows.length;
      rows.push(headers);
      styleRequests.push(
        cellFormat(r, 0, headers.length, {
          backgroundColor: HEADER_BG,
          textFormat: { bold: true, foregroundColor: HEADER_FG },
        }),
      );
      return r;
    };

    const addTotalRow = (cells: any[]) => {
      const r = rows.length;
      rows.push(cells);
      styleRequests.push(
        cellFormat(r, 0, cells.length, {
          backgroundColor: TOTAL_BG,
          textFormat: { bold: true },
        }),
      );
      return r;
    };

    // ===== Judul besar =====
    rows.push([`LAPORAN PANEL DROPSHIP -- ${bulanLabel.toUpperCase()}`]);
    styleRequests.push(
      mergeCells(0, 0, MAX_COLS),
      cellFormat(0, 0, MAX_COLS, {
        backgroundColor: HEADER_BG,
        textFormat: { bold: true, fontSize: 14, foregroundColor: HEADER_FG },
      }),
    );
    rows.push([]); // baris kosong

    // ===== Section: Penjualan =====
    addSectionTitle(`PENJUALAN BULAN ${bulanLabel.toUpperCase()}`, NUM_COLS_PENJUALAN);
    addHeaderRow([
      'Tanggal', 'No Pesanan AL', 'Toko', 'Pembeli', 'Member',
      'Jumlah Produk', 'Produk', 'SKU', 'Omzet', 'Modal', 'Profit', 'Status',
    ]);
    const penjualanDataStart = rows.length;
    let totalOmzetPenjualan = 0;
    let totalModalPenjualan = 0;
    penjualanBulanIni.forEach((p: any) => {
      const produkList = Array.isArray(p.produk_list) ? p.produk_list : [];
      const semuaProduk = [p.nama_produk, ...produkList.map((x: any) => x.namaProduk)].filter(Boolean);
      const semuaSku = [p.sku_produk, ...produkList.map((x: any) => x.skuProduk)].filter(Boolean);
      const omzet = Number(p.harga_jual) || 0;
      const modal = Number(p.modal_shopee) || 0;
      totalOmzetPenjualan += omzet;
      totalModalPenjualan += modal;
      rows.push([
        formatTanggal(p.tanggal_transaksi),
        p.no_pesanan_al || '-',
        p.nama_toko || '-',
        p.nama_pembeli || '-',
        namaMember.get(p.owner_id) || '-',
        semuaProduk.length,
        semuaProduk.join(', '),
        semuaSku.join(', '),
        omzet,
        modal,
        omzet - modal,
        p.status_pengiriman || '-',
      ]);
    });
    if (penjualanBulanIni.length === 0) {
      rows.push(['(Belum ada transaksi penjualan bulan ini)']);
    }
    const penjualanDataEnd = rows.length - 1;
    addTotalRow([
      'TOTAL', '', '', '', '', '', '', '',
      totalOmzetPenjualan, totalModalPenjualan,
      totalOmzetPenjualan - totalModalPenjualan, '',
    ]);
    styleRequests.push(
      currencyFormat(penjualanDataStart, penjualanDataEnd + 2, [8, 9, 10]),
    );
    rows.push([]);

    // ===== Section: Refund =====
    addSectionTitle(`REFUND BULAN ${bulanLabel.toUpperCase()}`, NUM_COLS_REFUND);
    addHeaderRow([
      'Tanggal', 'Nama', 'Toko', 'Member', 'Produk', 'SKU', 'Status', 'Omzet', 'Profit',
    ]);
    const refundDataStart = rows.length;
    let totalOmzetRefund = 0;
    let totalProfitRefund = 0;
    refundBulanIni.forEach((r: any) => {
      const omzet = Number(r.omzet) || 0;
      const profit = Number(r.profit) || 0;
      totalOmzetRefund += omzet;
      totalProfitRefund += profit;
      rows.push([
        formatTanggal(r.tanggal),
        r.nama || '-',
        r.nama_toko || '-',
        namaMember.get(r.owner_id) || '-',
        r.nama_produk || '-',
        r.sku || '-',
        r.status || '-',
        omzet,
        profit,
      ]);
    });
    if (refundBulanIni.length === 0) {
      rows.push(['(Belum ada refund bulan ini)']);
    }
    const refundDataEnd = rows.length - 1;
    addTotalRow([
      'TOTAL', '', '', '', '', '', '', totalOmzetRefund, totalProfitRefund,
    ]);
    styleRequests.push(
      currencyFormat(refundDataStart, refundDataEnd + 2, [7, 8]),
    );
    rows.push([]);

    // ===== Section: Total Omzet & Profit per Member =====
    addSectionTitle(
      `TOTAL OMZET & PROFIT PER MEMBER -- ${bulanLabel.toUpperCase()}`,
      NUM_COLS_MEMBER,
    );
    addHeaderRow([
      'Nama Member', 'Jumlah Transaksi', 'Total Omzet', 'Total Modal', 'Total Profit', 'Refund',
    ]);
    const memberDataStart = rows.length;
    const perMember = new Map<
      string,
      { nama: string; transaksi: number; omzet: number; modal: number; refund: number }
    >();
    penjualanBulanIni.forEach((p: any) => {
      const key = p.owner_id || 'tanpa-member';
      const cur = perMember.get(key) || {
        nama: namaMember.get(p.owner_id) || '(Tanpa Member)',
        transaksi: 0,
        omzet: 0,
        modal: 0,
        refund: 0,
      };
      cur.transaksi += 1;
      cur.omzet += Number(p.harga_jual) || 0;
      cur.modal += Number(p.modal_shopee) || 0;
      perMember.set(key, cur);
    });
    refundBulanIni.forEach((r: any) => {
      const key = r.owner_id || 'tanpa-member';
      const cur = perMember.get(key) || {
        nama: namaMember.get(r.owner_id) || '(Tanpa Member)',
        transaksi: 0,
        omzet: 0,
        modal: 0,
        refund: 0,
      };
      cur.refund += Number(r.omzet) || 0;
      perMember.set(key, cur);
    });
    let grandOmzet = 0, grandModal = 0, grandRefund = 0, grandTransaksi = 0;
    Array.from(perMember.values())
      .sort((a, b) => b.omzet - a.omzet)
      .forEach((m) => {
        grandOmzet += m.omzet;
        grandModal += m.modal;
        grandRefund += m.refund;
        grandTransaksi += m.transaksi;
        rows.push([
          m.nama, m.transaksi, m.omzet, m.modal, m.omzet - m.modal, m.refund,
        ]);
      });
    if (perMember.size === 0) {
      rows.push(['(Belum ada data member bulan ini)']);
    }
    const memberDataEnd = rows.length - 1;
    addTotalRow([
      'TOTAL', grandTransaksi, grandOmzet, grandModal, grandOmzet - grandModal, grandRefund,
    ]);
    styleRequests.push(
      currencyFormat(memberDataStart, memberDataEnd + 2, [2, 3, 4, 5]),
    );

    rows.push([]);
    rows.push([
      `Terakhir di-backup: ${now.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}`,
    ]);

    // ------------------- Kirim ke Google Sheets -------------------
    const sheetIdNum = await ensureSheetExists(sheets, sheetId, sheetName);

    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:ZZ100000`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    });

    // Terapkan formatting (perlu sheetId numerik dari tab yang bersangkutan)
    const requestsWithSheetId = styleRequests.map((r) =>
      injectSheetId(r, sheetIdNum),
    );
    requestsWithSheetId.push({
      updateDimensionProperties: {
        range: { sheetId: sheetIdNum, dimension: 'COLUMNS', startIndex: 0, endIndex: MAX_COLS },
        properties: { pixelSize: 150 },
        fields: 'pixelSize',
      },
    });
    if (requestsWithSheetId.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { requests: requestsWithSheetId },
      });
    }

    await supabaseAdmin.from('app_settings').upsert({
      key: 'google_sheet_last_backup',
      value: now.toISOString(),
      updated_at: now.toISOString(),
      updated_by: userData.user.id,
    });

    return NextResponse.json({
      success: true,
      sheetName,
      counts: {
        penjualan: penjualanBulanIni.length,
        refund: refundBulanIni.length,
        member: perMember.size,
      },
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

/* ================= Helpers ================= */

function mergeCells(row: number, startCol: number, span: number): CellStyleRequest {
  return {
    mergeCells: {
      range: {
        startRowIndex: row,
        endRowIndex: row + 1,
        startColumnIndex: startCol,
        endColumnIndex: startCol + span,
      },
      mergeType: 'MERGE_ALL',
    },
  };
}

function cellFormat(
  row: number,
  startCol: number,
  endCol: number,
  format: sheets_v4.Schema$CellFormat,
): CellStyleRequest {
  return {
    repeatCell: {
      range: {
        startRowIndex: row,
        endRowIndex: row + 1,
        startColumnIndex: startCol,
        endColumnIndex: endCol,
      },
      cell: { userEnteredFormat: format },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  };
}

function currencyFormat(
  startRow: number,
  endRow: number,
  cols: number[],
): CellStyleRequest {
  return {
    repeatCell: {
      range: {
        startRowIndex: startRow,
        endRowIndex: endRow,
        startColumnIndex: Math.min(...cols),
        endColumnIndex: Math.max(...cols) + 1,
      },
      cell: {
        userEnteredFormat: { numberFormat: { type: 'NUMBER', pattern: '#,##0' } },
      },
      fields: 'userEnteredFormat.numberFormat',
    },
  };
}

function injectSheetId(request: CellStyleRequest, sheetId: number): CellStyleRequest {
  const clone = JSON.parse(JSON.stringify(request));
  if (clone.mergeCells) clone.mergeCells.range.sheetId = sheetId;
  if (clone.repeatCell) clone.repeatCell.range.sheetId = sheetId;
  if (clone.updateDimensionProperties)
    clone.updateDimensionProperties.range.sheetId = sheetId;
  return clone;
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
  if (existing) return existing.properties?.sheetId || 0;

  const res = await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: sheetName } } }],
    },
  });
  return res.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;
}
