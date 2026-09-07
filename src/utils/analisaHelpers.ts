import { Penjualan } from 'variables/dropshipPenjualan';
import { RefundRow } from 'variables/dropshipRefund';
import { BrutalItem } from 'variables/dropshipBrutal';
import { PemulihanRow } from 'variables/dropshipPemulihan';

const BULAN_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/** Parse tanggal format "dd MMM yyyy" (Indonesia) mis. "01 Sep 2026" */
export const parseTanggalIndo = (tanggal: string): Date | null => {
  const parts = tanggal.trim().split(' ');
  if (parts.length !== 3) return null;
  const [dayStr, monthStr, yearStr] = parts;
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);
  const monthIdx = BULAN_ID.findIndex(
    (m) => m.toLowerCase() === monthStr.toLowerCase(),
  );
  if (isNaN(day) || isNaN(year) || monthIdx === -1) return null;
  return new Date(year, monthIdx, day);
};

export const getBulanKey = (tanggal: string): string => {
  const d = parseTanggalIndo(tanggal);
  if (!d) return 'unknown';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const formatBulanLabel = (key: string): string => {
  const [year, month] = key.split('-');
  const idx = parseInt(month, 10) - 1;
  return `${BULAN_ID[idx] || month} ${year}`;
};

export const isBulanIni = (tanggal: string): boolean => {
  const d = parseTanggalIndo(tanggal);
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
};

/** Cari nama pemilik toko dari database Toko berdasarkan nama toko */
export const getTokoOwner = (
  namaToko: string,
  tokoList: PemulihanRow[],
): string => {
  const found = tokoList.find((t) => t.namaToko === namaToko);
  return found?.nama || '-';
};

export type TokoAnalisa = {
  namaToko: string;
  pemilik: string;
  omzet: number;
  profit: number;
  transaksi: number;
};

export const analisaPerToko = (
  data: Penjualan[],
  tokoList: PemulihanRow[],
): TokoAnalisa[] => {
  const map = new Map<string, TokoAnalisa>();
  data.forEach((row) => {
    const key = row.namaToko;
    const existing = map.get(key) || {
      namaToko: row.namaToko,
      pemilik: getTokoOwner(row.namaToko, tokoList),
      omzet: 0,
      profit: 0,
      transaksi: 0,
    };
    existing.omzet += row.hargaJual;
    existing.profit += row.hargaJual - row.modalShopee;
    existing.transaksi += 1;
    map.set(key, existing);
  });
  return Array.from(map.values()).sort((a, b) => b.omzet - a.omzet);
};

export type PemilikAnalisa = {
  pemilik: string;
  jumlahToko: number;
  daftarToko: string[];
  omzet: number;
  profit: number;
  transaksi: number;
};

/**
 * Menggabungkan omzet & profit dari SEMUA toko yang dimiliki oleh orang yang
 * sama. Misal Budi punya 5 toko, maka total omzet ke-5 toko itu disatukan
 * menjadi satu baris "Budi".
 */
export const analisaPerPemilik = (
  data: Penjualan[],
  tokoList: PemulihanRow[],
): PemilikAnalisa[] => {
  const map = new Map<string, PemilikAnalisa>();
  data.forEach((row) => {
    const pemilik = getTokoOwner(row.namaToko, tokoList);
    const existing = map.get(pemilik) || {
      pemilik,
      jumlahToko: 0,
      daftarToko: [] as string[],
      omzet: 0,
      profit: 0,
      transaksi: 0,
    };
    if (!existing.daftarToko.includes(row.namaToko)) {
      existing.daftarToko.push(row.namaToko);
      existing.jumlahToko = existing.daftarToko.length;
    }
    existing.omzet += row.hargaJual;
    existing.profit += row.hargaJual - row.modalShopee;
    existing.transaksi += 1;
    map.set(pemilik, existing);
  });
  return Array.from(map.values()).sort((a, b) => b.omzet - a.omzet);
};

export type ProdukAnalisa = {
  namaProduk: string;
  namaToko: string;
  jumlahTerjual: number;
  omzet: number;
};

export const topProdukTerlaris = (
  data: Penjualan[],
  limit = 10,
): ProdukAnalisa[] => {
  const map = new Map<string, ProdukAnalisa>();
  data.forEach((row) => {
    const key = row.namaProduk + '||' + row.namaToko;
    const existing = map.get(key) || {
      namaProduk: row.namaProduk,
      namaToko: row.namaToko,
      jumlahTerjual: 0,
      omzet: 0,
    };
    existing.jumlahTerjual += 1;
    existing.omzet += row.hargaJual;
    map.set(key, existing);
  });
  return Array.from(map.values())
    .sort((a, b) => b.jumlahTerjual - a.jumlahTerjual)
    .slice(0, limit);
};

export type OmzetBulanan = {
  key: string;
  label: string;
  omzet: number;
  profit: number;
};

export const omzetPerBulan = (data: Penjualan[]): OmzetBulanan[] => {
  const map = new Map<string, OmzetBulanan>();
  data.forEach((row) => {
    const key = getBulanKey(row.tanggalTransaksi);
    const existing = map.get(key) || {
      key,
      label: formatBulanLabel(key),
      omzet: 0,
      profit: 0,
    };
    existing.omzet += row.hargaJual;
    existing.profit += row.hargaJual - row.modalShopee;
    map.set(key, existing);
  });
  return Array.from(map.values()).sort((a, b) => (a.key > b.key ? 1 : -1));
};

export type BrutalAnalisa = BrutalItem & {
  realOrderan: number;
  perluDioptimasi: boolean;
  namaAnggota: string;
};

export const analisaBrutal = (
  items: BrutalItem[],
  penjualan: Penjualan[],
  anggotaMap: Record<string, string>,
): BrutalAnalisa[] => {
  return items
    .map((item) => {
      const realOrderan = penjualan.filter(
        (p) =>
          p.skuProduk &&
          item.sku &&
          p.skuProduk.trim().toLowerCase() === item.sku.trim().toLowerCase(),
      ).length;
      const perluDioptimasi = item.status === 'Tidak' || item.iklan === 'Tidak';
      return {
        ...item,
        realOrderan,
        perluDioptimasi,
        namaAnggota: anggotaMap[item.anggotaId] || item.anggotaId,
      };
    })
    .sort((a, b) => a.realOrderan - b.realOrderan);
};

/** Kebalikan dari analisaBrutal: produk yang sudah performa baik (Muncul & beriklan) */
export const produkTeroptimasi = (
  analisa: BrutalAnalisa[],
): BrutalAnalisa[] => {
  return analisa
    .filter((b) => b.status === 'Muncul' && b.iklan === 'Iklan')
    .sort((a, b) => b.realOrderan - a.realOrderan);
};

export type RefundProdukAnalisa = {
  namaProduk: string;
  namaToko: string;
  jumlahRefund: number;
  totalOmzetHilang: number;
};

export const analisaProdukRefund = (
  refund: RefundRow[],
): RefundProdukAnalisa[] => {
  const map = new Map<string, RefundProdukAnalisa>();
  refund
    .filter((r) => !!r.namaProduk)
    .forEach((r) => {
      const key = (r.namaProduk || '-') + '||' + r.namaToko;
      const existing = map.get(key) || {
        namaProduk: r.namaProduk || '-',
        namaToko: r.namaToko,
        jumlahRefund: 0,
        totalOmzetHilang: 0,
      };
      existing.jumlahRefund += 1;
      existing.totalOmzetHilang += r.omzet || 0;
      map.set(key, existing);
    });
  return Array.from(map.values()).sort(
    (a, b) => b.jumlahRefund - a.jumlahRefund,
  );
};
