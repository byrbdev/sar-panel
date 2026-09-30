import { ProdukItem } from './dropshipPenjualan';

export type OrderRow = {
  id: string;
  reporterId?: string; // id Member yang melapor penjualan ini
  nama: string;
  toko: string;
  produk: string;
  varian: string;
  sku: string;
  /** Jumlah per pcs produk utama (default 1) */
  jumlah?: number;
  /** Produk tambahan di invoice/No Pesanan AL yang sama (lihat ProdukItem) */
  produkList?: ProdukItem[];
  noHp: string;
  alamat: string;
  keterangan?: string;
  noPesananAL?: string;
  hargaJual: number;
  modal: number;
  tanggal: string;
};

const tableDataOrderMasuk: OrderRow[]= [];

export default tableDataOrderMasuk;
