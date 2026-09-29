export const JASA_PENGIRIMAN = [
  'Shopee Express',
  'SiCepat',
  'J&T Express',
  'JNE',
  'Wahana',
  'Anteraja',
  'Ninja Xpress',
  'POS Indonesia',
] as const;

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
  /** Resi khusus produk ini. Hanya terisi kalau admin memilih "Resi Berbeda"
   * di overlay Masukkan Resi (produk utama memakai `Penjualan.noResi`). */
  noResi?: string;
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
