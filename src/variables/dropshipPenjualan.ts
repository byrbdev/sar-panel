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

export type Penjualan = {
  id: string;
  ownerId?: string; // id Member pemilik toko (untuk isolasi dashboard)
  namaToko: string;
  namaPembeli: string;
  noHp: string;
  alamatPembeli: string;
  namaProduk: string;
  skuProduk: string;
  hargaJual: number;
  modalShopee: number;
  noResi: string;
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
