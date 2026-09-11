'use client';
import React from 'react';
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
import { OrderRow } from 'variables/dropshipTables';
import {
  MdAssignmentReturn,
  MdShoppingCartCheckout,
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';

const PAGE_SIZE = 8;

const PesananMasukPage = () => {
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
  const { notify } = useUI();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);

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

  const filtered = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      o.nama.toLowerCase().includes(term) ||
      o.produk.toLowerCase().includes(term) ||
      o.toko.toLowerCase().includes(term) ||
      o.sku.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      { id: newId, ownerId: getOwnerId(finalForm.namaToko), ...finalForm },
      ...penjualan,
    ]);
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
      { id: newId, ownerId: getOwnerId(refundForm.namaToko), ...refundForm },
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

  return (
    <div className="mt-3">
      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Detail Pesanan Masuk
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Semua pesanan masuk dari seluruh toko
            </p>
          </div>
          <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:bg-navy-700 sm:w-[280px]">
            <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, produk, toko, atau SKU..."
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
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada pesanan yang cocok.
                  </td>
                </tr>
              ) : (
                pageData.map((row) => (
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

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg bg-lightPrimary px-3 py-2 text-sm font-medium text-gray-600 transition duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-navy-700 dark:text-white"
              >
                <MdChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg bg-lightPrimary px-3 py-2 text-sm font-medium text-gray-600 transition duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-navy-700 dark:text-white"
              >
                Berikutnya
                <MdChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <ModalOverlay
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Pesanan Masuk"
      >
        {selected && <OrderDetailModal order={selected} />}
      </ModalOverlay>

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
    </div>
  );
};

export default PesananMasukPage;
