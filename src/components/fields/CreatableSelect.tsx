'use client';
import React from 'react';
import { MdSearch, MdKeyboardArrowDown, MdCheck, MdClose } from 'react-icons/md';

/**
 * Select dengan search sekaligus bisa "membuat" opsi baru kalau belum ada
 * di database. Dipakai untuk field seperti Kategori Toko di form Brutal:
 * - Klik salah satu opsi yang sudah ada (mis. "Perabotan Rumah") -> langsung
 *   ter-select sebagai kategori toko data ini.
 * - Ketik nama kategori yang belum ada di daftar -> muncul tombol centang
 *   (tambahkan & pilih) dan silang (batal). Klik centang otomatis membuat
 *   kategori itu jadi nilai terpilih, yang akan ikut tersimpan ke database
 *   begitu form disubmit (dan otomatis muncul sebagai opsi untuk data
 *   berikutnya, karena daftar opsi diturunkan langsung dari data yang ada).
 */
const CreatableSelect = (props: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Kalau diberikan, tiap opsi yang sudah ada dapat tombol "X" untuk
   * menghapus kategori itu dari database (dipakai di Kategori Toko Brutal). */
  onDeleteOption?: (option: string) => void;
}) => {
  const {
    label,
    options,
    value,
    onChange,
    placeholder,
    searchPlaceholder,
    onDeleteOption,
  } = props;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueOptions = React.useMemo(
    () =>
      Array.from(new Set(options.map((o) => o.trim()).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [options],
  );

  const filtered = uniqueOptions.filter((o) =>
    o.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const trimmedQuery = query.trim();
  const isNew =
    trimmedQuery !== '' &&
    !uniqueOptions.some((o) => o.toLowerCase() === trimmedQuery.toLowerCase());

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white/0 p-3 text-left text-sm text-navy-700 outline-none transition duration-150 hover:border-gray-300 dark:border-white/10 dark:text-white dark:hover:border-white/20"
      >
        <span className={value ? '' : 'text-gray-400 dark:text-gray-500'}>
          {value || placeholder || 'Pilih atau ketik baru...'}
        </span>
        <MdKeyboardArrowDown
          className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-[110] mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-3xl shadow-shadow-500 dark:border-white/10 dark:bg-navy-700 dark:shadow-none">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-2.5 dark:!bg-navy-700 dark:border-white/10">
            <MdSearch className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder || 'Cari atau ketik kategori baru...'}
              className="w-full bg-white/0 text-sm text-navy-700 outline-none placeholder:text-gray-400 dark:!bg-navy-700 dark:text-white"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 && !isNew && (
              <p className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                Tidak ditemukan.
              </p>
            )}
            {filtered.map((opt) => (
              <div
                key={opt}
                className="group flex w-full items-center justify-between rounded-lg hover:bg-lightPrimary dark:hover:bg-white/10"
              >
                <button
                  type="button"
                  onClick={() => commit(opt)}
                  className="flex-1 truncate px-4 py-2.5 text-left text-sm text-navy-700 dark:text-white"
                >
                  {opt}
                </button>
                <div className="flex flex-shrink-0 items-center gap-1 pr-2">
                  {opt === value && (
                    <MdCheck className="h-4 w-4 text-brand-500 dark:text-white" />
                  )}
                  {onDeleteOption && (
                    <button
                      type="button"
                      title={`Hapus kategori "${opt}" dari database`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOption(opt);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10"
                    >
                      <MdClose className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isNew && (
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-lightPrimary/60 px-4 py-2.5 dark:border-white/10 dark:bg-navy-800/60">
              <span className="truncate text-sm text-gray-600 dark:text-gray-300">
                Tambah kategori baru:{' '}
                <b className="text-navy-700 dark:text-white">
                  &quot;{trimmedQuery}&quot;
                </b>
              </span>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  title={`Tambahkan "${trimmedQuery}" & pilih`}
                  onClick={() => commit(trimmedQuery)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600"
                >
                  <MdCheck className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Batal"
                  onClick={() => setQuery('')}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                >
                  <MdClose className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatableSelect;
