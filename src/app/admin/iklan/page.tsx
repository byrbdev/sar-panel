'use client';
import React from 'react';
import Card from 'components/card';
import Widget from 'components/widget/Widget';
import ModalOverlay from 'components/modal/ModalOverlay';
import IklanTopUpForm, {
  IklanFormValue,
  SimulasiProfit,
  emptyIklanForm,
} from 'components/admin/iklan/IklanTopUpForm';
import TanggalFilter, {
  emptyTanggalFilter,
  matchTanggalFilter,
} from 'components/admin/penjualan/TanggalFilter';
import PaginationControl from 'components/pagination/PaginationControl';
import { useAppData } from 'context/AppDataContext';
import { useAuth } from 'context/AuthContext';
import { useMember } from 'context/MemberContext';
import { useUI } from 'context/UIContext';
import { useBulanBerjalan } from 'hooks/useBulanBerjalan';
import { usePagination } from 'hooks/usePagination';
import { IklanTopUp } from 'variables/dropshipIklan';
import { bulanKeyOf, isInBulan } from 'utils/analisaHelpers';
import {
  formatRupiahBersih,
  ringkasProfitBulan,
  tanggalHariIni,
  topUpBulan,
  totalTopUp,
} from 'utils/iklanHelpers';
import {
  MdAdd,
  MdAddCard,
  MdCampaign,
  MdDelete,
  MdEdit,
  MdGroups,
  MdSearch,
} from 'react-icons/md';

const IklanPage = () => {
  const { profile } = useAuth();
  const { toko, penjualan, iklan, setIklan } = useAppData();
  const { memberOnly } = useMember();
  const { notify, confirm } = useUI();
  const bulanKey = useBulanBerjalan(); // ganti bulan otomatis tanpa refresh

  const [search, setSearch] = React.useState('');
  const [tanggalFilter, setTanggalFilter] = React.useState(emptyTanggalFilter);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<IklanFormValue>(emptyIklanForm());
  const [saving, setSaving] = React.useState(false);

  // ---------- Pemilik toko terpilih ----------
  const tokoDipilih = toko.find((t) => t.namaToko === form.namaToko);
  const ownerId = tokoDipilih?.ownerId;
  const namaPemilik = React.useMemo(() => {
    if (!tokoDipilih) return '';
    return (
      (ownerId && memberOnly.find((m) => m.id === ownerId)?.nama) ||
      tokoDipilih.nama ||
      ''
    );
  }, [tokoDipilih, ownerId, memberOnly]);

  // ---------- Simulasi profit bersih (badge di overlay) ----------
  const editing = editId ? iklan.find((t) => t.id === editId) : undefined;
  // Saat edit Top Up lama, simulasi memakai bulan Top Up itu, bukan bulan ini.
  const bulanSimulasi = editing
    ? bulanKeyOf(editing.tanggalIso, editing.tanggal)
    : bulanKey;
  const simulasi: SimulasiProfit | null = React.useMemo(() => {
    if (!tokoDipilih || !ownerId) return null;
    const topUpLain = iklan.filter((t) => t.id !== editId);
    const r = ringkasProfitBulan(
      penjualan,
      topUpLain,
      bulanSimulasi,
      toko,
      ownerId,
    );
    return {
      pemilik: namaPemilik,
      sebelum: r.profitBersih,
      sesudah: r.profitBersih - (form.jumlah || 0),
    };
  }, [
    tokoDipilih,
    ownerId,
    iklan,
    editId,
    penjualan,
    toko,
    namaPemilik,
    form.jumlah,
    bulanSimulasi,
  ]);

  // ---------- Ringkasan bulan ini ----------
  const topUpIni = React.useMemo(
    () => topUpBulan(iklan, bulanKey),
    [iklan, bulanKey],
  );
  const rekapMember = React.useMemo(
    () =>
      memberOnly
        .map((m) => ({
          id: m.id,
          nama: m.nama,
          ...ringkasProfitBulan(penjualan, iklan, bulanKey, toko, m.id),
        }))
        .filter((r) => r.profitKotor !== 0 || r.topUp !== 0)
        .sort((a, b) => a.profitBersih - b.profitBersih),
    [memberOnly, penjualan, iklan, bulanKey, toko],
  );

  // ---------- Daftar riwayat ----------
  // Bawaan: hanya Top Up bulan berjalan (reset tiap bulan). Pilih filter
  // tanggal untuk melihat riwayat bulan-bulan lama -- datanya tetap tersimpan.
  const filterAktif =
    !!tanggalFilter.tanggal || !!tanggalFilter.bulan || !!tanggalFilter.tahun;
  const filtered = iklan.filter((t) => {
    if (!filterAktif && !isInBulan(t.tanggalIso, t.tanggal, bulanKey))
      return false;
    if (!matchTanggalFilter(t.tanggal, tanggalFilter)) return false;
    const term = search.toLowerCase();
    return (
      t.namaToko.toLowerCase().includes(term) ||
      t.pemilik.toLowerCase().includes(term) ||
      (t.keterangan || '').toLowerCase().includes(term)
    );
  });
  const { page, totalPages, pageData, next, prev } = usePagination(filtered, 10);

  // ---------- Aksi ----------
  const openAdd = () => {
    setEditId(null);
    setForm(emptyIklanForm());
    setFormOpen(true);
  };
  const openEdit = (row: IklanTopUp) => {
    setEditId(row.id);
    setForm({
      namaToko: row.namaToko,
      jumlah: row.jumlah,
      keterangan: row.keterangan || '',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!tokoDipilih) return notify('Pilih toko terlebih dahulu.', 'error');
    if (!ownerId)
      return notify('Toko ini belum punya pemilik. Atur di halaman Toko.', 'error');
    if (!form.jumlah || form.jumlah <= 0)
      return notify('Jumlah Top Up harus lebih dari 0.', 'error');

    setSaving(true);
    const result = editing
      ? await setIklan((prev) =>
          prev.map((t) =>
            t.id === editing.id
              ? {
                  ...t,
                  tokoId: tokoDipilih.id,
                  namaToko: tokoDipilih.namaToko,
                  ownerId,
                  pemilik: namaPemilik,
                  jumlah: form.jumlah,
                  keterangan: form.keterangan.trim() || undefined,
                }
              : t,
          ),
        )
      : await setIklan((prev) => [
          {
            id: 'IK-' + Date.now(), // sementara; diganti id asli dari database
            tokoId: tokoDipilih.id,
            namaToko: tokoDipilih.namaToko,
            ownerId,
            pemilik: namaPemilik,
            jumlah: form.jumlah,
            keterangan: form.keterangan.trim() || undefined,
            tanggal: tanggalHariIni(),
          },
          ...prev,
        ]);
    setSaving(false);

    if (!result.ok) {
      notify(result.errors[0] || 'Top Up gagal disimpan.', 'error');
      return;
    }
    notify(
      editing
        ? 'Top Up berhasil diperbarui.'
        : `Top Up ${formatRupiahBersih(form.jumlah)} untuk ${tokoDipilih.namaToko} berhasil. Profit ${namaPemilik} otomatis terpotong.`,
      'success',
    );
    setFormOpen(false);
    setEditId(null);
  };

  const handleDelete = async (row: IklanTopUp) => {
    const ok = await confirm(
      `Top Up ${formatRupiahBersih(row.jumlah)} untuk toko "${row.namaToko}" akan dihapus. Profit bersih ${row.pemilik} bulan itu kembali bertambah sebesar nominal tersebut.`,
      { title: 'Hapus Top Up?', confirmText: 'Ya, Hapus', danger: true },
    );
    if (!ok) return;
    const result = await setIklan((prev) => prev.filter((t) => t.id !== row.id));
    notify(
      result.ok ? 'Top Up berhasil dihapus.' : result.errors[0] || 'Gagal menghapus.',
      result.ok ? 'info' : 'error',
    );
  };

  // Halaman ini khusus Super Admin (menu & URL sudah dibatasi di routes.tsx;
  // ini lapis pengaman tambahan).
  if (profile && profile.role !== 'super_admin') {
    return (
      <Card extra="mt-3 p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Halaman Iklan hanya bisa diakses Super Admin.
        </p>
      </Card>
    );
  }

  const TH = [
    { label: 'TANGGAL', hide: 'hidden sm:table-cell' },
    { label: 'TOKO', hide: '' },
    { label: 'PEMILIK', hide: 'hidden md:table-cell' },
    { label: 'JUMLAH TOP UP', hide: '' },
    { label: 'AKSI', hide: '' },
  ];

  return (
    <div className="mt-3 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Widget
          icon={<MdCampaign className="h-7 w-7" />}
          title="Total Top Up Bulan Ini"
          subtitle={formatRupiahBersih(totalTopUp(topUpIni))}
        />
        <Widget
          icon={<MdAddCard className="h-6 w-6" />}
          title="Jumlah Top Up Bulan Ini"
          subtitle={`${topUpIni.length} kali`}
        />
        <Widget
          icon={<MdGroups className="h-7 w-7" />}
          title="Member Berhutang Iklan"
          subtitle={`${rekapMember.filter((r) => r.hutang > 0).length} member`}
        />
      </div>

      {/* Riwayat Top Up */}
      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Iklan
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Top Up iklan otomatis memotong profit bersih member pemilik toko
              di bulan yang sama.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:!bg-navy-700 sm:w-[240px]">
              <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari toko, pemilik..."
                className="h-full w-full bg-white/0 text-sm text-navy-700 outline-none placeholder:text-gray-500 dark:!bg-navy-700 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
            <TanggalFilter
              value={tanggalFilter}
              onChange={setTanggalFilter}
              tanggalList={iklan.map((t) => t.tanggal)}
            />
            <button
              onClick={openAdd}
              className="linear flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
            >
              <MdAddCard className="h-5 w-5" />
              Top Up
            </button>
          </div>
        </div>

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {TH.map(({ label, hide }) => (
                  <th
                    key={label}
                    className={`border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 ${hide} ${label === 'AKSI' ? 'text-center' : 'text-start'}`}
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
                    colSpan={5}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    {filterAktif
                      ? 'Tidak ada Top Up pada filter ini.'
                      : 'Belum ada Top Up di bulan ini.'}
                  </td>
                </tr>
              ) : (
                pageData.map((row) => (
                  <tr
                    key={row.id}
                    className="transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
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
                      {row.keterangan && (
                        <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                          {row.keterangan}
                        </p>
                      )}
                    </td>
                    <td className="hidden border-white/0 py-3 pr-2 md:table-cell">
                      <p className="truncate text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                        {row.pemilik || '-'}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                        {formatRupiahBersih(row.jumlah)}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <div className="flex flex-nowrap items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="rounded-lg p-2 text-gray-600 transition duration-150 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                        >
                          <MdEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
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
        <PaginationControl
          page={page}
          totalPages={totalPages}
          onPrev={prev}
          onNext={next}
        />
      </Card>

      {/* Profit bersih per member bulan ini */}
      <Card extra="p-6">
        <div className="mb-1 text-lg font-bold text-navy-700 dark:text-white">
          Profit Bersih per Member (Bulan Ini)
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Profit penjualan dikurangi Top Up iklan. Minus berarti masih ada
          hutang iklan yang akan tertutup otomatis oleh penjualan berikutnya.
        </p>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[480px] table-fixed">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                {['MEMBER', 'PROFIT PENJUALAN', 'TOP UP IKLAN', 'PROFIT BERSIH'].map(
                  (h) => (
                    <th
                      key={h}
                      className="pb-2 pr-2 text-start text-xs font-bold text-gray-600 dark:text-white sm:text-sm"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rekapMember.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Belum ada penjualan atau Top Up di bulan ini.
                  </td>
                </tr>
              ) : (
                rekapMember.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 dark:border-white/5"
                  >
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                      {r.nama}
                    </td>
                    <td className="truncate py-3 pr-2 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                      {formatRupiahBersih(r.profitKotor)}
                    </td>
                    <td className="truncate py-3 pr-2 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                      {r.topUp > 0 ? '-' + formatRupiahBersih(r.topUp) : 'Rp0'}
                    </td>
                    <td className="py-3 pr-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold sm:text-xs ${
                          r.profitBersih >= 0
                            ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-300'
                            : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300'
                        }`}
                      >
                        {formatRupiahBersih(r.profitBersih)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Overlay Top Up */}
      <ModalOverlay
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editId ? 'Edit Top Up Iklan' : 'Top Up Iklan'}
      >
        <IklanTopUpForm
          value={form}
          onChange={setForm}
          tokoOptions={toko.map((t) => t.namaToko)}
          pemilik={namaPemilik}
          tanpaPemilik={!!tokoDipilih && !ownerId}
          simulasi={simulasi}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setFormOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="linear rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-60 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Simpan Top Up'}
          </button>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default IklanPage;
