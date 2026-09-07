'use client';
import React from 'react';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import RefundDetailModal from 'components/admin/refund/RefundDetailModal';
import { useAppData } from 'context/AppDataContext';
import { useUI } from 'context/UIContext';
import { RefundRow, RefundStatus } from 'variables/dropshipRefund';
import { MdSearch, MdDelete } from 'react-icons/md';

const statusStyle: Record<RefundStatus, string> = {
  Belum: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300',
  Proses:
    'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-300',
  Selesai:
    'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
};

const statusLabel: Record<RefundStatus, string> = {
  Belum: 'Belum',
  Proses: 'Proses',
  Selesai: 'Selesai',
};

const RefundPage = () => {
  const { refund: data, setRefund: setData } = useAppData();
  const { notify, confirm } = useUI();
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<RefundRow | null>(null);

  const filtered = data.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.nama.toLowerCase().includes(term) ||
      r.namaToko.toLowerCase().includes(term) ||
      r.noPesananAL.toLowerCase().includes(term) ||
      r.noPesananSHP.toLowerCase().includes(term)
    );
  });

  const updateStatus = (id: string, status: RefundStatus) => {
    setData(data.map((r) => (r.id === id ? { ...r, status } : r)));
    notify('Status refund berhasil diperbarui.', 'success');
  };

  const handleDelete = async (e: React.MouseEvent, row: RefundRow) => {
    e.stopPropagation();
    const ok = await confirm(
      `Data refund untuk "${row.nama}" akan dihapus secara permanen.`,
      { title: 'Hapus Data Refund?', confirmText: 'Ya, Hapus', danger: true },
    );
    if (!ok) return;
    setData(data.filter((r) => r.id !== row.id));
    setSelected(null);
    notify('Data refund berhasil dihapus.', 'info');
  };

  return (
    <div className="mt-3">
      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Refund
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Daftar pesanan yang di-refund, baik sebelum maupun sesudah diproses
            </p>
          </div>
          <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:bg-navy-700 sm:w-[280px]">
            <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, toko, atau no pesanan..."
              className="h-full w-full bg-transparent text-sm text-navy-700 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {[
                  { label: 'NAMA', hide: '' },
                  { label: 'NAMA TOKO', hide: 'hidden sm:table-cell' },
                  { label: 'NO PESANAN AL', hide: 'hidden md:table-cell' },
                  { label: 'NO PESANAN SHP', hide: 'hidden lg:table-cell' },
                  { label: 'UPDATE NO PESANAN', hide: 'hidden lg:table-cell' },
                  { label: 'STATUS', hide: '' },
                  { label: 'AKSI', hide: '' },
                ].map(({ label: h, hide }) => (
                  <th
                    key={h}
                    className={`border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 ${hide} ${h === 'AKSI' || h === 'STATUS' ? 'text-center' : 'text-start'}`}
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
                    colSpan={7}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Belum ada data refund.
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
                    <td className="hidden border-white/0 py-3 pr-2 sm:table-cell">
                      <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-300">
                        {row.namaToko}
                      </p>
                    </td>
                    <td className="hidden border-white/0 py-3 pr-2 md:table-cell">
                      <p className="truncate font-mono text-xs text-gray-600 dark:text-gray-300">
                        {row.noPesananAL || '-'}
                      </p>
                    </td>
                    <td className="hidden border-white/0 py-3 pr-2 lg:table-cell">
                      <p className="truncate font-mono text-xs text-gray-600 dark:text-gray-300">
                        {row.noPesananSHP || '-'}
                      </p>
                    </td>
                    <td className="hidden border-white/0 py-3 pr-2 lg:table-cell">
                      <p className="truncate font-mono text-xs text-gray-600 dark:text-gray-300">
                        {row.updateNoPesanan || '-'}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2 text-center">
                      <select
                        value={row.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          updateStatus(row.id, e.target.value as RefundStatus)
                        }
                        className={`rounded-full border-none px-2 py-1.5 text-[10px] font-bold outline-none sm:px-3 sm:text-xs ${statusStyle[row.status]}`}
                      >
                        <option value="Belum">Belum</option>
                        <option value="Proses">Proses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <div className="flex flex-nowrap items-center justify-center gap-1">
                        <button
                          onClick={(e) => handleDelete(e, row)}
                          className="rounded-lg p-2 text-red-500 transition duration-150 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <MdDelete className="h-4 w-4" />
                        </button>
                      </div>
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

export default RefundPage;
