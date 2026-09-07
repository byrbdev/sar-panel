'use client';
import React from 'react';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import PenjualanForm, {
  emptyForm,
  PenjualanFormValue,
} from 'components/admin/penjualan/PenjualanForm';
import PenjualanDetailModal from 'components/admin/penjualan/PenjualanDetailModal';
import RefundForm, {
  emptyRefundForm,
  RefundFormValue,
} from 'components/admin/refund/RefundForm';
import { Penjualan, StatusPengiriman } from 'variables/dropshipPenjualan';
import { useAppData } from 'context/AppDataContext';
import { useUI } from 'context/UIContext';
import {
  MdAdd,
  MdSearch,
  MdDelete,
  MdEdit,
  MdAssignmentReturn,
  MdShoppingCart,
  MdTrendingUp,
  MdAttachMoney,
} from 'react-icons/md';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const statusStyle: Record<StatusPengiriman, string> = {
  Masuk: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300',
  Terkirim:
    'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
  Refund: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300',
};

const PenjualanAdminView = () => {
  const {
    penjualan: data,
    setPenjualan: setData,
    refund,
    setRefund,
    getTokoEmail,
    toko,
  } = useAppData();
  const { notify, confirm } = useUI();
  const [search, setSearch] = React.useState('');

  const getOwnerId = (namaToko: string) =>
    toko.find((t) => t.namaToko === namaToko)?.ownerId;

  // Tambah / Edit
  const [formOpen, setFormOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<PenjualanFormValue>(emptyForm);

  // Refund dari transaksi yang sudah diproses
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [refundTargetId, setRefundTargetId] = React.useState<string | null>(
    null,
  );
  const [refundForm, setRefundForm] = React.useState<RefundFormValue>(
    emptyRefundForm(),
  );

  // Detail (klik baris)
  const [selected, setSelected] = React.useState<Penjualan | null>(null);

  const filteredData = data.filter((row) => {
    const term = search.toLowerCase();
    return (
      row.namaPembeli.toLowerCase().includes(term) ||
      row.namaProduk.toLowerCase().includes(term) ||
      row.noResi.toLowerCase().includes(term) ||
      row.namaToko.toLowerCase().includes(term) ||
      row.statusAkunToko.toLowerCase().includes(term) ||
      row.statusPengiriman.toLowerCase().includes(term)
    );
  });

  const summary = React.useMemo(
    () => ({
      omzet: filteredData.reduce((a, r) => a + r.hargaJual, 0),
      profit: filteredData.reduce(
        (a, r) => a + (r.hargaJual - r.modalShopee),
        0,
      ),
      total: filteredData.length,
    }),
    [filteredData],
  );

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (e: React.MouseEvent, row: Penjualan) => {
    e.stopPropagation();
    const { id, ...rest } = row;
    setEditId(id);
    setForm(rest);
    setFormOpen(true);
  };

  const openRefund = (e: React.MouseEvent, row: Penjualan) => {
    e.stopPropagation();
    setRefundTargetId(row.id);
    setRefundForm({
      ...emptyRefundForm(),
      nama: row.namaPembeli,
      namaToko: row.namaToko,
      emailToko: getTokoEmail(row.namaToko),
      noHp: row.noHp,
      sku: row.skuProduk,
      namaProduk: row.namaProduk,
      omzet: row.hargaJual,
      profit: row.hargaJual - row.modalShopee,
      alamat: row.alamatPembeli,
    });
    setRefundOpen(true);
  };

  const saveRefundFromPenjualan = () => {
    if (!refundTargetId) return;
    const targetRow = data.find((r) => r.id === refundTargetId);
    const newId = 'RF-' + Date.now();
    setRefund([
      { id: newId, ownerId: targetRow?.ownerId, ...refundForm },
      ...refund,
    ]);
    // Nolkan Omzet & Profit transaksi ini dan ubah statusnya jadi Refund
    setData(
      data.map((row) =>
        row.id === refundTargetId
          ? { ...row, hargaJual: 0, modalShopee: 0, statusPengiriman: 'Refund' }
          : row,
      ),
    );
    setRefundOpen(false);
    setRefundTargetId(null);
    notify(
      'Transaksi berhasil di-refund dan tersimpan di halaman Refund.',
      'success',
    );
  };

  const handleSave = () => {
    // Jika status diganti jadi Refund, Omzet & Profit (hargaJual & modalShopee) dihapus/dinolkan
    const finalForm: PenjualanFormValue =
      form.statusPengiriman === 'Refund'
        ? { ...form, hargaJual: 0, modalShopee: 0 }
        : form;

    if (editId) {
      setData(
        data.map((row) =>
          row.id === editId
            ? { ...finalForm, id: editId, ownerId: getOwnerId(finalForm.namaToko) }
            : row,
        ),
      );
      notify('Perubahan data penjualan berhasil disimpan.', 'success');
    } else {
      const newId = String(
        data.length ? Math.max(...data.map((d) => Number(d.id))) + 1 : 1,
      );
      setData([
        { ...finalForm, id: newId, ownerId: getOwnerId(finalForm.namaToko) },
        ...data,
      ]);
      notify('Penjualan baru berhasil ditambahkan.', 'success');
    }
    setFormOpen(false);
    setEditId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const row = data.find((d) => d.id === id);
    const ok = await confirm(
      `Data penjualan "${row?.namaProduk}" akan dihapus secara permanen.`,
      {
        title: 'Hapus Data Penjualan?',
        confirmText: 'Ya, Hapus',
        danger: true,
      },
    );
    if (!ok) return;
    setData(data.filter((row) => row.id !== id));
    setSelected(null);
    notify('Data penjualan berhasil dihapus.', 'info');
  };

  return (
    <div className="mt-3 flex flex-col gap-5">
      {/* Summary strip */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdAttachMoney className="h-6 w-6 text-brand-500 dark:text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Omzet (hasil pencarian)
            </p>
            <p className="text-lg font-bold text-navy-700 dark:text-white">
              {formatRupiah(summary.omzet)}
            </p>
          </div>
        </Card>
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdTrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Profit Bersih
            </p>
            <p className="text-lg font-bold text-green-500">
              {formatRupiah(summary.profit)}
            </p>
          </div>
        </Card>
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdShoppingCart className="h-6 w-6 text-brand-500 dark:text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Total Transaksi
            </p>
            <p className="text-lg font-bold text-navy-700 dark:text-white">
              {summary.total} transaksi
            </p>
          </div>
        </Card>
      </div>

      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Penjualan
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Klik baris untuk detail transaksi
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:bg-navy-700 sm:w-[280px]">
              <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pembeli, produk, toko, status (Aktif/Ban)..."
                className="h-full w-full bg-transparent text-sm text-navy-700 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={openAdd}
              className="linear flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
            >
              <MdAdd className="h-5 w-5" />
              Tambah Penjualan
            </button>
          </div>
        </div>

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {[
                  { label: 'PRODUK', hide: '' },
                  { label: 'TOKO', hide: 'hidden md:table-cell' },
                  { label: 'PEMBELI', hide: 'hidden lg:table-cell' },
                  { label: 'PENGHASILAN', hide: 'hidden sm:table-cell' },
                  { label: 'PROFIT', hide: '' },
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
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data penjualan yang cocok.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const profit = row.hargaJual - row.modalShopee;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className="cursor-pointer transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
                    >
                      <td className="border-white/0 py-3 pr-2">
                        <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                          {row.namaProduk}
                        </p>
                        {row.skuProduk && (
                          <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                            SKU: {row.skuProduk}
                          </p>
                        )}
                      </td>
                      <td className="hidden border-white/0 py-3 pr-2 md:table-cell">
                        <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-300">
                          {row.namaToko}
                        </p>
                      </td>
                      <td className="hidden border-white/0 py-3 pr-2 lg:table-cell">
                        <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                          {row.namaPembeli}
                        </p>
                        {row.noHp && (
                          <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                            {row.noHp}
                          </p>
                        )}
                      </td>
                      <td className="hidden border-white/0 py-3 pr-2 sm:table-cell">
                        <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                          {formatRupiah(row.hargaJual)}
                        </p>
                      </td>
                      <td className="border-white/0 py-3 pr-2">
                        <p
                          className={`truncate text-xs font-bold sm:text-sm ${
                            profit >= 0
                              ? 'text-green-500 dark:text-green-400'
                              : 'text-red-500 dark:text-red-400'
                          }`}
                        >
                          {formatRupiah(profit)}
                        </p>
                      </td>
                      <td className="border-white/0 py-3 pr-2 text-center">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold sm:px-3 sm:text-xs ${statusStyle[row.statusPengiriman]}`}
                        >
                          {row.statusPengiriman}
                        </span>
                      </td>
                      <td className="border-white/0 py-3 pr-2">
                        <div className="flex flex-nowrap items-center justify-center gap-1">
                          <button
                            onClick={(e) => openEdit(e, row)}
                            className="rounded-lg p-2 text-gray-600 transition duration-150 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                          >
                            <MdEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => openRefund(e, row)}
                            className="rounded-lg p-2 text-amber-500 transition duration-150 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                          >
                            <MdAssignmentReturn className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, row.id)}
                            className="rounded-lg p-2 text-red-500 transition duration-150 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <MdDelete className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah / Edit */}
      <ModalOverlay
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editId ? 'Edit Penjualan' : 'Tambah Penjualan'}
        maxWidthClass="max-w-[640px]"
      >
        <PenjualanForm value={form} onChange={setForm} />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setFormOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="linear rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            {editId ? 'Simpan Perubahan' : 'Simpan Penjualan'}
          </button>
        </div>
      </ModalOverlay>

      {/* Modal Detail (klik baris) */}
      <ModalOverlay
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Penjualan"
      >
        {selected && <PenjualanDetailModal penjualan={selected} />}
      </ModalOverlay>

      {/* Modal Refund dari transaksi yang sudah diproses */}
      <ModalOverlay
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="Refund Transaksi"
        maxWidthClass="max-w-[640px]"
      >
        <RefundForm value={refundForm} onChange={setRefundForm} fromPenjualan />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setRefundOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={saveRefundFromPenjualan}
            className="linear rounded-lg bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700"
          >
            Simpan Refund
          </button>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default PenjualanAdminView;
