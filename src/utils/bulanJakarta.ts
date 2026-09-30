/**
 * Utilitas "bulan" berbasis zona waktu bisnis Asia/Jakarta (WIB = UTC+7,
 * tanpa DST). Semua penentuan "bulan ini" / pergantian bulan di panel
 * memakai zona ini, BUKAN zona milik browser atau server -- supaya
 * Dashboard, Analisa, Resi, dan Backup Sheets sepakat kapan bulan berganti
 * (tepat 00:00 WIB tanggal 1), di mana pun kode dijalankan (server Vercel
 * biasanya UTC, browser member bisa zona apa saja).
 *
 * Sengaja tanpa dependensi supaya aman dipakai di server maupun klien.
 */

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Tahun & indeks bulan (0-11) dari sebuah momen, dilihat dari WIB. */
export const bulanWib = (d: Date = new Date()): { tahun: number; bulan: number } => {
  const s = new Date(d.getTime() + WIB_OFFSET_MS);
  return { tahun: s.getUTCFullYear(), bulan: s.getUTCMonth() };
};

/** Kunci bulan "YYYY-MM" (mis. "2026-09") dari sebuah momen, dilihat dari WIB. */
export const bulanKeyWib = (d: Date = new Date()): string => {
  const { tahun, bulan } = bulanWib(d);
  return `${tahun}-${String(bulan + 1).padStart(2, '0')}`;
};

/** Kunci bulan WIB dari string ISO/timestamp. null kalau kosong/tidak valid. */
export const bulanKeyFromIso = (iso?: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return bulanKeyWib(d);
};
