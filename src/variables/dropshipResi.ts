import { Penjualan } from 'variables/dropshipPenjualan';
import {
  bulanKeyFromIso,
  bulanKeyWib,
  hariIndexFromIso,
  hariIndexWib,
} from 'utils/bulanJakarta';
import { getBulanKey, parseTanggalIndo } from 'utils/analisaHelpers';

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
const kosong = (v?: string) => !v || v.trim() === '' || v.trim() === '-';

/** Mode "Resi Berbeda": minimal satu produk tambahan punya resi sendiri. */
export const isResiBerbeda = (p: Penjualan) =>
  (p.produkList || []).some((x) => !kosong(x.noResi));

/** Resi dianggap kosong kalau tidak diisi, spasi saja, atau cuma "-".
 * Pada mode Resi Berbeda, kosong = masih ada produk yang belum punya resi. */
export const isResiKosong = (p: Penjualan) =>
  kosong(p.noResi) ||
  (isResiBerbeda(p) && (p.produkList || []).some((x) => kosong(x.noResi)));

/** Penjualan yang muncul di halaman Resi: sudah diproses (ada di tabel
 * penjualan), resi masih kosong, dan bukan transaksi yang sudah di-refund
 * (transaksi Refund memang tidak akan dikirim). */
export const perluResi = (p: Penjualan) =>
  isResiKosong(p) && p.statusPengiriman !== 'Refund';

/** Tingkat urgensi penjualan yang resinya belum diisi (indikator 3 hari):
 * - normal     : hari ke-1 (hari penjualan diproses)  -> tombol biru
 * - peringatan : hari ke-2                            -> tombol kuning
 * - kritis     : hari ke-3 dan seterusnya             -> tombol merah */
export type UrgensiResi = 'normal' | 'peringatan' | 'kritis';

/** Umur penjualan dalam hari kalender WIB sejak diproses (0 = hari yang
 * sama). Memakai waktu ISO dari database; teks tanggal hanya cadangan.
 * null = tanggal tidak terbaca. */
export const umurHariResi = (
  p: Penjualan,
  hariIni: number = hariIndexWib(),
): number | null => {
  let hariProses = hariIndexFromIso(p.tanggalIso);
  if (hariProses === null && p.tanggalTransaksi) {
    const d = parseTanggalIndo(p.tanggalTransaksi);
    if (d) {
      hariProses = Math.floor(
        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000,
      );
    }
  }
  if (hariProses === null) return null;
  return Math.max(0, hariIni - hariProses);
};

/** Urgensi resi berdasarkan umur: 0 hari -> normal, 1 -> peringatan,
 * 2+ -> kritis. Tanggal tidak terbaca dianggap normal. */
export const urgensiResi = (
  p: Penjualan,
  hariIni: number = hariIndexWib(),
): UrgensiResi => {
  const umur = umurHariResi(p, hariIni);
  if (umur === null || umur < 1) return 'normal';
  return umur === 1 ? 'peringatan' : 'kritis';
};

/** Member baru boleh Follow Up lagi setelah selang waktu ini, supaya
 * notifikasi ke Admin tidak dispam berulang-ulang. */
export const FOLLOW_UP_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** Bulan (kunci "YYYY-MM", zona WIB) saat resi sebuah penjualan diisi. Data
 * lama yang belum punya `resiUpdatedAt` memakai tanggal transaksi sebagai
 * pengganti. Teks tanggal ("01 Agu 2026") TIDAK bisa dibaca `new Date()`
 * untuk bulan Agu/Mei/Okt/Des, jadi dipakai ISO-nya dulu. null = tidak
 * diketahui. */
const bulanResiDiisi = (p: Penjualan): string | null => {
  const key =
    bulanKeyFromIso(p.resiUpdatedAt) ??
    bulanKeyFromIso(p.tanggalIso) ??
    (p.tanggalTransaksi ? getBulanKey(p.tanggalTransaksi) : null);
  return key && key !== 'unknown' ? key : null;
};

/** Penjualan yang resinya SUDAH diisi dan masih ditampilkan di halaman Resi
 * Member: bertahan selama bulan kalender yang sama dengan bulan resi diisi,
 * lalu otomatis hilang begitu bulan berganti. */
export const resiTerisiBulanIni = (p: Penjualan, now: Date = new Date()) => {
  if (isResiKosong(p)) return false;
  if (p.statusPengiriman === 'Refund') return false;
  const bulanDiisi = bulanResiDiisi(p);
  if (!bulanDiisi) return true;
  return bulanDiisi === bulanKeyWib(now);
};
