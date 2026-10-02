'use client';
import { MdRestartAlt } from 'react-icons/md';
import { labelBulanKey } from 'utils/dendaHelpers';

/**
 * Filter Bulan-Tahun untuk Denda Toko. `value` kosong = bulan berjalan
 * (tampilan otomatis "reset" tiap ganti bulan; data lama tetap ada di
 * database dan muncul lagi begitu bulannya dipilih di sini).
 */
const DendaFilterBulan = (props: {
  value: string; // '' | 'YYYY-MM'
  onChange: (v: string) => void;
  bulanBerjalan: string;
}) => {
  const { value, onChange, bulanBerjalan } = props;
  const aktif = value && value !== bulanBerjalan;

  return (
    <div className="flex items-center gap-2">
      <input
        type="month"
        value={value || bulanBerjalan}
        max={bulanBerjalan}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter bulan dan tahun"
        className="flex h-11 items-center rounded-xl border border-gray-200 bg-white/0 px-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
      />
      {aktif && (
        <button
          type="button"
          onClick={() => onChange('')}
          title={`Kembali ke ${labelBulanKey(bulanBerjalan)}`}
          className="flex h-11 items-center gap-1 rounded-lg bg-lightPrimary px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
        >
          <MdRestartAlt className="h-4 w-4" />
          Bulan ini
        </button>
      )}
    </div>
  );
};

export default DendaFilterBulan;
