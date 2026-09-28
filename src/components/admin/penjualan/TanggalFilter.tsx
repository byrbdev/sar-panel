'use client';
import React from 'react';
import {
  MdFilterAlt,
  MdKeyboardArrowDown,
  MdCheck,
  MdRestartAlt,
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

/**
 * Dropdown custom (BUKAN <select> bawaan browser). <select> asli dipakai
 * sebelumnya, tapi popup opsinya dirender langsung oleh OS/browser
 * (bukan oleh CSS kita), jadi warnanya bisa nggak sinkron dengan dark mode
 * aplikasi (teks gelap di atas panel gelap, susah dibaca). Dropdown custom
 * di bawah ini full dikontrol Tailwind, jadi selalu konsisten dark/light.
 */
const Picker = (props: {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) => {
  const { label, value, placeholder, options, onChange } = props;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-navy-700 outline-none transition hover:border-gray-300 dark:border-white/10 dark:bg-navy-700 dark:text-white dark:hover:border-white/20"
      >
        <span className={current ? '' : 'text-gray-400 dark:text-gray-500'}>
          {current ? current.label : placeholder}
        </span>
        <MdKeyboardArrowDown
          className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute z-[120] mt-1 max-h-[220px] w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-navy-700">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-gray-500 transition hover:bg-lightPrimary dark:text-gray-400 dark:hover:bg-white/10"
          >
            {placeholder}
            {!value && <MdCheck className="h-4 w-4 text-brand-500 dark:text-white" />}
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-navy-700 transition hover:bg-lightPrimary dark:text-white dark:hover:bg-white/10"
            >
              {o.label}
              {o.value === value && (
                <MdCheck className="h-4 w-4 text-brand-500 dark:text-white" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Filter Tanggal / Bulan / Tahun untuk halaman Penjualan (semua role) --
 * tampil sebagai IKON di samping search bar. Klik ikonnya membuka overlay
 * (pakai ModalOverlay yang sama dipakai di seluruh aplikasi) berisi
 * pilihan Tanggal/Bulan/Tahun. `tanggalList` dipakai untuk mengisi pilihan
 * Tahun secara dinamis dari data yang benar-benar ada.
 */
const TanggalFilter = (props: {
  value: TanggalFilterValue;
  onChange: (v: TanggalFilterValue) => void;
  tanggalList: string[];
}) => {
  const { value, onChange, tanggalList } = props;
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const tahunOptions = React.useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    tanggalList.forEach((t) => {
      const d = parseTanggalIndo(t || '');
      if (d) set.add(d.getFullYear());
    });
    return Array.from(set)
      .sort((a, b) => b - a)
      .map((y) => ({ value: String(y), label: String(y) }));
  }, [tanggalList]);

  const tanggalOptions = React.useMemo(
    () =>
      Array.from({ length: 31 }, (_, i) => ({
        value: String(i + 1),
        label: String(i + 1),
      })),
    [],
  );
  const bulanOptions = React.useMemo(
    () => BULAN_PANJANG.map((b, i) => ({ value: String(i + 1), label: b })),
    [],
  );

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
        <p className="mb-4 -mt-2 text-sm text-gray-500 dark:text-gray-400">
          Tampilkan penjualan berdasarkan Tanggal, Bulan, dan/atau Tahun.
          Boleh isi salah satu saja atau digabung.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Picker
            label="Tanggal"
            placeholder="Semua Tanggal"
            value={draft.tanggal}
            options={tanggalOptions}
            onChange={(v) => setDraft({ ...draft, tanggal: v })}
          />
          <Picker
            label="Bulan"
            placeholder="Semua Bulan"
            value={draft.bulan}
            options={bulanOptions}
            onChange={(v) => setDraft({ ...draft, bulan: v })}
          />
          <Picker
            label="Tahun"
            placeholder="Semua Tahun"
            value={draft.tahun}
            options={tahunOptions}
            onChange={(v) => setDraft({ ...draft, tahun: v })}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
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
