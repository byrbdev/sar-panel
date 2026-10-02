/**
 * Satu catatan Denda Toko. Dicatat Super Admin (semua toko) atau dilaporkan
 * Member (toko miliknya sendiri) -- tabel `denda_toko` yang sama.
 *
 * MURNI pencatatan: tidak dipakai di perhitungan omzet / profit / Top Up.
 */
export type DendaToko = {
  id: string;
  tokoId?: number;
  namaToko: string;
  /** Member pemilik toko saat denda dicatat (dasar "data milik member"). */
  ownerId?: string;
  pemilik: string;
  jumlah: number;
  keterangan?: string;
  /** Teks "dd MMM yyyy" (WIB) untuk tampilan. */
  tanggal: string;
  /** Waktu asli dari database; kosong pada baris yang baru dibuat di klien. */
  tanggalIso?: string;
};
