import React from 'react';
import { bulanKeyWib } from 'utils/bulanJakarta';

const CEK_INTERVAL_MS = 30 * 1000;

/**
 * Kunci bulan berjalan ("2026-09", zona WIB) yang ikut berubah SENDIRI saat
 * bulan berganti, tanpa perlu refresh halaman.
 *
 * Pakai nilai ini sebagai dependency `useMemo` / filter "bulan ini". Tanpa
 * ini, `new Date()` di dalam useMemo hanya dievaluasi ulang saat datanya
 * berubah, jadi tab yang dibiarkan terbuka melewati pergantian bulan akan
 * terus menampilkan bulan lama.
 *
 * Dicek tiap 30 detik + langsung saat tab kembali aktif/fokus (timer
 * browser bisa tertunda atau berhenti kalau laptop tidur / tab di background).
 * State hanya berubah kalau bulannya benar-benar beda, jadi tidak ada
 * re-render sia-sia.
 */
export const useBulanBerjalan = (): string => {
  const [key, setKey] = React.useState(() => bulanKeyWib());

  React.useEffect(() => {
    const cek = () =>
      setKey((prev) => {
        const next = bulanKeyWib();
        return next === prev ? prev : next;
      });
    const onVisible = () => {
      if (document.visibilityState === 'visible') cek();
    };

    cek(); // koreksi kalau bulan sempat berganti antara render & mount
    const timer = setInterval(cek, CEK_INTERVAL_MS);
    window.addEventListener('focus', cek);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', cek);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return key;
};
