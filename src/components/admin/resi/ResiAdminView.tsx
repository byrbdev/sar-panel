'use client';
import React from 'react';
import ResiTable from 'components/admin/resi/ResiTable';
import ResiInputModal from 'components/admin/resi/ResiInputModal';
import { useAppData } from 'context/AppDataContext';
import { Penjualan } from 'variables/dropshipPenjualan';
import {
  UrgensiResi,
  perluResi,
  umurHariResi,
  urgensiResi,
} from 'variables/dropshipResi';
import { useHariBerjalan } from 'hooks/useHariBerjalan';
import { MdEditNote } from 'react-icons/md';

/** Warna tombol "Masukkan Resi" menurut umur penjualan (indikator 3 hari). */
const WARNA_TOMBOL: Record<UrgensiResi, string> = {
  normal:
    'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300',
  peringatan:
    'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400',
  kritis:
    'bg-red-500 hover:bg-red-600 active:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400',
};

/** Admin & Super Admin: semua penjualan (semua toko) yang resinya belum ada. */
const ResiAdminView = () => {
  const { penjualan } = useAppData();
  const hariIni = useHariBerjalan(); // warna tombol naik sendiri saat ganti hari
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const rows = React.useMemo(() => penjualan.filter(perluResi), [penjualan]);
  // Cari dari data terbaru (bukan snapshot), supaya overlay otomatis
  // tertutup begitu resi tersimpan dan baris keluar dari daftar.
  const selected: Penjualan | null =
    rows.find((r) => r.id === selectedId) || null;

  return (
    <div className="mt-3 flex flex-col gap-5">
      <ResiTable
        rows={rows}
        showMember
        subtitle="Penjualan yang sudah diproses tapi resinya belum diisi (semua toko)."
        renderAction={(row) => {
          const urgensi = urgensiResi(row, hariIni);
          const umur = umurHariResi(row, hariIni);
          return (
            <button
              onClick={() => setSelectedId(row.id)}
              title={
                urgensi === 'normal'
                  ? 'Hari ke-1: resi belum diisi'
                  : `Hari ke-${(umur ?? 0) + 1}: resi belum diisi${urgensi === 'kritis' ? ' (segera isi!)' : ''}`
              }
              className={`linear flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-white transition duration-200 sm:text-sm ${WARNA_TOMBOL[urgensi]}`}
            >
              <MdEditNote className="h-4 w-4" />
              Masukkan Resi
            </button>
          );
        }}
      />
      <ResiInputModal
        penjualan={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
};

export default ResiAdminView;
