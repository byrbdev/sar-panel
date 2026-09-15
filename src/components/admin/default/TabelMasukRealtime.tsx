'use client';
import React from 'react';
import Link from 'next/link';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import OrderDetailModal from 'components/admin/default/OrderDetailModal';
import PenjualanForm, {
  PenjualanFormValue,
} from 'components/admin/penjualan/PenjualanForm';
import RefundForm, {
  emptyRefundForm,
  RefundFormValue,
} from 'components/admin/refund/RefundForm';
import { useAppData } from 'context/AppDataContext';
import { useUI } from 'context/UIContext';
import { useMemberName } from 'hooks/useMemberName';
import { OrderRow } from 'variables/dropshipTables';
import { MdAssignmentReturn, MdShoppingCartCheckout } from 'react-icons/md';

export default function TabelMasukRealtime() {
  const {
    orders,
    setOrders,
    penjualan,
    setPenjualan,
    refund,
    setRefund,
    getTokoEmail,
    toko,
  } = useAppData();
  const { notify, confirm } = useUI();
  const { resolve: resolveMember } = useMemberName();

  const getOwnerId = (namaToko: string) =>
    toko.find((t) => t.namaToko === namaToko)?.ownerId;

  const [selected, setSelected] = React.useState<OrderRow | null>(null);
  const [prosesOpen, setProsesOpen] = React.useState(false);
  const [prosesOrder, setProsesOrder] = React.useState<OrderRow | null>(null);
  const [form, setForm] = React.useState<PenjualanFormValue | null>(null);

  const [refundOpen, setRefundOpen] = React.useState(false);
  const [refundOrderData, setRefundOrderData] = React.useState<OrderRow | null>(
    null,
  );
  const [refundForm, setRefundForm] = React.useState<RefundFormValue>(
    emptyRefundForm(),
  );

  const openProses = (e: React.MouseEvent, order: OrderRow) => {
    e.stopPropagation();
    setProsesOrder(order);
    setForm({
      namaToko: order.toko,
      namaPembeli: order.nama,
      noHp: order.noHp,
      alamatPembeli: order.alamat,
      namaProduk: order.produk,
      skuProduk: order.sku,
      noPesananAL: order.noPesananAL || '',
      hargaJual: order.hargaJual,
      modalShopee: order.modal,
      noResi: '',
      jasaPengiriman: 'Shopee Express',
      statusPengiriman: 'Terkirim',
      statusAkunToko: 'Aktif',
      tanggalTransaksi: order.tanggal,
    });
    setProsesOpen(true);
  };

  const saveProses = () => {
    if (!form || !prosesOrder) return;
    const finalForm =
      form.statusPengiriman === 'Refund'
        ? { ...form, hargaJual: 0, modalShopee: 0 }
        : form;
    const newId = String(
      penjualan.length
        ? Math.max(...penjualan.map((p) => Number(p.id))) + 1
        : 1,
    );
    setPenjualan([
      {
        ...finalForm,
        id: newId,
        ownerId: getOwnerId(finalForm.namaToko),
      },
      ...penjualan,
    ]);
    // Hapus dari Pesanan Masuk setelah berhasil diproses
    setOrders(orders.filter((o) => o.id !== prosesOrder.id));
    setProsesOpen(false);
    setProsesOrder(null);
    notify('Pesanan berhasil diproses dan tersimpan di Penjualan.', 'success');
  };

  const handleRefund = (e: React.MouseEvent, order: OrderRow) => {
    e.stopPropagation();
    setRefundOrderData(order);
    setRefundForm({
      ...emptyRefundForm(),
      nama: order.nama,
      namaToko: order.toko,
      emailToko: getTokoEmail(order.toko),
      noHp: order.noHp,
      sku: order.sku,
      noPesananAL: order.noPesananAL || '-',
    });
    setRefundOpen(true);
  };

  const saveRefund = () => {
    if (!refundOrderData) return;
    const newId = 'RF-' + Date.now();
    setRefund([
      { ...refundForm, id: newId, ownerId: getOwnerId(refundForm.namaToko) },
      ...refund,
    ]);
    setOrders(orders.filter((o) => o.id !== refundOrderData.id));
    setRefundOpen(false);
    setRefundOrderData(null);
    notify(
      'Pesanan berhasil di-refund dan tersimpan di halaman Refund.',
      'success',
    );
  };

  const displayed = orders.slice(0, 5);

  return (
    <Card extra={'w-full h-full px-6 pb-6 sm:overflow-x-auto'}>
      <div className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Pesanan Masuk Realtime
        </div>
        <Link
          href="/admin/pesanan-masuk"
          className="linear rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="mt-8 w-full">
        <table className="w-full table-fixed">
          <thead>
            <tr className="!border-px !border-gray-400">
              {[
                { label: 'MEMBER', hide: 'hidden lg:table-cell' },
                { label: 'NAMA', hide: '' },
                { label: 'TOKO', hide: 'hidden sm:table-cell' },
                { label: 'PRODUK', hide: '' },
                { label: 'VARIAN', hide: 'hidden md:table-cell' },
                { label: 'SKU', hide: 'hidden sm:table-cell' },
                { label: 'AKSI', hide: '' },
              ].map(({ label: h, hide }) => (
                <th
                  key={h}
                  className={`border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 ${hide} ${h === 'AKSI' ? 'text-center' : 'text-start'}`}
                >
                  <p className="truncate text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {h}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Tidak ada pesanan masuk saat ini.
                </td>
              </tr>
            ) : (
              displayed.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row)}
                  className="cursor-pointer transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
                >
                  <td className="hidden border-white/0 py-3 pr-2 lg:table-cell">
                    <p className="truncate text-xs font-bold text-brand-500 dark:text-white sm:text-sm">
                      {resolveMember(row.reporterId, row.toko)}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-2">
                    <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                      {row.nama}
                    </p>
                  </td>
                  <td className="hidden border-white/0 py-3 pr-2 sm:table-cell">
                    <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-300">
                      {row.toko}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-2">
                    <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                      {row.produk}
                    </p>
                  </td>
                  <td className="hidden border-white/0 py-3 pr-2 md:table-cell">
                    <p className="truncate text-sm text-gray-600 dark:text-gray-300">
                      {row.varian}
                    </p>
                  </td>
                  <td className="hidden border-white/0 py-3 pr-2 sm:table-cell">
                    <p className="truncate font-mono text-xs font-bold text-brand-500 dark:text-white">
                      {row.sku}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-2">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <button
                        onClick={(e) => openProses(e, row)}
                        className="flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1.5 text-[10px] font-bold text-brand-500 transition duration-150 hover:bg-brand-100 dark:bg-navy-700 dark:text-white sm:px-2.5 sm:text-xs"
                      >
                        <MdShoppingCartCheckout className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Proses</span>
                      </button>
                      <button
                        onClick={(e) => handleRefund(e, row)}
                        className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-[10px] font-bold text-red-500 transition duration-150 hover:bg-red-100 dark:bg-red-500/10 sm:px-2.5 sm:text-xs"
                      >
                        <MdAssignmentReturn className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Refund</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail read-only */}
      <ModalOverlay
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Pesanan Masuk"
      >
        {selected && <OrderDetailModal order={selected} />}
      </ModalOverlay>

      {/* Proses -> sama seperti overlay Tambah Penjualan */}
      <ModalOverlay
        open={prosesOpen}
        onClose={() => setProsesOpen(false)}
        title="Proses Jadi Penjualan"
        maxWidthClass="max-w-[640px]"
      >
        {form && (
          <PenjualanForm
            value={form}
            onChange={setForm}
            statusOptions={['Terkirim', 'Refund']}
          />
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setProsesOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={saveProses}
            className="linear rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            Simpan Penjualan
          </button>
        </div>
      </ModalOverlay>

      {/* Refund langsung dari Pesanan Masuk (belum pernah diproses) */}
      <ModalOverlay
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="Refund Pesanan"
        maxWidthClass="max-w-[640px]"
      >
        <RefundForm value={refundForm} onChange={setRefundForm} hideOrderNumbers />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setRefundOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={saveRefund}
            className="linear rounded-lg bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700"
          >
            Simpan Refund
          </button>
        </div>
      </ModalOverlay>
    </Card>
  );
}
