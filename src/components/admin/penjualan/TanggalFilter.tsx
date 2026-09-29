'use client';
import React from 'react';
import {
  MdFilterAlt,
  MdChevronLeft,
  MdChevronRight,
  MdRestartAlt,
  MdEvent,
  MdCalendarViewMonth,
  MdDateRange,
} from 'react-icons/md';
import { parseTanggalIndo } from 'utils/analisaHelpers';
import ModalOverlay from 'components/modal/ModalOverlay';

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
const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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

const labelFilter = (f: TanggalFilterValue): string => {
  if (!f.tanggal && !f.bulan && !f.tahun) return 'Semua tanggal';
  if (f.tanggal && f.bulan && f.tahun) {
    return `${f.tanggal} ${BULAN_PANJANG[Number(f.bulan) - 1]} ${f.tahun}`;
  }
  if (f.bulan && f.tahun) return `${BULAN_PANJANG[Number(f.bulan) - 1]} ${f.tahun}`;
  if (f.tahun) return `Tahun ${f.tahun}`;
  if (f.bulan) return `Bulan ${BULAN_PANJANG[Number(f.bulan) - 1]} (semua tahun)`;
  return `Tanggal ${f.tanggal} (semua bulan/tahun)`;
};

/**
 * Kalender kecil dibuat manual dengan Tailwind (BUKAN pakai package
 * react-calendar). Dulu sempat coba pakai react-calendar + CSS override
 * dark mode, tapi grid tanggalnya malah jadi kotak putih/abu-abu polos di
 * dark mode (kemungkinan konflik CSS global package itu saat dirender di
 * dalam portal modal). Dibuat manual di sini supaya 100% ngikut dark mode
 * aplikasi (cuma pakai class `dark:` Tailwind biasa), sama seperti
 * komponen lain di aplikasi ini.
 */
const MiniMonthGrid = (props: {
  activeStart: Date;
  onActiveStartChange: (d: Date) => void;
  selected: { tanggal: number; bulan: number; tahun: number } | null;
  onSelectDay: (d: Date) => void;
}) => {
  const { activeStart, onActiveStartChange, selected, onSelectDay } = props;
  const year = activeStart.getFullYear();
  const month = activeStart.getMonth();
  const today = new Date();

  const firstDow = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onActiveStartChange(new Date(year, month - 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white transition hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-base font-bold text-navy-700 dark:text-white">
          {BULAN_PANJANG[month]} {year}
        </p>
        <button
          type="button"
          onClick={() => onActiveStartChange(new Date(year, month + 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white transition hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1 rounded-lg bg-lightPrimary py-1.5 dark:bg-white/10">
        {HARI_PENDEK.map((h) => (
          <div
            key={h}
            className="text-center text-[11px] font-bold uppercase text-gray-500 dark:text-gray-300"
          >
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const isToday =
            d === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const isSelected =
            !!selected &&
            d === selected.tanggal &&
            month === selected.bulan - 1 &&
            year === selected.tahun;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDay(new Date(year, month, d))}
              className={`flex h-9 w-full items-center justify-center rounded-lg text-sm transition ${
                isSelected
                  ? 'bg-brand-500 font-bold text-white dark:bg-brand-400'
                  : isToday
                  ? 'bg-lightPrimary font-bold text-brand-500 dark:bg-white/10 dark:text-brand-300'
                  : 'text-navy-700 hover:bg-lightPrimary dark:text-white dark:hover:bg-white/10'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Filter Tanggal / Bulan / Tahun untuk halaman Penjualan & Refund (semua
 * role) -- tampil sebagai IKON di samping search bar. Klik ikonnya membuka
 * overlay berisi KALENDER (bukan dropdown):
 * - Klik satu tanggal -> filter jadi tanggal+bulan+tahun itu persis.
 * - Navigasi bulan/tahun di kalender lalu pakai tombol "Bulan Ini" / "Tahun
 *   Ini" -> filter jadi seluruh bulan atau seluruh tahun itu tanpa perlu
 *   pilih tanggal spesifik.
 */
const TanggalFilter = (props: {
  value: TanggalFilterValue;
  onChange: (v: TanggalFilterValue) => void;
  tanggalList: string[];
}) => {
  const { value, onChange } = props;
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [activeStart, setActiveStart] = React.useState<Date>(new Date());

  React.useEffect(() => {
    if (!open) return;
    setDraft(value);
    const base = value.tahun
      ? new Date(Number(value.tahun), value.bulan ? Number(value.bulan) - 1 : 0, 1)
      : new Date();
    setActiveStart(base);
  }, [open, value]);

  const selected =
    draft.tanggal && draft.bulan && draft.tahun
      ? {
          tanggal: Number(draft.tanggal),
          bulan: Number(draft.bulan),
          tahun: Number(draft.tahun),
        }
      : null;

  const aktif = !!(value.tanggal || value.bulan || value.tahun);
  const jumlahAktif = [value.tanggal, value.bulan, value.tahun].filter(Boolean).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Filter Tanggal / Bulan / Tahun"
        className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border transition ${
          aktif
            ? 'border-brand-500 bg-brand-500/10 text-brand-500 dark:border-brand-300 dark:bg-brand-400/10 dark:text-brand-300'
            : 'border-gray-200 bg-lightPrimary text-gray-600 hover:bg-gray-200 dark:border-white/10 dark:!bg-navy-700 dark:text-gray-300 dark:hover:bg-white/10'
        }`}
      >
        <MdFilterAlt className="h-5 w-5" />
        {jumlahAktif > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white dark:bg-brand-400">
            {jumlahAktif}
          </span>
        )}
      </button>

      <ModalOverlay
        open={open}
        onClose={() => setOpen(false)}
        title="Filter Penjualan"
      >
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Pilih tanggal di kalender untuk filter persis di hari itu, atau
          navigasi ke bulan/tahun yang dituju lalu pakai tombol di bawah
          untuk filter satu bulan atau satu tahun penuh.
        </p>

        <div className="rounded-2xl bg-white p-4 shadow dark:bg-navy-900">
          <MiniMonthGrid
            activeStart={activeStart}
            onActiveStartChange={setActiveStart}
            selected={selected}
            onSelectDay={(d) =>
              setDraft({
                tanggal: String(d.getDate()),
                bulan: String(d.getMonth() + 1),
                tahun: String(d.getFullYear()),
              })
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setDraft({
                tanggal: '',
                bulan: String(activeStart.getMonth() + 1),
                tahun: String(activeStart.getFullYear()),
              })
            }
            className="flex items-center gap-1.5 rounded-lg bg-lightPrimary px-3 py-2 text-xs font-semibold text-navy-700 transition hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/10"
          >
            <MdCalendarViewMonth className="h-4 w-4 text-brand-500 dark:text-brand-300" />
            Filter {BULAN_PANJANG[activeStart.getMonth()]} {activeStart.getFullYear()} (Sebulan Penuh)
          </button>
          <button
            type="button"
            onClick={() =>
              setDraft({ tanggal: '', bulan: '', tahun: String(activeStart.getFullYear()) })
            }
            className="flex items-center gap-1.5 rounded-lg bg-lightPrimary px-3 py-2 text-xs font-semibold text-navy-700 transition hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/10"
          >
            <MdDateRange className="h-4 w-4 text-brand-500 dark:text-brand-300" />
            Filter Tahun {activeStart.getFullYear()} Penuh
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 dark:border-white/15">
          <MdEvent className="h-4 w-4 flex-shrink-0 text-brand-500 dark:text-brand-300" />
          <p className="text-sm text-navy-700 dark:text-white">
            Filter terpilih: <b>{labelFilter(draft)}</b>
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setDraft(emptyTanggalFilter)}
            className="flex items-center gap-1.5 rounded-lg bg-lightPrimary px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/10"
          >
            <MdRestartAlt className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            Terapkan Filter
          </button>
        </div>
      </ModalOverlay>
    </>
  );
};

export default TanggalFilter;
