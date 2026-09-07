export type OrderRow = {
  id: string;
  reporterId?: string; // id Member yang melapor penjualan ini
  nama: string;
  toko: string;
  produk: string;
  varian: string;
  sku: string;
  noHp: string;
  alamat: string;
  keterangan?: string;
  hargaJual: number;
  modal: number;
  tanggal: string;
};

const tableDataOrderMasuk: OrderRow[]= [];

export default tableDataOrderMasuk;
