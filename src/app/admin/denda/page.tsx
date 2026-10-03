'use client';
import React from 'react';
import Card from 'components/card';
import Widget from 'components/widget/Widget';
import ModalOverlay from 'components/modal/ModalOverlay';
import DendaForm, {
  DendaFormValue,
  emptyDendaForm,
} from 'components/admin/denda/DendaForm';
import DendaTable from 'components/admin/denda/DendaTable';
import DendaFilterBulan from 'components/admin/denda/DendaFilterBulan';
import { useAuth } from 'context/AuthContext';
import { useUI } from 'context/UIContext';
import { useAppData } from 'context/AppDataContext';
import { useScopedData } from 'hooks/useScopedData';
import { useBulanBerjalan } from 'hooks/useBulanBerjalan';
import {
  dendaBulan,
  formatDenda,
  labelBulanKey,
  tanggalHariIniDenda,
  totalDenda,
} from 'utils/dendaHelpers';
import { MdGavel, MdReceiptLong, MdReportProblem } from 'react-icons/md';

/**
 * Halaman Denda (Member). Lapor denda untuk toko miliknya & lihat denda
 * miliknya sendiri. Tabel database-nya sama dengan section Denda Toko di
 * Super Admin; bedanya hanya data yang diambil (di sini hanya miliknya,
 * dijaga juga oleh RLS). Murni pencatatan -- tidak mengurangi apa pun.
 */
const DendaPage = () => {
  const { profile } = useAuth();
  const { notify } = useUI();
  const { setDenda } = useAppData();
  const { toko, denda } = useScopedData(); // sudah difilter milik member
  const bulanBerjalan = useBulanBerjalan();

  const [filterBulan, setFilterBulan] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [form, setForm] = React.useState<DendaFormValue>(emptyDendaForm());
  const [saving, setSaving] = React.useState(false);

  const bulanAktif = filterBulan || bulanBerjalan;
  const rows = React.useMemo(
    () => dendaBulan(denda, bulanAktif),
    [denda, bulanAktif],
  );

  const handleKirim = async () => {
    if (!profile) return;
    const tokoDipilih = toko.find((t) => t.namaToko === form.namaToko);
    if (!tokoDipilih) return notify('Pilih toko terlebih dahulu.', 'error');
    if (!form.jumlah || form.jumlah <= 0)
      return notify('Jumlah denda harus lebih dari 0.', 'error');

    setSaving(true);
    const result = await setDenda((prev) => [
      {
        id: 'DN-' + Date.now(), // sementara; diganti id asli dari database
        tokoId: tokoDipilih.id,
        namaToko: tokoDipilih.namaToko,
        ownerId: profile.id,
        pemilik: profile.nama,
        jumlah: form.jumlah,
        keterangan: form.keterangan.trim() || undefined,
        tanggal: tanggalHariIniDenda(),
      },
      ...prev,
    ]);
    setSaving(false);

    if (!result.ok) {
      notify(result.errors[0] || 'Laporan denda gagal dikirim.', 'error');
      return;
    }
    notify('Laporan denda berhasil dikirim.', 'success');
    setForm(emptyDendaForm());
    setFormOpen(false);
    setFilterBulan(''); // pastikan laporan baru langsung terlihat (bulan ini)
  };

  if (profile && profile.role !== 'member') {
    return (
      <Card extra="mt-3 p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Halaman Denda khusus Member. Super Admin mengelola denda di halaman
          Toko.
        </p>
      </Card>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Widget
          icon={<MdGavel className="h-7 w-7" />}
          title={`Total Denda ${labelBulanKey(bulanAktif)}`}
          subtitle={formatDenda(totalDenda(rows))}
        />
        <Widget
          icon={<MdReceiptLong className="h-6 w-6" />}
          title="Jumlah Laporan Denda"
          subtitle={`${rows.length} laporan`}
        />
      </div>

      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative pt-4">
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            Denda
          </div>
          {/* Penjelasan & kontrol dalam satu baris, sejajar di tengah-tengah */}
          <div className="mt-1 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <p className="min-w-0 text-sm text-gray-600 dark:text-gray-400 xl:flex-1">
              Daftar denda tokomu bulan {labelBulanKey(bulanAktif)}. Setiap awal
              bulan daftar ini mulai dari kosong lagi, dan catatan bulan lalu
              tetap bisa dilihat lewat filter bulan. Nominal denda hanya dicatat
              dan tidak mengurangi omzet maupun profit.
            </p>
            <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <DendaFilterBulan
                value={filterBulan}
                onChange={setFilterBulan}
                bulanBerjalan={bulanBerjalan}
              />
              <button
                onClick={() => {
                  setForm(emptyDendaForm());
                  setFormOpen(true);
                }}
                className="linear flex h-11 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
              >
                <MdReportProblem className="h-5 w-5" />
                Lapor Denda
              </button>
            </div>
          </div>
        </div>

        <DendaTable
          rows={rows}
          emptyText={`Belum ada denda di ${labelBulanKey(bulanAktif)}.`}
        />
      </Card>

      <ModalOverlay
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Lapor Denda"
      >
        <DendaForm
          value={form}
          onChange={setForm}
          tokoOptions={toko.map((t) => t.namaToko)}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setFormOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={handleKirim}
            disabled={saving}
            className="linear rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-60 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            {saving ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default DendaPage;
