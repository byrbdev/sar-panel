import { DendaToko } from 'variables/dropshipDenda';
import { bulanKeyOf, isInBulan } from 'utils/analisaHelpers';

/**
 * Helper Denda Toko. Sengaja TERPISAH dari iklanHelpers / analisaHelpers:
 * denda tidak mengurangi omzet maupun profit apa pun, jadi tidak boleh
 * ikut terhitung di rumus profit mana pun.
 */

const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const formatDenda = (n: number): string =>
  'Rp' + (Number(n) || 0).toLocaleString('id-ID');

export const totalDenda = (list: DendaToko[]): number =>
  list.reduce((a, d) => a + (Number(d.jumlah) || 0), 0);

/** Denda yang jatuh di bulan `bulanKey` ("YYYY-MM", WIB). */
export const dendaBulan = (list: DendaToko[], bulanKey: string): DendaToko[] =>
  list.filter((d) => isInBulan(d.tanggalIso, d.tanggal, bulanKey));

/** "2026-09" -> "September 2026". Kunci tak dikenal dikembalikan apa adanya. */
export const labelBulanKey = (key: string): string => {
  const [t, b] = key.split('-');
  const idx = Number(b) - 1;
  if (!t || !(idx >= 0 && idx < 12)) return key;
  return `${BULAN_PANJANG[idx]} ${t}`;
};

export const bulanKeyDenda = (d: DendaToko): string =>
  bulanKeyOf(d.tanggalIso, d.tanggal);

export const tanggalHariIniDenda = (): string =>
  new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
