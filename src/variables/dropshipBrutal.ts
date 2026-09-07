export type BrutalStatus = 'Muncul' | 'Tidak';
export type BrutalIklan = 'Iklan' | 'Tidak';

export type BrutalItem = {
  id: string;
  anggotaId: string;
  namaToko: string;
  kategoriToko: string;
  produk: string;
  status: BrutalStatus;
  iklan: BrutalIklan;
  orderan: string;
  sku: string;
  jumlahTerjual: string;
  ulasanProduk: string;
  reviewProduk: string;
  ratingToko: string;
  pelanggaran: string;
  keterangan: string;
  tanggal: string;
};

export const tableDataBrutalItems: BrutalItem[]= [];
