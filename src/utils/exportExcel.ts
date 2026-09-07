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
  wb.creator = 'Panel Dropship By RB';
  wb.created = new Date();

  /* ================= Sheet 1: Penjualan ================= */
  const wsPenjualan = wb.addWorksheet('Penjualan');
  wsPenjualan.columns = [
    { header: 'Tanggal', key: 'tanggal', width: 14 },
    { header: 'Toko', key: 'toko', width: 22 },
    { header: 'Pembeli', key: 'pembeli', width: 20 },
    { header: 'Produk', key: 'produk', width: 26 },
    { header: 'SKU', key: 'sku', width: 16 },
    { header: 'Omzet', key: 'omzet', width: 16 },
    { header: 'Modal', key: 'modal', width: 16 },
    { header: 'Profit', key: 'profit', width: 16 },
    { header: 'Status Pengiriman', key: 'statusPengiriman', width: 16 },
    { header: 'Status Akun Toko', key: 'statusAkunToko', width: 16 },
  ];

  filtered.forEach((p) => {
    wsPenjualan.addRow({
      tanggal: p.tanggalTransaksi,
      toko: p.namaToko,
      pembeli: p.namaPembeli,
      produk: p.namaProduk,
      sku: p.skuProduk,
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
    toko: '',
    pembeli: '',
    produk: '',
    sku: 'TOTAL',
    omzet: totalOmzet,
    modal: totalModal,
    profit: totalProfit,
    statusPengiriman: '',
    statusAkunToko: '',
  });

  styleSheet(wsPenjualan, ['omzet', 'modal', 'profit'], totalRowPenjualan.number);

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
    { header: 'Omzet', key: 'omzet', width: 16 },
  ];

  const topProduk = topProdukTerlaris(filtered, 10);
  topProduk.forEach((p, i) => {
    wsProduk.addRow({
      peringkat: i + 1,
      produk: p.namaProduk,
      toko: p.namaToko,
      jumlahTerjual: p.jumlahTerjual,
      omzet: p.omzet,
    });
  });

  const totalOmzetProduk = topProduk.reduce((a, p) => a + p.omzet, 0);
  const totalTerjualProduk = topProduk.reduce((a, p) => a + p.jumlahTerjual, 0);

  const totalRowProduk = wsProduk.addRow({
    peringkat: '',
    produk: 'TOTAL',
    toko: '',
    jumlahTerjual: totalTerjualProduk,
    omzet: totalOmzetProduk,
  });

  styleSheet(wsProduk, ['omzet'], totalRowProduk.number);

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
function styleSheet(ws: any, currencyKeys: string[], totalRowNumber: number) {
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

  // Zebra striping for readability (skip header & total row)
  ws.eachRow((row: any, rowNumber: number) => {
    if (rowNumber === 1 || rowNumber === totalRowNumber) return;
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
