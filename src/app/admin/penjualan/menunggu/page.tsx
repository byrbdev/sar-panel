'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import OrderDetailModal from 'components/admin/default/OrderDetailModal';
import { useScopedData } from 'hooks/useScopedData';
import { OrderRow } from 'variables/dropshipTables';
import { MdArrowBack } from 'react-icons/md';

const MenungguDiprosesPage = () => {
  const { orders } = useScopedData();
  const router = useRouter();
  const [selected, setSelected] = React.useState<OrderRow | null>(null);

  return (
    <div className="mt-3">
      <button
        onClick={() => router.push('/admin/penjualan')}
        className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-600 transition duration-150 hover:text-brand-500 dark:text-gray-300 dark:hover:text-white"
      >
        <MdArrowBack className="h-4 w-4" />
        Kembali ke Penjualan
      </button>

      <Card extra="w-full h-full px-6 pb-6">
        <div className="pt-4">
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            Laporan Menunggu Diproses Admin
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Klik baris untuk detail laporan
          </p>
        </div>

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {['NAMA', 'TOKO', 'PRODUK', 'VARIAN', 'SKU'].map((h) => (
                  <th
                    key={h}
                    className="border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 text-start"
                  >
                    <p className="truncate text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                      {h}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada laporan yang sedang menunggu.
                  </td>
                </tr>
              ) : (
                orders.map((row) => (
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
                        {row.toko}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                        {row.produk}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                        {row.varian}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate font-mono text-xs font-bold text-brand-500 dark:text-white">
                        {row.sku}
                      </p>
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
        title="Detail Laporan"
      >
        {selected && <OrderDetailModal order={selected} />}
      </ModalOverlay>
    </div>
  );
};

export default MenungguDiprosesPage;
