'use client';
import React from 'react';
import PaginationControl from 'components/pagination/PaginationControl';
import ModalOverlay from 'components/modal/ModalOverlay';
import DendaDetailModal from 'components/admin/denda/DendaDetailModal';
import { usePagination } from 'hooks/usePagination';
import { DendaToko } from 'variables/dropshipDenda';
import { formatDenda } from 'utils/dendaHelpers';
import { MdDelete, MdEdit } from 'react-icons/md';

/**
 * Tabel Denda Toko -- dipakai Super Admin (dengan kolom Pemilik + Aksi) dan
 * Member (tanpa keduanya).
 */
const DendaTable = (props: {
  rows: DendaToko[];
  showPemilik?: boolean;
  onEdit?: (row: DendaToko) => void;
  onDelete?: (row: DendaToko) => void;
  emptyText: string;
}) => {
  const { rows, showPemilik, onEdit, onDelete, emptyText } = props;
  const { page, totalPages, pageData, next, prev } = usePagination(rows, 10);
  const withAksi = !!(onEdit || onDelete);
  const [detail, setDetail] = React.useState<DendaToko | null>(null);

  const cols = [
    { label: 'TANGGAL', hide: 'hidden sm:table-cell' },
    { label: 'TOKO', hide: '' },
    ...(showPemilik
      ? [{ label: 'PEMILIK', hide: 'hidden md:table-cell' }]
      : []),
    { label: 'KETERANGAN', hide: 'hidden md:table-cell' },
    { label: 'JUMLAH DENDA', hide: '' },
    ...(withAksi ? [{ label: 'AKSI', hide: '' }] : []),
  ];

  return (
    <>
      <div className="mt-6 w-full">
        <table className="w-full table-fixed">
          <thead>
            <tr className="!border-px !border-gray-400">
              {cols.map(({ label, hide }) => (
                <th
                  key={label}
                  className={`border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 ${hide} ${
                    label === 'AKSI' ? 'text-center' : 'text-start'
                  }`}
                >
                  <p className="truncate text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {label}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={cols.length}
                  className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setDetail(row)}
                  className="cursor-pointer transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
                >
                  <td className="hidden border-white/0 py-3 pr-2 sm:table-cell">
                    <p className="truncate text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                      {row.tanggal}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-2">
                    <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                      {row.namaToko}
                    </p>
                    {/* di layar kecil kolom Keterangan disembunyikan, tampilkan di bawah nama toko */}
                    {row.keterangan && (
                      <p className="truncate text-[11px] text-gray-500 dark:text-gray-400 md:hidden">
                        {row.keterangan}
                      </p>
                    )}
                  </td>
                  {showPemilik && (
                    <td className="hidden border-white/0 py-3 pr-2 md:table-cell">
                      <p className="truncate text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                        {row.pemilik || '-'}
                      </p>
                    </td>
                  )}
                  <td className="hidden border-white/0 py-3 pr-2 md:table-cell">
                    <p
                      className="truncate text-xs text-gray-600 dark:text-gray-300 sm:text-sm"
                      title={row.keterangan || ''}
                    >
                      {row.keterangan || '-'}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-2">
                    <p className="truncate text-xs font-bold text-red-500 sm:text-sm">
                      {formatDenda(row.jumlah)}
                    </p>
                  </td>
                  {withAksi && (
                    <td className="border-white/0 py-3 pr-2">
                      <div className="flex flex-nowrap items-center justify-center gap-1">
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            className="rounded-lg p-2 text-gray-600 transition duration-150 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                          >
                            <MdEdit className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                            className="rounded-lg p-2 text-red-500 transition duration-150 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <MdDelete className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
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

      {/* Detail Denda (read only) */}
      <ModalOverlay
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Denda"
      >
        {detail && <DendaDetailModal denda={detail} />}
      </ModalOverlay>
    </>
  );
};

export default DendaTable;
