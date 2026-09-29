'use client';
import React from 'react';
import Card from 'components/card';
import PaginationControl from 'components/pagination/PaginationControl';
import { usePagination } from 'hooks/usePagination';
import { useMemberName } from 'hooks/useMemberName';
import { Penjualan } from 'variables/dropshipPenjualan';
import { MdSearch, MdLocalShipping } from 'react-icons/md';

/**
 * Tabel Resi (dipakai bersama oleh view Admin/Super Admin dan view Member).
 * Kolom: Member - Toko - No Pesanan - Pembeli - Produk - Aksi.
 * Pencarian: no pesanan, nama pembeli, atau toko.
 */
const ResiTable = (props: {
  rows: Penjualan[];
  showMember: boolean;
  subtitle: string;
  renderAction: (row: Penjualan) => React.ReactNode;
  /** Jumlah yang ditampilkan di badge (default: semua baris) */
  pendingCount?: number;
}) => {
  const { rows, showMember, subtitle, renderAction, pendingCount } = props;
  const { resolve: resolveMember } = useMemberName();
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        (r.noPesananAL || '').toLowerCase().includes(term) ||
        r.namaPembeli.toLowerCase().includes(term) ||
        r.namaToko.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const { page, totalPages, pageData, next, prev, reset } = usePagination(
    filtered,
    10,
  );

  React.useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const headers = [
    ...(showMember ? [{ label: 'MEMBER', cls: 'hidden lg:table-cell' }] : []),
    { label: 'TOKO', cls: 'hidden md:table-cell' },
    { label: 'NO PESANAN', cls: '' },
    { label: 'PEMBELI', cls: '' },
    { label: 'PRODUK', cls: 'hidden sm:table-cell' },
    { label: 'AKSI', cls: 'text-center' },
  ];

  return (
    <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
      <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-navy-700 dark:text-white">
            Resi
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              {pendingCount ?? rows.length} belum ada resi
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:!bg-navy-700 md:w-[320px]">
          <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no pesanan, pembeli, toko..."
            className="h-full w-full bg-white/0 text-sm text-navy-700 outline-none placeholder:text-gray-500 dark:!bg-navy-700 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-6 w-full">
        <table className="w-full table-fixed">
          <thead>
            <tr className="!border-px !border-gray-400">
              {headers.map(({ label, cls }) => (
                <th
                  key={label}
                  className={`border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 ${cls} ${label === 'AKSI' ? '' : 'text-start'}`}
                >
                  <p className="truncate text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {label}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="py-10 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <MdLocalShipping className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                  {rows.length === 0
                    ? 'Tidak ada penjualan yang perlu resi.'
                    : 'Tidak ada data yang cocok dengan pencarian.'}
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={row.id}
                  className="transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
                >
                  {showMember && (
                    <td className="hidden border-white/0 py-3 pr-2 lg:table-cell">
                      <p className="truncate text-xs font-bold text-brand-500 dark:text-white sm:text-sm">
                        {resolveMember(row.ownerId, row.namaToko)}
                      </p>
                    </td>
                  )}
                  <td className="hidden border-white/0 py-3 pr-2 md:table-cell">
                    <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-300">
                      {row.namaToko}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-2">
                    <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                      {row.noPesananAL || '-'}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-2">
                    <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                      {row.namaPembeli}
                    </p>
                  </td>
                  <td className="hidden border-white/0 py-3 pr-2 sm:table-cell">
                    <p className="truncate text-sm font-medium text-navy-700 dark:text-white">
                      {row.namaProduk}
                    </p>
                    {row.produkList && row.produkList.length > 0 && (
                      <p className="truncate text-[11px] font-medium text-brand-500 dark:text-brand-300">
                        +{row.produkList.length} produk lain
                      </p>
                    )}
                  </td>
                  <td className="border-white/0 py-3 pr-2">
                    <div className="flex items-center justify-center">
                      {renderAction(row)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControl
        page={page}
        totalPages={totalPages}
        onPrev={prev}
        onNext={next}
      />
    </Card>
  );
};

export default ResiTable;
