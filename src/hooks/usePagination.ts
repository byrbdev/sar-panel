'use client';
import { useMemo, useState } from 'react';

/**
 * Paginasi client-side sederhana. Dipakai di tabel-tabel yang berpotensi
 * punya banyak baris (Toko, Penjualan, Refund, Data Buyer) supaya browser
 * tidak me-render ratusan/ribuan baris sekaligus — cukup 1 halaman saja
 * yang di-render ke DOM.
 */
export function usePagination<T>(data: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageData = useMemo(
    () => data.slice((safePage - 1) * pageSize, safePage * pageSize),
    [data, safePage, pageSize],
  );

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return {
    page: safePage,
    totalPages,
    pageData,
    goTo,
    next: () => goTo(safePage + 1),
    prev: () => goTo(safePage - 1),
    reset: () => setPage(1),
  };
}
