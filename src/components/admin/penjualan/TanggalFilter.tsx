'use client';
import React from 'react';
import { MdFilterAlt, MdRestartAlt } from 'react-icons/md';
import { parseTanggalIndo } from 'utils/analisaHelpers';

export type TanggalFilterValue = {
  tanggal: string; // '' = semua, '1'..'31'
  bulan: string; // '' = semua, '1'..'12'
  tahun: string; // '' = semua, mis. '2026'
};

export const emptyTanggalFilter: TanggalFilterValue = {
  tanggal: '',
  bulan: '',
  tahun: '',
};

const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/**
 * Cocokkan tanggal transaksi (format "dd MMM yyyy") dengan filter.
 * Filter yang kosong dianggap "semua", jadi bisa dipakai sendiri-sendiri
 * (mis. hanya Bulan) atau digabung (Tanggal + Bulan + Tahun).
 */
export const matchTanggalFilter = (
  tanggal: string,
  f: TanggalFilterValue,
): boolean => {
  if (!f.tanggal && !f.bulan && !f.tahun) return true;
  const d = parseTanggalIndo(tanggal || '');
  if (!d) return false;
  if (f.tahun && d.getFullYear() !== Number(f.tahun)) return false;
  if (f.bulan && d.getMonth() + 1 !== Number(f.bulan)) return false;
  if (f.tanggal && d.getDate() !== Number(f.tanggal)) return false;
  return true;
};

const selectCls =
  'h-10 rounded-lg border border-gray-200 bg-white/0 px-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:!bg-navy-700 dark:text-white';

/**
 * Filter Tanggal / Bulan / Tahun untuk halaman Penjualan (semua role).
 * `tanggalList` = daftar tanggal transaksi yang ada, dipakai untuk mengisi
 * pilihan Tahun secara dinamis dari data yang benar-benar ada.
 */
const TanggalFilter = (props: {
  value: TanggalFilterValue;
  onChange: (v: TanggalFilterValue) => void;
  tanggalList: string[];
}) => {
  const { value, onChange, tanggalList } = props;

  const tahunOptions = React.useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    tanggalList.forEach((t) => {
      const d = parseTanggalIndo(t || '');
      if (d) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [tanggalList]);

  const aktif = !!(value.tanggal || value.bulan || value.tahun);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        <MdFilterAlt className="h-4 w-4" />
        Filter
      </span>
      <select
        value={value.tanggal}
        onChange={(e) => onChange({ ...value, tanggal: e.target.value })}
        className={selectCls}
        aria-label="Filter tanggal"
      >
        <option value="">Semua Tanggal</option>
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={String(d)}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={value.bulan}
        onChange={(e) => onChange({ ...value, bulan: e.target.value })}
        className={selectCls}
        aria-label="Filter bulan"
      >
        <option value="">Semua Bulan</option>
        {BULAN_PANJANG.map((b, i) => (
          <option key={b} value={String(i + 1)}>
            {b}
          </option>
        ))}
      </select>
      <select
        value={value.tahun}
        onChange={(e) => onChange({ ...value, tahun: e.target.value })}
        className={selectCls}
        aria-label="Filter tahun"
      >
        <option value="">Semua Tahun</option>
        {tahunOptions.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
      {aktif && (
        <button
          type="button"
          onClick={() => onChange(emptyTanggalFilter)}
          className="flex h-10 items-center gap-1 rounded-lg bg-lightPrimary px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/10"
        >
          <MdRestartAlt className="h-4 w-4" />
          Reset
        </button>
      )}
    </div>
  );
};

export default TanggalFilter;
