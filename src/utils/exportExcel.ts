import type { Penjualan } from 'variables/dropshipPenjualan';
import type { PemulihanRow } from 'variables/dropshipPemulihan';
import { analisaPerPemilik, topProdukTerlaris } from 'utils/analisaHelpers';

const HEADER_FILL = 'FF4318FF';
const HEADER_FONT = 'FFFFFFFF';
const CURRENCY_FMT = '#,##0';

export const exportAnalisaToExcel = async (params: {
  filtered: Penjualan[];
  toko: PemulihanRow[];
  fileNameSuffix: string;
}) => {
  const ExcelJS = (await import('exceljs')).default;
  const { filtered, toko, fileNameSuffix } = params;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'SAR Panel By RB';
  wb.created = new Date();

  /* ================= Sheet 1: Penjualan (per invoice/No Pesanan AL) ================= */
  const wsPenjualan = wb.addWorksheet('Penjualan');
  wsPenjualan.columns = [
    { header: 'Tanggal', key: 'tanggal', width: 14 },
    { header: 'No Pesanan AL', key: 'noPesananAL', width: 22 },
    { header: 'Toko', key: 'toko', width: 22 },
    { header: 'Pembeli', key: 'pembeli', width: 20 },
    { header: 'Jumlah Produk', key: 'jumlahProduk', width: 13 },
    { header: 'Produk', key: 'produk', width: 38 },
    { header: 'SKU', key: 'sku', width: 26 },
    { header: 'Omzet', key: 'omzet', width: 16 },
    { header: 'Modal', key: 'modal', width: 16 },
    { header: 'Profit', key: 'profit', width: 16 },
    { header: 'Status Pengiriman', key: 'statusPengiriman', width: 16 },
    { header: 'Status Akun Toko', key: 'statusAkunToko', width: 16 },
  ];

  filtered.forEach((p) => {
    // Satu invoice/No Pesanan AL bisa punya beberapa produk (produk utama +
    // produkList) -- semuanya digabung dalam satu baris per invoice, karena
    // omzet/modal/profit memang tersimpan per invoice, bukan per produk.
    const semuaProduk = [
      p.namaProduk,
      ...(p.produkList || []).map((x) => x.namaProduk),
    ].filter(Boolean);
    const semuaSku = [
      p.skuProduk,
      ...(p.produkList || []).map((x) => x.skuProduk),
    ].filter(Boolean);
    wsPenjualan.addRow({
      tanggal: p.tanggalTransaksi,
      noPesananAL: p.noPesananAL || '-',
      toko: p.namaToko,
      pembeli: p.namaPembeli,
      jumlahProduk: semuaProduk.length,
      produk: semuaProduk.map((n, i) => `${i + 1}. ${n}`).join('\n'),
      sku: semuaSku.join('\n'),
      omzet: p.hargaJual,
      modal: p.modalShopee,
      profit: p.hargaJual - p.modalShopee,
      statusPengiriman: p.statusPengiriman,
      statusAkunToko: p.statusAkunToko,
    });
  });

  const totalOmzet = filtered.reduce((a, p) => a + p.hargaJual, 0);
  const totalModal = filtered.reduce((a, p) => a + p.modalShopee, 0);
  const totalProfit = totalOmzet - totalModal;

  const totalRowPenjualan = wsPenjualan.addRow({
    tanggal: '',
    noPesananAL: '',
    toko: '',
    pembeli: '',
    jumlahProduk: '',
    produk: '',
    sku: 'TOTAL',
    omzet: totalOmzet,
    modal: totalModal,
    profit: totalProfit,
    statusPengiriman: '',
    statusAkunToko: '',
  });

  styleSheet(
    wsPenjualan,
    ['omzet', 'modal', 'profit'],
    totalRowPenjualan.number,
    ['produk', 'sku'],
  );

  /* ================= Sheet 2: Per Pemilik Toko ================= */
  const wsPemilik = wb.addWorksheet('Per Pemilik Toko');
  wsPemilik.columns = [
    { header: 'Peringkat', key: 'peringkat', width: 10 },
    { header: 'Pemilik', key: 'pemilik', width: 22 },
    { header: 'Jumlah Toko', key: 'jumlahToko', width: 14 },
    { header: 'Daftar Toko', key: 'daftarToko', width: 40 },
    { header: 'Omzet', key: 'omzet', width: 16 },
    { header: 'Profit', key: 'profit', width: 16 },
    { header: 'Transaksi', key: 'transaksi', width: 12 },
  ];

  const perPemilik = analisaPerPemilik(filtered, toko);
  perPemilik.forEach((p, i) => {
    wsPemilik.addRow({
      peringkat: i + 1,
      pemilik: p.pemilik,
      jumlahToko: p.jumlahToko,
      daftarToko: p.daftarToko.join(', '),
      omzet: p.omzet,
      profit: p.profit,
      transaksi: p.transaksi,
    });
  });

  const totalOmzetPemilik = perPemilik.reduce((a, p) => a + p.omzet, 0);
  const totalProfitPemilik = perPemilik.reduce((a, p) => a + p.profit, 0);
  const totalTransaksiPemilik = perPemilik.reduce((a, p) => a + p.transaksi, 0);

  const totalRowPemilik = wsPemilik.addRow({
    peringkat: '',
    pemilik: 'TOTAL',
    jumlahToko: '',
    daftarToko: '',
    omzet: totalOmzetPemilik,
    profit: totalProfitPemilik,
    transaksi: totalTransaksiPemilik,
  });

  styleSheet(wsPemilik, ['omzet', 'profit'], totalRowPemilik.number);

  /* ================= Sheet 3: Top Produk ================= */
  const wsProduk = wb.addWorksheet('Top Produk');
  wsProduk.columns = [
    { header: 'Peringkat', key: 'peringkat', width: 10 },
    { header: 'Produk', key: 'produk', width: 28 },
    { header: 'Toko', key: 'toko', width: 22 },
    { header: 'Jumlah Terjual', key: 'jumlahTerjual', width: 15 },
  ];

  const topProduk = topProdukTerlaris(filtered, 10);
  topProduk.forEach((p, i) => {
    wsProduk.addRow({
      peringkat: i + 1,
      produk: p.namaProduk,
      toko: p.namaToko,
      jumlahTerjual: p.jumlahTerjual,
    });
  });

  const totalTerjualProduk = topProduk.reduce((a, p) => a + p.jumlahTerjual, 0);

  const totalRowProduk = wsProduk.addRow({
    peringkat: '',
    produk: 'TOTAL',
    toko: '',
    jumlahTerjual: totalTerjualProduk,
  });

  styleSheet(wsProduk, [], totalRowProduk.number);

  /* ================= Download ================= */
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analisa-penjualan-${fileNameSuffix}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// eslint-disable-next-line
function styleSheet(
  ws: any,
  currencyKeys: string[],
  totalRowNumber: number,
  wrapKeys: string[] = [],
) {
  // Header row styling
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell: any) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: HEADER_FILL },
    };
    cell.font = { color: { argb: HEADER_FONT }, bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    };
  });
  headerRow.height = 22;

  // Freeze header row
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  // Currency number format for specified columns
  currencyKeys.forEach((key) => {
    const col = ws.getColumn(key);
    col.numFmt = CURRENCY_FMT;
    col.alignment = { horizontal: 'right' };
  });

  // Kolom yang isinya bisa banyak baris (mis. Produk & SKU saat satu invoice
  // punya beberapa produk) -- WRAP di dalam sel yang sama supaya kolom tetap
  // rapi & tidak melebar horizontal, tapi tetap kelihatan semua isinya
  // (baris otomatis meninggi menyesuaikan jumlah produk).
  wrapKeys.forEach((key) => {
    const col = ws.getColumn(key);
    col.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
  });

  // Zebra striping for readability (skip header & total row) + tinggi baris
  // otomatis menyesuaikan jumlah baris terbanyak di antara kolom yang wrap.
  ws.eachRow((row: any, rowNumber: number) => {
    if (rowNumber === 1) return;

    if (wrapKeys.length > 0 && rowNumber !== totalRowNumber) {
      let maxLines = 1;
      wrapKeys.forEach((key) => {
        const val = row.getCell(key).value;
        if (typeof val === 'string' && val.includes('\n')) {
          maxLines = Math.max(maxLines, val.split('\n').length);
        }
      });
      if (maxLines > 1) row.height = 15 * maxLines;
    }

    if (rowNumber === totalRowNumber) return;
    if (rowNumber % 2 === 0) {
      row.eachCell((cell: any) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF4F7FE' },
        };
      });
    }
  });

  // Style total row (bold, top border, light brand background)
  const totalRow = ws.getRow(totalRowNumber);
  totalRow.eachCell((cell: any) => {
    cell.font = { bold: true };
    cell.border = { top: { style: 'medium', color: { argb: 'FF4318FF' } } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9E3FF' },
    };
  });

  // No autofilter is applied intentionally.
}
