'use client';
import React from 'react';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import RefundDetailModal from 'components/admin/refund/RefundDetailModal';
import { useScopedData } from 'hooks/useScopedData';
import { RefundRow, RefundStatus } from 'variables/dropshipRefund';
import { MdSearch } from 'react-icons/md';

const statusStyle: Record<RefundStatus, string> = {
  Belum: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300',
  Proses:
    'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-300',
  Selesai:
    'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
};

const RefundMemberView = () => {
  const { refund: data } = useScopedData();
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<RefundRow | null>(null);

  const filtered = data.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.nama.toLowerCase().includes(term) ||
      r.namaToko.toLowerCase().includes(term)
    );
  });

  return (
    <div className="mt-3">
      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Refund Toko Saya
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Klik baris untuk detail (read-only)
            </p>
          </div>
          <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:bg-navy-700 sm:w-[260px]">
            <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, toko..."
              className="h-full w-full bg-transparent text-sm text-navy-700 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {['NAMA', 'NAMA TOKO', 'ALASAN', 'STATUS'].map((h) => (
                  <th
                    key={h}
                    className={`border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 ${h === 'STATUS' ? 'text-center' : 'text-start'}`}
                  >
                    <p className="truncate text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                      {h}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Belum ada data refund untuk toko kamu.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(row)}
                    className="cursor-pointer transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
                  >
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                        {row.nama}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                        {row.namaToko}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                        {row.alasan}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2 text-center">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold sm:px-3 sm:text-xs ${statusStyle[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ModalOverlay
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Refund"
        maxWidthClass="max-w-[640px]"
      >
        {selected && <RefundDetailModal refund={selected} />}
      </ModalOverlay>
    </div>
  );
};

export default RefundMemberView;
