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
  wsPenjualan.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  wsPenjualan.columns = [
    { header: 'No Pesanan AL', key: 'noPesananAL', width: 28 },
    { header: 'Tanggal', key: 'tanggal', width: 14 },
    { header: 'Toko', key: 'toko', width: 22 },
    { header: 'Pembeli', key: 'pembeli', width: 20 },
    { header: 'Jumlah Produk', key: 'jumlahProduk', width: 13 },
    { header: 'Produk', key: 'produk', width: 48 },
    { header: 'SKU', key: 'sku', width: 30 },
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
    // Satu entri per produk: nama + varian + SKU. SKU ditulis dengan nomor
    // yang SAMA dengan produknya (kalau produk ke-2 tidak punya SKU tetap
    // ditulis "-"), supaya kolom Produk & SKU selalu sejajar.
    const items = [
      { nama: p.namaProduk, varian: p.varian, sku: p.skuProduk },
      ...(p.produkList || []).map((x) => ({
        nama: x.namaProduk,
        varian: x.varian,
        sku: x.skuProduk,
      })),
    ].filter((i) => i.nama || i.sku);
    const multi = items.length > 1;
    const produkText = items
      .map(
        (it, i) =>
          `${multi ? `${i + 1}. ` : ''}${it.nama || '-'}${it.varian ? ` (${it.varian})` : ''}`,
      )
      .join('\n');
    const skuText = items
      .map((it, i) => `${multi ? `${i + 1}. ` : ''}${it.sku || '-'}`)
      .join('\n');
    wsPenjualan.addRow({
      tanggal: p.tanggalTransaksi,
      noPesananAL: p.noPesananAL || '-',
      toko: p.namaToko,
      pembeli: p.namaPembeli,
      jumlahProduk: items.length || 1,
      produk: produkText || '-',
      sku: skuText || '-',
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
    ['produk', 'sku', 'toko', 'pembeli'],
    ['tanggal', 'jumlahProduk', 'statusPengiriman', 'statusAkunToko'],
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
  centerKeys: string[] = [],
) {
  const thin = { style: 'thin', color: { argb: 'FFB8C0D6' } };
  const allBorders = { top: thin, left: thin, bottom: thin, right: thin };

  const numOf = (keys: string[]) =>
    new Set(keys.map((k) => ws.getColumn(k).number));
  const currencyCols = numOf(currencyKeys);
  const wrapCols = numOf(wrapKeys);
  const centerCols = numOf(centerKeys);

  // Header
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell: any) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: HEADER_FILL },
    };
    cell.font = { color: { argb: HEADER_FONT }, bold: true };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.border = allBorders;
  });
  headerRow.height = 30;
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  // Perkiraan jumlah baris visual satu sel (memperhitungkan wrap karena
  // teks panjang, bukan hanya karakter newline) supaya tinggi baris cukup
  // dan tidak ada teks yang terpotong.
  const visualLines = (text: string, colWidth: number) => {
    const perLine = Math.max(8, Math.floor(colWidth * 1.0) - 2);
    return String(text)
      .split('\n')
      .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / perLine)), 0);
  };

  ws.eachRow((row: any, rowNumber: number) => {
    if (rowNumber === 1) return;
    const isTotal = rowNumber === totalRowNumber;
    let maxLines = 1;

    row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
      const isWrap = wrapCols.has(colNumber);
      cell.alignment = {
        vertical: 'middle',
        horizontal: currencyCols.has(colNumber)
          ? 'right'
          : centerCols.has(colNumber)
          ? 'center'
          : 'left',
        wrapText: isWrap,
      };
      cell.border = allBorders;
      if (currencyCols.has(colNumber)) cell.numFmt = CURRENCY_FMT;

      if (isWrap && typeof cell.value === 'string') {
        const w = ws.getColumn(colNumber).width || 20;
        maxLines = Math.max(maxLines, visualLines(cell.value, w));
      }

      if (isTotal) {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE9E3FF' },
        };
      } else if (rowNumber % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF4F7FE' },
        };
      }
    });

    if (!isTotal) row.height = Math.max(20, 15 * maxLines + 6);
    else {
      row.height = 24;
      row.eachCell((cell: any) => {
        cell.border = {
          ...allBorders,
          top: { style: 'medium', color: { argb: 'FF4318FF' } },
        };
      });
    }
  });
}
