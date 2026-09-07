'use client';
import React from 'react';
import { MdSearch, MdKeyboardArrowDown, MdCheck } from 'react-icons/md';

const SearchableSelect = (props: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const { label, options, value, onChange, placeholder } = props;
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

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

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
          {value || placeholder || 'Pilih...'}
        </span>
        <MdKeyboardArrowDown
          className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-[110] mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-3xl shadow-shadow-500 dark:border-white/10 dark:bg-navy-700 dark:shadow-none">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-white/10">
            <MdSearch className="h-4 w-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari toko..."
              className="w-full bg-transparent text-sm text-navy-700 outline-none placeholder:text-gray-400 dark:text-white"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                Tidak ditemukan.
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-navy-700 transition duration-100 hover:bg-lightPrimary dark:text-white dark:hover:bg-white/10"
                >
                  {opt}
                  {opt === value && (
                    <MdCheck className="h-4 w-4 text-brand-500 dark:text-white" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
