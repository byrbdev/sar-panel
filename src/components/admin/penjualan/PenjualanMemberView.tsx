'use client';
import React from 'react';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import PenjualanDetailModal from 'components/admin/penjualan/PenjualanDetailModal';
import LaporPenjualanForm, {
  emptyLaporForm,
  LaporPenjualanValue,
} from 'components/admin/penjualan/LaporPenjualanForm';
import { useAppData } from 'context/AppDataContext';
import { useAuth } from 'context/AuthContext';
import { useScopedData } from 'hooks/useScopedData';
import { useUI } from 'context/UIContext';
import { StatusPengiriman, Penjualan } from 'variables/dropshipPenjualan';
import { MdAdd, MdSearch, MdSend } from 'react-icons/md';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const statusStyle: Record<StatusPengiriman, string> = {
  Masuk: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300',
  Terkirim:
    'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
  Refund: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300',
};

const PenjualanMemberView = () => {
  const { profile } = useAuth();
  const { setOrders, orders: allOrders } = useAppData();
  const { toko, penjualan, orders } = useScopedData();
  const { notify } = useUI();
  const [search, setSearch] = React.useState('');

  const daftarTokoSaya = toko.map((t) => t.namaToko);

  const [formOpen, setFormOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Penjualan | null>(null);
  const [form, setForm] = React.useState<LaporPenjualanValue>(
    emptyLaporForm(daftarTokoSaya[0] || ''),
  );

  const openLapor = () => {
    setForm(emptyLaporForm(daftarTokoSaya[0] || ''));
    setFormOpen(true);
  };

  const handleSubmitLapor = () => {
    if (!form.nama || !form.toko || !form.produk) {
      notify('Nama, Toko, dan Produk wajib diisi.', 'error');
      return;
    }
    const newId = 'PM-' + Date.now();
    setOrders([
      {
        id: newId,
        reporterId: profile?.id,
        nama: form.nama,
        toko: form.toko,
        produk: form.produk,
        varian: form.varian,
        sku: form.sku,
        noHp: form.noHp,
        alamat: form.alamat,
        keterangan: form.keterangan,
        noPesananAL: form.noPesananAL,
        hargaJual: 0,
        modal: 0,
        tanggal: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      },
      ...allOrders,
    ]);
    setFormOpen(false);
    notify(
      'Laporan penjualan terkirim ke Admin. Status: Menunggu diproses.',
      'success',
    );
  };

  const filteredPenjualan = penjualan.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.namaPembeli.toLowerCase().includes(term) ||
      p.namaProduk.toLowerCase().includes(term) ||
      p.namaToko.toLowerCase().includes(term)
    );
  });

  const summary = React.useMemo(
    () => ({
      omzet: filteredPenjualan.reduce((a, r) => a + r.hargaJual, 0),
      profit: filteredPenjualan.reduce(
        (a, r) => a + (r.hargaJual - r.modalShopee),
        0,
      ),
      menunggu: orders.length,
    }),
    [filteredPenjualan, orders],
  );

  return (
    <div className="mt-3 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Omzet Toko Saya
            </p>
            <p className="truncate text-lg font-bold text-navy-700 dark:text-white">
              {formatRupiah(summary.omzet)}
            </p>
          </div>
        </Card>
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Profit Toko Saya
            </p>
            <p className="truncate text-lg font-bold text-green-500">
              {formatRupiah(summary.profit)}
            </p>
          </div>
        </Card>
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Menunggu Diproses Admin
            </p>
            <p className="truncate text-lg font-bold text-amber-500">
              {summary.menunggu} laporan
            </p>
          </div>
        </Card>
      </div>

      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Penjualan Toko Saya
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lihat status transaksi & lapor penjualan baru ke Admin
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:bg-navy-700 sm:w-[240px]">
              <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pembeli, produk, toko..."
                className="h-full w-full bg-transparent text-sm text-navy-700 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={openLapor}
              disabled={daftarTokoSaya.length === 0}
              className="linear flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-400 dark:hover:bg-brand-300"
            >
              <MdAdd className="h-5 w-5" />
              Lapor Penjualan
            </button>
          </div>
        </div>

        {daftarTokoSaya.length === 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            Belum ada toko yang di-setting sebagai milik kamu. Hubungi Super
            Admin untuk mengaitkan toko ke akunmu.
          </div>
        )}

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {['PRODUK', 'TOKO', 'PEMBELI', 'OMZET', 'PROFIT', 'STATUS'].map(
                  (h) => (
                    <th
                      key={h}
                      className={`border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 ${h === 'STATUS' ? 'text-center' : 'text-start'}`}
                    >
                      <p className="truncate text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                        {h}
                      </p>
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filteredPenjualan.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Belum ada transaksi tercatat untuk toko kamu.
                  </td>
                </tr>
              ) : (
                filteredPenjualan.map((row) => {
                  const profit = row.hargaJual - row.modalShopee;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className="cursor-pointer hover:bg-lightPrimary dark:hover:bg-navy-700"
                    >
                      <td className="border-white/0 py-3 pr-2">
                        <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                          {row.namaProduk}
                        </p>
                      </td>
                      <td className="border-white/0 py-3 pr-2">
                        <p className="truncate text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                          {row.namaToko}
                        </p>
                      </td>
                      <td className="border-white/0 py-3 pr-2">
                        <p className="truncate text-xs text-navy-700 dark:text-white sm:text-sm">
                          {row.namaPembeli}
                        </p>
                      </td>
                      <td className="border-white/0 py-3 pr-2">
                        <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                          {formatRupiah(row.hargaJual)}
                        </p>
                      </td>
                      <td className="border-white/0 py-3 pr-2">
                        <p className="truncate text-xs font-bold text-green-500 sm:text-sm">
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ModalOverlay
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Lapor Penjualan Baru"
        maxWidthClass="max-w-[640px]"
      >
        <LaporPenjualanForm
          value={form}
          onChange={setForm}
          daftarToko={daftarTokoSaya}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setFormOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={handleSubmitLapor}
            className="linear flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            <MdSend className="h-4 w-4" />
            Kirim ke Admin
          </button>
        </div>
      </ModalOverlay>

      <ModalOverlay
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Penjualan"
        maxWidthClass="max-w-[640px]"
      >
        {selected && <PenjualanDetailModal penjualan={selected} />}
      </ModalOverlay>
    </div>
  );
};

export default PenjualanMemberView;
