'use client';
import React from 'react';
import ResiTable from 'components/admin/resi/ResiTable';
import ResiInputModal from 'components/admin/resi/ResiInputModal';
import { useAppData } from 'context/AppDataContext';
import { Penjualan } from 'variables/dropshipPenjualan';
import { perluResi } from 'variables/dropshipResi';
import { MdEditNote } from 'react-icons/md';

/** Admin & Super Admin: semua penjualan (semua toko) yang resinya belum ada. */
const ResiAdminView = () => {
  const { penjualan } = useAppData();
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
        renderAction={(row) => (
          <button
            onClick={() => setSelectedId(row.id)}
            className="linear flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 sm:text-sm"
          >
            <MdEditNote className="h-4 w-4" />
            Masukkan Resi
          </button>
        )}
      />
      <ResiInputModal
        penjualan={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
};

export default ResiAdminView;
