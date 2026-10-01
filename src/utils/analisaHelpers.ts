import { Penjualan, jumlahOf } from 'variables/dropshipPenjualan';
import { RefundRow } from 'variables/dropshipRefund';
import { BrutalItem } from 'variables/dropshipBrutal';
import { PemulihanRow } from 'variables/dropshipPemulihan';
import { bulanKeyFromIso, bulanKeyWib } from 'utils/bulanJakarta';

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
  const parts = tanggal.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const [dayStr, monthStr, yearStr] = parts;
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);
  // Cocokkan 3 huruf pertama supaya variasi locale ("Sep", "Sept",
  // "September", "Agu"/"Agt"/"Agustus", ...) tetap terbaca.
  const prefix = monthStr.replace(/\./g, '').slice(0, 3).toLowerCase();
  const alias: Record<string, string> = { agt: 'agu', ags: 'agu' };
  const bulan3 = alias[prefix] || prefix;
  const monthIdx = BULAN_ID.findIndex((m) => m.toLowerCase() === bulan3);
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

/**
 * Kunci bulan ("YYYY-MM") sebuah baris data. Waktu ISO dari database
 * diutamakan (dihitung di zona WIB); teks "dd MMM yyyy" hanya cadangan untuk
 * data yang baru dibuat di klien dan belum punya ISO.
 */
export const bulanKeyOf = (
  iso: string | null | undefined,
  tanggalIndo: string,
): string => bulanKeyFromIso(iso) ?? getBulanKey(tanggalIndo);

/**
 * Apakah baris data ini jatuh di bulan `bulanKey` ("YYYY-MM")?
 * `bulanKey` sebaiknya dari `useBulanBerjalan()` supaya tampilan ikut
 * berganti otomatis saat pergantian bulan.
 */
export const isInBulan = (
  iso: string | null | undefined,
  tanggalIndo: string,
  bulanKey: string,
): boolean => bulanKeyOf(iso, tanggalIndo) === bulanKey;

/**
 * Apakah refund ini masih ditampilkan di halaman Refund pada bulan `bulanKey`?
 * - Status Belum / Proses: SELALU tampil (masih harus ditindaklanjuti), meski
 *   dibuat di bulan sebelumnya.
 * - Status Selesai: hanya tampil di bulan refund itu dibuat, lalu otomatis
 *   hilang begitu bulan berganti. Datanya tidak dihapus dari database.
 * Tanggal tidak terbaca ('unknown') dibiarkan tampil supaya data tidak
 * hilang diam-diam.
 */
export const refundTampilDiBulan = (r: RefundRow, bulanKey: string): boolean => {
  if (r.status !== 'Selesai') return true;
  const key = bulanKeyOf(r.tanggalIso, r.tanggal);
  return key === 'unknown' || key === bulanKey;
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
};

/**
 * Satu invoice/No Pesanan AL bisa punya beberapa produk berbeda (produk
 * utama + `produkList`). Supaya "Produk Terlaris" akurat, tiap produk di
 * dalam invoice dihitung TERJUAL SENDIRI-SENDIRI berdasarkan nama produknya
 * -- Produk A tetap dihitung sebagai Produk A meskipun satu invoice dengan
 * Produk B & C, bukan digabung jadi satu baris per invoice.
 *
 * Omzet sengaja TIDAK dihitung di sini: harga jual tersimpan per INVOICE
 * (bukan per produk), jadi kalau satu invoice ada 3 produk, tidak ada cara
 * akurat membagi omzetnya ke masing-masing produk -- daripada menampilkan
 * angka yang menyesatkan, kolom omzet dihapus dari analisa produk terlaris.
 */
export const topProdukTerlaris = (
  data: Penjualan[],
  limit = 10,
): ProdukAnalisa[] => {
  const map = new Map<string, ProdukAnalisa>();
  const tambah = (namaProduk: string, namaToko: string, jumlah = 1) => {
    if (!namaProduk) return;
    const key = namaProduk + '||' + namaToko;
    const existing = map.get(key) || {
      namaProduk,
      namaToko,
      jumlahTerjual: 0,
    };
    existing.jumlahTerjual += jumlah;
    map.set(key, existing);
  };
  // Jumlah terjual = "Jumlah" tiap produk (default 1), jadi produk
  // dengan jumlah 2 atau 3 dihitung terjual 2 atau 3.
  data.forEach((row) => {
    tambah(row.namaProduk, row.namaToko, jumlahOf(row));
    (row.produkList || []).forEach((p) =>
      tambah(p.namaProduk, row.namaToko, jumlahOf(p)),
    );
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
    const key = bulanKeyOf(row.tanggalIso, row.tanggalTransaksi);
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

const KEY_BULAN = /^\d{4}-\d{2}$/;
const keyDariBulan = (tahun: number, bulan0: number): string => {
  const d = new Date(tahun, bulan0, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const kosongBulan = (key: string): OmzetBulanan => ({
  key,
  label: formatBulanLabel(key),
  omzet: 0,
  profit: 0,
});

/**
 * ApexCharts merender line chart dengan hanya 1 titik data sebagai satu
 * garis vertikal tunggal (terlihat seperti bar, bukan garis tren). Fungsi
 * ini memastikan selalu ada minimal `minPoints` bulan berurutan (dipadatkan
 * dengan nilai 0 untuk bulan yang belum ada transaksi) supaya grafik selalu
 * tampil sebagai garis tren yang wajar, persis seperti bawaan Horizon.
 *
 * `endKeyOverride` ("YYYY-MM", biasanya dari `useBulanBerjalan()`): grafik
 * SELALU berakhir di bulan berjalan. Tanpa ini, di awal bulan baru yang
 * belum ada transaksi, titik terakhir grafik masih bulan lalu -- padahal
 * kartu "Bulan ini" membaca titik terakhir itu.
 */
export const padOmzetBulanan = (
  trend: OmzetBulanan[],
  minPoints = 6,
  endKeyOverride?: string,
): OmzetBulanan[] => {
  const lastDataKey = [...trend].reverse().find((t) => KEY_BULAN.test(t.key))
    ?.key;
  const endKey =
    endKeyOverride && (!lastDataKey || endKeyOverride > lastDataKey)
      ? endKeyOverride
      : lastDataKey ?? bulanKeyWib();

  if (trend.length >= minPoints) {
    if (!lastDataKey || endKey === lastDataKey) return trend;
    // Riwayat penuh dipertahankan; sambung bulan kosong sampai bulan berjalan.
    const sambungan: OmzetBulanan[] = [];
    let [y, m] = lastDataKey.split('-').map((v) => parseInt(v, 10));
    for (let k = keyDariBulan(y, m); k <= endKey; k = keyDariBulan(y, m)) {
      sambungan.push(kosongBulan(k));
      m += 1;
      if (sambungan.length > 240) break; // pengaman
    }
    return [...trend, ...sambungan];
  }

  const [endYear, endMonth] = endKey.split('-').map((v) => parseInt(v, 10));
  const existing = new Map(trend.map((t) => [t.key, t]));

  const result: OmzetBulanan[] = [];
  for (let i = minPoints - 1; i >= 0; i--) {
    const key = keyDariBulan(endYear, endMonth - 1 - i);
    result.push(existing.get(key) || kosongBulan(key));
  }
  return result;
};

export type OmzetHarian = {
  tanggal: string; // '17', '18', dst (hanya nomor hari)
  produkTerjual: number;
  omzet: number;
  profit: number;
};

/** Agregasi 9 hari terakhir (dari data yang ada) untuk chart Omzet Mingguan */
export const omzetPerHariTerakhir = (
  data: Penjualan[],
  jumlahHari = 9,
): OmzetHarian[] => {
  const map = new Map<string, OmzetHarian>();
  data.forEach((row) => {
    const d = parseTanggalIndo(row.tanggalTransaksi);
    if (!d) return;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const existing = map.get(key) || {
      tanggal: String(d.getDate()),
      produkTerjual: 0,
      omzet: 0,
      profit: 0,
      _sort: d.getTime(),
    };
    // Produk terjual = total pcs semua produk di transaksi ini
    // (Jumlah produk utama + produk tambahan).
    existing.produkTerjual +=
      jumlahOf(row) +
      (row.produkList || []).reduce((a, x) => a + jumlahOf(x), 0);
    existing.omzet += row.hargaJual;
    existing.profit += row.hargaJual - row.modalShopee;
    map.set(key, existing as any);
  });
  return Array.from(map.values())
    .sort((a: any, b: any) => a._sort - b._sort)
    .slice(-jumlahHari)
    .map(({ tanggal, produkTerjual, omzet, profit }) => ({
      tanggal,
      produkTerjual,
      omzet,
      profit,
    }));
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
      // Real orderan = total pcs terjual untuk SKU ini (Jumlah),
      // baik dari produk utama maupun produk tambahan di suatu invoice.
      const skuItem = (item.sku || '').trim().toLowerCase();
      const realOrderan = skuItem
        ? penjualan.reduce((total, p) => {
            let n = 0;
            if ((p.skuProduk || '').trim().toLowerCase() === skuItem)
              n += jumlahOf(p);
            (p.produkList || []).forEach((x) => {
              if ((x.skuProduk || '').trim().toLowerCase() === skuItem)
                n += jumlahOf(x);
            });
            return total + n;
          }, 0)
        : 0;
      // Mapping utamanya cuma dari kolom STATUS: "Muncul" = sudah
      // teroptimasi, "Tidak" = perlu dioptimasi. Supaya kedua tabel di
      // Analisa (Perlu Dioptimasi vs Sudah Teroptimasi) saling melengkapi
      // 1:1 tanpa ada produk yang "hilang" di antara keduanya (sebelumnya
      // ikut mempertimbangkan status Iklan juga, jadi ada produk berstatus
      // "Muncul" tapi Iklan "Tidak" yang malah nyasar ke tabel "Perlu
      // Dioptimasi" walau badge Status-nya sendiri sudah hijau/"Muncul" —
      // membingungkan). Status Iklan tetap ditampilkan di kolom IKLAN
      // sebagai info tambahan, cuma tidak lagi dipakai untuk menentukan
      // masuk tabel yang mana.
      const perluDioptimasi = item.status !== 'Muncul';
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
    .filter((b) => !b.perluDioptimasi) // status === 'Muncul'
    .sort((a, b) => b.realOrderan - a.realOrderan);
};

export type RefundProdukAnalisa = {
  namaProduk: string;
  namaToko: string;
  jumlahRefund: number;
  totalOmzetHilang: number;
  /** Semua data refund untuk produk+toko ini (dipakai untuk overlay detail) */
  refunds: RefundRow[];
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
        refunds: [],
      };
      existing.refunds.push(r);
      existing.jumlahRefund += 1;
      existing.totalOmzetHilang += r.omzet || 0;
      map.set(key, existing);
    });
  return Array.from(map.values()).sort(
    (a, b) => b.jumlahRefund - a.jumlahRefund,
  );
};
