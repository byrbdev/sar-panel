export const JASA_PENGIRIMAN = [
  'J&T Express',
  'SiCepat Express',
  'JNE Express',
  'J&T Cargo',
  'Anteraja Express',
  'Ninja Express',
  'Wahana',
  'Shopee Express',
  'TIKI',
] as const;

/**
 * Daftar opsi dropdown Jasa Pengiriman. Kalau data lama masih memakai nama
 * jasa yang sudah tidak ada di daftar (mis. "SiCepat", "JNE", "POS Indonesia"),
 * nilainya tetap ikut ditampilkan supaya dropdown tidak "loncat" ke opsi
 * pertama secara diam-diam.
 */
export const jasaOptions = (current?: string): string[] => {
  const list: string[] = [...JASA_PENGIRIMAN];
  if (current && !list.includes(current)) list.push(current);
  return list;
};

export type StatusPengiriman = 'Masuk' | 'Terkirim' | 'Refund';
export type StatusAkunToko = 'Aktif' | 'Ban';

/** Satu baris produk dalam satu invoice/No Pesanan AL. Satu pembeli/satu
 * checkout bisa punya beberapa produk berbeda (Produk + Varian + SKU),
 * makanya disimpan sebagai list -- lihat field `produkList` di bawah. */
export type ProdukItem = {
  id: string;
  namaProduk: string;
  varian: string;
  skuProduk: string;
  /** Jumlah per pcs produk ini di pesanan (default 1). */
  jumlah?: number;
  /** Resi khusus produk ini. Hanya terisi kalau admin memilih "Resi Berbeda"
   * di overlay Masukkan Resi (produk utama memakai `Penjualan.noResi`). */
  noResi?: string;
  /** Jasa pengiriman khusus produk ini (hanya mode "Resi Berbeda"). */
  jasaPengiriman?: string;
};

export type Penjualan = {
  id: string;
  ownerId?: string; // id Member pemilik toko (untuk isolasi dashboard)
  namaToko: string;
  namaPembeli: string;
  noHp: string;
  alamatPembeli: string;
  namaProduk: string;
  varian: string;
  skuProduk: string;
  /** Jumlah per pcs produk utama (default 1). Dipakai di Analisa sebagai
   * jumlah terjual. Jumlah produk tambahan ada di `produkList[].jumlah`. */
  jumlah?: number;
  /** Produk TAMBAHAN di invoice/No Pesanan AL yang sama (di luar produk utama
   * di atas). Kosong/undefined = cuma 1 produk. Finansial (harga/modal) TETAP
   * satu untuk seluruh invoice, tidak dipecah per produk. */
  produkList?: ProdukItem[];
  noPesananAL: string;
  hargaJual: number;
  modalShopee: number;
  noResi: string;
  /** Kapan no_resi terakhir diisi/diubah (diisi otomatis oleh trigger DB).
   * Dipakai untuk notifikasi "resi masuk" yang otomatis kedaluwarsa setelah 3 hari. */
  resiUpdatedAt?: string;
  jasaPengiriman: string;
  statusPengiriman: StatusPengiriman;
  statusAkunToko: StatusAkunToko;
  tanggalTransaksi: string;
  /** Waktu transaksi asli dari database (ISO). Dipakai untuk menentukan
   * bulan (filter "Bulan Ini", tren, backup) -- jauh lebih andal daripada
   * mem-parse teks `tanggalTransaksi`. Kosong untuk data yang baru dibuat
   * di klien dan belum ter-sync; di kasus itu teks dipakai sebagai cadangan. */
  tanggalIso?: string;
};

// Daftar toko diambil dari data Toko (variables/dropshipPemulihan) supaya konsisten
export const daftarToko = [
  'Sari Fashion Store',
  'Budi Sport Shop',
  'Dewi Kids Store',
  'Rahmat Elektronik',
  'Putri Beauty Shop',
];

const tableDataPenjualan: Penjualan[] = [];

export default tableDataPenjualan;

/** Jumlah per pcs sebuah produk (produk utama atau ProdukItem). Kosong/0/
 * tidak valid dianggap 1, supaya data lama tetap terhitung 1 pcs. */
export const jumlahOf = (x?: { jumlah?: number | null }): number => {
  const n = Number(x?.jumlah);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};

/** Teks jumlah untuk tampilan/export, mis. "2x" */
export const jumlahLabel = (x?: { jumlah?: number | null }): string =>
  `${jumlahOf(x)}x`;
