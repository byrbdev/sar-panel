'use client';
import React from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

/**
 * Potong array jadi per-halaman (default 10 baris/halaman) dengan state
 * halaman-nya sendiri-sendiri per pemanggilan hook — jadi kalau dipakai di
 * 3 tabel berbeda (Perlu Dioptimasi, Sudah Teroptimasi, Analisa Produk
 * Refund), masing-masing punya tombol "Selanjutnya" independen, tidak saling
 * memengaruhi.
 */
export function usePagedSlice<T>(data: T[], pageSize = 10) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  // Kalau data berubah (mis. ganti filter bulan) dan halaman saat ini jadi
  // di luar jangkauan, balik ke halaman 1 supaya tidak nampilkan tabel kosong.
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const paged = React.useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize],
  );

  return { paged, page, setPage, totalPages, total: data.length, pageSize };
}

export const AnalisaPager = (props: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) => {
  const { page, totalPages, total, pageSize, onChange } = props;
  if (total <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="mt-3 flex flex-col items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400 sm:flex-row">
      <span>
        Menampilkan {start}-{end} dari {total} data
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-lightPrimary disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-navy-700"
        >
          <MdChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-medium text-navy-700 dark:text-white">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="flex h-7 items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-gray-600 transition hover:bg-lightPrimary disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-navy-700"
        >
          Selanjutnya
          <MdChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/** Render SKU sebagai link yang bisa diklik & buka tab baru kalau isinya berupa URL. */
export const SkuCell = ({ sku }: { sku?: string }) => {
  if (!sku || !sku.trim()) return <>-</>;
  const trimmed = sku.trim();
  const isLink = /^https?:\/\//i.test(trimmed);
  if (!isLink) return <>{trimmed}</>;
  return (
    <a
      href={trimmed}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-brand-500 underline decoration-dotted underline-offset-2 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
      title={trimmed}
    >
      Lihat SKU
    </a>
  );
};
