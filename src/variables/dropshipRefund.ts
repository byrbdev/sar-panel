export type RefundStatus = 'Belum' | 'Proses' | 'Selesai';
export type RefundAlasan = 'Refund' | 'Stok Kosong' | 'Transaksi Ditutup';

export type RefundRow = {
  id: string;
  ownerId?: string; // id Member pemilik toko
  nama: string;
  namaToko: string;
  emailToko: string;
  noHp: string;
  sku: string;
  noPesananAL: string;
  noPesananSHP: string;
  updateNoPesanan: string;
  alasan: RefundAlasan;
  keterangan: string;
  status: RefundStatus;
  tanggal: string;
  /** Waktu refund asli dari database (ISO) -- lihat `Penjualan.tanggalIso`. */
  tanggalIso?: string;
  /** Waktu status berubah menjadi Selesai (ISO), diisi otomatis oleh trigger
   * database (kolom `selesai_at`). undefined = belum Selesai, atau data lama
   * yang belum punya catatan waktu. Dipakai untuk menentukan bulan tampil di
   * halaman Refund -- lihat `refundTampilDiBulan`. */
  selesaiAt?: string;
  // Terisi hanya jika refund berasal dari transaksi yang sudah diproses (sudah ada di Penjualan)
  namaProduk?: string;
  omzet?: number;
  profit?: number;
  alamat?: string;
};

const tableDataRefund: RefundRow[]= [];

export default tableDataRefund;
