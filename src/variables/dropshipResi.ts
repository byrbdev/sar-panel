import { Penjualan } from 'variables/dropshipPenjualan';

/** Satu permintaan "Follow Up Resi" dari Member ke Admin/Super Admin untuk
 * sebuah penjualan yang resinya belum diisi. */
export type FollowUpResi = {
  id: string;
  penjualanId: string;
  ownerId?: string; // member yang meminta follow up
  noPesananAL: string;
  namaToko: string;
  createdAt: string; // ISO string
};

/** Resi dianggap kosong kalau tidak diisi, spasi saja, atau cuma "-". */
export const isResiKosong = (p: Penjualan) =>
  !p.noResi || p.noResi.trim() === '' || p.noResi.trim() === '-';

/** Penjualan yang muncul di halaman Resi: sudah diproses (ada di tabel
 * penjualan), resi masih kosong, dan bukan transaksi yang sudah di-refund
 * (transaksi Refund memang tidak akan dikirim). */
export const perluResi = (p: Penjualan) =>
  isResiKosong(p) && p.statusPengiriman !== 'Refund';

/** Member baru boleh Follow Up lagi setelah selang waktu ini, supaya
 * notifikasi ke Admin tidak dispam berulang-ulang. */
export const FOLLOW_UP_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** Kapan resi sebuah penjualan diisi. Data lama yang belum punya
 * `resiUpdatedAt` memakai tanggal transaksi sebagai pengganti. */
const waktuResiDiisi = (p: Penjualan): Date | null => {
  const raw = p.resiUpdatedAt || p.tanggalTransaksi;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Penjualan yang resinya SUDAH diisi dan masih ditampilkan di halaman Resi
 * Member: bertahan selama bulan kalender yang sama dengan bulan resi diisi,
 * lalu otomatis hilang begitu bulan berganti. */
export const resiTerisiBulanIni = (p: Penjualan, now: Date = new Date()) => {
  if (isResiKosong(p)) return false;
  if (p.statusPengiriman === 'Refund') return false;
  const d = waktuResiDiisi(p);
  if (!d) return true;
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
};
