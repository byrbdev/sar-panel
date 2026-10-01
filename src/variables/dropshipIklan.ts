/**
 * Satu kali Top Up Iklan untuk sebuah toko (dicatat Super Admin).
 * Jumlahnya memotong profit bersih member pemilik toko pada bulan
 * `tanggalIso` -- lihat utils/iklanHelpers.ts.
 */
export type IklanTopUp = {
  id: string;
  tokoId?: number;
  namaToko: string;
  /** Member pemilik toko saat Top Up dicatat (dasar pemotongan profit). */
  ownerId?: string;
  pemilik: string;
  jumlah: number;
  keterangan?: string;
  /** Teks "dd MMM yyyy" (WIB) untuk tampilan. */
  tanggal: string;
  /** Waktu asli dari database; kosong pada baris yang baru dibuat di klien. */
  tanggalIso?: string;
};
