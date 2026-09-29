'use client';
import React from 'react';
import ResiTable from 'components/admin/resi/ResiTable';
import { useAppData } from 'context/AppDataContext';
import { useAuth } from 'context/AuthContext';
import { useScopedData } from 'hooks/useScopedData';
import { useUI } from 'context/UIContext';
import { Penjualan } from 'variables/dropshipPenjualan';
import ResiDetailModal from 'components/admin/resi/ResiDetailModal';
import {
  FOLLOW_UP_COOLDOWN_MS,
  perluResi,
  resiTerisiBulanIni,
} from 'variables/dropshipResi';
import { MdCampaign, MdCheckCircle, MdVisibility } from 'react-icons/md';

/** Member: hanya penjualan miliknya sendiri yang resinya belum ada. */
const ResiMemberView = () => {
  const { profile } = useAuth();
  const { penjualan } = useScopedData();
  const { followUps, setFollowUps } = useAppData();
  const { notify } = useUI();
  // Dipakai untuk menghitung ulang status "boleh Follow Up lagi" tanpa refresh
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const [detailId, setDetailId] = React.useState<string | null>(null);

  // Belum ada resi -> tampil (Follow Up). Sudah ada resi -> tetap tampil
  // (Lihat Resi) selama masih di bulan yang sama, lalu hilang otomatis saat
  // bulan berganti. `now` ikut di dependency supaya pergantian bulan
  // terdeteksi tanpa refresh.
  const { rows, pendingCount } = React.useMemo(() => {
    const nowDate = new Date(now);
    const pending = penjualan.filter(perluResi);
    const done = penjualan
      .filter((p) => resiTerisiBulanIni(p, nowDate))
      .sort(
        (a, b) =>
          new Date(b.resiUpdatedAt || 0).getTime() -
          new Date(a.resiUpdatedAt || 0).getTime(),
      );
    return { rows: [...pending, ...done], pendingCount: pending.length };
  }, [penjualan, now]);
  const detail = rows.find((r) => r.id === detailId) || null;

  const lastFollowUp = React.useCallback(
    (penjualanId: string) => {
      const list = followUps.filter((f) => f.penjualanId === penjualanId);
      if (list.length === 0) return null;
      return list.reduce((a, b) =>
        new Date(a.createdAt).getTime() >= new Date(b.createdAt).getTime()
          ? a
          : b,
      );
    },
    [followUps],
  );

  const handleFollowUp = async (row: Penjualan) => {
    const result = await setFollowUps((prev) => [
      {
        id: 'FU-' + Date.now(),
        penjualanId: row.id,
        ownerId: profile?.id || row.ownerId,
        noPesananAL: row.noPesananAL || '',
        namaToko: row.namaToko,
        createdAt: new Date().toISOString(),
      },
      // Follow Up ulang: baris lama untuk penjualan yang sama diganti yang baru
      ...prev.filter((f) => f.penjualanId !== row.id),
    ]);
    if (result.ok) {
      notify(
        `Follow Up resi pesanan ${row.noPesananAL || '-'} terkirim ke Admin.`,
        'success',
      );
    } else {
      notify(`Follow Up gagal dikirim: ${result.errors[0]}`, 'error');
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-5">
      <ResiTable
        rows={rows}
        pendingCount={pendingCount}
        showMember={false}
        subtitle="Penjualan kamu yang sudah diproses. Tekan Follow Up bila resi belum diisi; resi yang sudah terisi tetap tampil sampai akhir bulan."
        renderAction={(row) => {
          if (!perluResi(row)) {
            return (
              <button
                onClick={() => setDetailId(row.id)}
                className="linear flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white transition duration-200 hover:bg-green-600 active:bg-green-700 sm:text-sm"
              >
                <MdVisibility className="h-4 w-4" />
                Lihat Resi
              </button>
            );
          }
          const last = lastFollowUp(row.id);
          const sudah =
            !!last &&
            now - new Date(last.createdAt).getTime() < FOLLOW_UP_COOLDOWN_MS;
          if (sudah) {
            return (
              <span className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-600 dark:bg-green-500/10 dark:text-green-300 sm:text-sm">
                <MdCheckCircle className="h-4 w-4" />
                Sudah Follow Up
              </span>
            );
          }
          return (
            <button
              onClick={() => handleFollowUp(row)}
              className="linear flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 sm:text-sm"
            >
              <MdCampaign className="h-4 w-4" />
              {last ? 'Follow Up Lagi' : 'Follow Up'}
            </button>
          );
        }}
      />
      <ResiDetailModal penjualan={detail} onClose={() => setDetailId(null)} />
    </div>
  );
};

export default ResiMemberView;
