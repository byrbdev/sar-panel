import { IklanTopUp } from 'variables/dropshipIklan';
import { Penjualan } from 'variables/dropshipPenjualan';
import { PemulihanRow } from 'variables/dropshipPemulihan';
import { OmzetBulanan, bulanKeyOf, isInBulan } from 'utils/analisaHelpers';

/**
 * ATURAN PROFIT BERSIH (per member, per bulan):
 *
 *   Profit Bersih = SUM(profit penjualan bulan itu) - SUM(Top Up iklan bulan itu)
 *
 * - Top Up lebih besar dari profit -> hasilnya MINUS (= hutang iklan).
 * - Penjualan berikutnya di bulan yang sama otomatis "membayar" hutang itu,
 *   karena rumusnya selalu dihitung ulang dari total bulan tsb.
 * - Ganti bulan = kedua sisi mulai dari nol lagi. Datanya tidak dihapus,
 *   cuma tidak ikut terhitung karena beda bulan.
 */

/** Rp1.000 / -Rp1.000 (tanda minus di depan "Rp", bukan "Rp-1.000"). */
export const formatRupiahBersih = (n: number): string =>
  (n < 0 ? '-Rp' : 'Rp') + Math.abs(n).toLocaleString('id-ID');

/** Top Up yang jatuh di bulan `bulanKey` (opsional: hanya milik 1 member). */
export const topUpBulan = (
  list: IklanTopUp[],
  bulanKey: string,
  ownerId?: string,
): IklanTopUp[] =>
  list.filter(
    (t) =>
      isInBulan(t.tanggalIso, t.tanggal, bulanKey) &&
      (!ownerId || t.ownerId === ownerId),
  );

/**
 * Top Up yang ikut "hasil filter" di halaman Penjualan.
 * - Filter tanggal: sama persis dengan yang dipakai pada penjualan.
 * - Pencarian teks: Top Up dicatat per TOKO (tidak punya produk/pembeli),
 *   jadi saat ada kata pencarian, Top Up hanya ikut kalau nama toko ATAU
 *   nama pemilik (member)-nya cocok. Mencari nama produk/pembeli
 *   menampilkan profit produk itu tanpa potongan iklan.
 */
export const topUpHasilFilter = (
  list: IklanTopUp[],
  cocokTanggal: (tanggalTeks: string) => boolean,
  kataCari = '',
): IklanTopUp[] => {
  const term = kataCari.trim().toLowerCase();
  return list.filter(
    (t) =>
      cocokTanggal(t.tanggal) &&
      (!term ||
        t.namaToko.toLowerCase().includes(term) ||
        (t.pemilik || '').toLowerCase().includes(term)),
  );
};

export const totalTopUp = (list: IklanTopUp[]): number =>
  list.reduce((a, t) => a + (Number(t.jumlah) || 0), 0);

/** Pemilik (id member) sebuah penjualan; cadangan lewat nama toko. */
export const ownerIdPenjualan = (
  p: Penjualan,
  tokoList: PemulihanRow[],
): string | undefined =>
  p.ownerId || tokoList.find((t) => t.namaToko === p.namaToko)?.ownerId;

export const profitKotor = (data: Penjualan[]): number =>
  data.reduce((a, p) => a + (p.hargaJual - p.modalShopee), 0);

export type RingkasanProfit = {
  profitKotor: number;
  topUp: number;
  profitBersih: number;
  /** Hutang iklan yang belum tertutup (0 kalau profit bersih >= 0). */
  hutang: number;
};

/**
 * Ringkasan profit satu bulan. Kalau `ownerId` diisi, hanya penjualan &
 * Top Up milik member itu; kalau tidak, semua member digabung.
 */
export const ringkasProfitBulan = (
  penjualan: Penjualan[],
  topups: IklanTopUp[],
  bulanKey: string,
  tokoList: PemulihanRow[],
  ownerId?: string,
): RingkasanProfit => {
  const kotor = profitKotor(
    penjualan.filter(
      (p) =>
        isInBulan(p.tanggalIso, p.tanggalTransaksi, bulanKey) &&
        (!ownerId || ownerIdPenjualan(p, tokoList) === ownerId),
    ),
  );
  const topUp = totalTopUp(topUpBulan(topups, bulanKey, ownerId));
  const bersih = kotor - topUp;
  return {
    profitKotor: kotor,
    topUp,
    profitBersih: bersih,
    hutang: bersih < 0 ? -bersih : 0,
  };
};

/** Kurangi profit di tren bulanan (grafik) dengan Top Up bulan yang sama. */
export const kurangiTrenDenganIklan = (
  trend: OmzetBulanan[],
  topups: IklanTopUp[],
): OmzetBulanan[] => {
  if (topups.length === 0) return trend;
  const perBulan = new Map<string, number>();
  topups.forEach((t) => {
    const key = bulanKeyOf(t.tanggalIso, t.tanggal);
    perBulan.set(key, (perBulan.get(key) || 0) + (Number(t.jumlah) || 0));
  });
  return trend.map((b) => ({ ...b, profit: b.profit - (perBulan.get(b.key) || 0) }));
};

/** "dd MMM yyyy" (WIB) untuk baris baru yang belum punya waktu dari database. */
export const tanggalHariIni = (): string =>
  new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
