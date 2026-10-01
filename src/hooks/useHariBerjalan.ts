import React from 'react';
import { hariIndexWib } from 'utils/bulanJakarta';

const CEK_INTERVAL_MS = 30 * 1000;

/**
 * Nomor hari kalender WIB yang ikut berubah SENDIRI saat hari berganti
 * (00:00 WIB), tanpa perlu refresh halaman. Dipakai untuk indikator umur
 * resi supaya warna tombol naik sendiri di tab yang dibiarkan terbuka.
 * Pola sama dengan `useBulanBerjalan`: dicek tiap 30 detik + saat tab
 * kembali aktif; state hanya berubah kalau harinya benar-benar beda.
 */
export const useHariBerjalan = (): number => {
  const [hari, setHari] = React.useState(() => hariIndexWib());

  React.useEffect(() => {
    const cek = () =>
      setHari((prev) => {
        const next = hariIndexWib();
        return next === prev ? prev : next;
      });
    const onVisible = () => {
      if (document.visibilityState === 'visible') cek();
    };

    cek();
    const timer = setInterval(cek, CEK_INTERVAL_MS);
    window.addEventListener('focus', cek);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', cek);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return hari;
};
