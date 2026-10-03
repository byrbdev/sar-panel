'use client';
import React from 'react';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import DendaForm, {
  DendaFormValue,
  emptyDendaForm,
} from 'components/admin/denda/DendaForm';
import DendaTable from 'components/admin/denda/DendaTable';
import DendaFilterBulan from 'components/admin/denda/DendaFilterBulan';
import { useAppData } from 'context/AppDataContext';
import { useMember } from 'context/MemberContext';
import { useUI } from 'context/UIContext';
import { useBulanBerjalan } from 'hooks/useBulanBerjalan';
import { DendaToko } from 'variables/dropshipDenda';
import {
  dendaBulan,
  formatDenda,
  labelBulanKey,
  tanggalHariIniDenda,
} from 'utils/dendaHelpers';
import { MdAdd, MdSearch } from 'react-icons/md';

/**
 * Section "Denda Toko" di halaman Toko (Super Admin). Melihat semua denda
 * semua toko/member, filter Bulan-Tahun, dan tambah/ubah/hapus.
 * Murni database -- tidak mengubah omzet/profit apa pun.
 */
const DendaTokoSection = () => {
  const { toko, denda, setDenda } = useAppData();
  const { memberOnly } = useMember();
  const { notify, confirm } = useUI();
  const bulanBerjalan = useBulanBerjalan();

  const [filterBulan, setFilterBulan] = React.useState(''); // '' = bulan berjalan
  const [search, setSearch] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<DendaFormValue>(emptyDendaForm());
  const [saving, setSaving] = React.useState(false);

  const bulanAktif = filterBulan || bulanBerjalan;

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

  const rows = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return dendaBulan(denda, bulanAktif).filter(
      (d) =>
        !term ||
        d.namaToko.toLowerCase().includes(term) ||
        d.pemilik.toLowerCase().includes(term) ||
        (d.keterangan || '').toLowerCase().includes(term),
    );
  }, [denda, bulanAktif, search]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyDendaForm());
    setFormOpen(true);
  };
  const openEdit = (row: DendaToko) => {
    setEditId(row.id);
    setForm({
      namaToko: row.namaToko,
      keterangan: row.keterangan || '',
      jumlah: row.jumlah,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!tokoDipilih) return notify('Pilih toko terlebih dahulu.', 'error');
    if (!ownerId)
      return notify('Toko ini belum punya pemilik. Atur di tabel Toko.', 'error');
    if (!form.jumlah || form.jumlah <= 0)
      return notify('Jumlah denda harus lebih dari 0.', 'error');

    const fields = {
      tokoId: tokoDipilih.id,
      namaToko: tokoDipilih.namaToko,
      ownerId,
      pemilik: namaPemilik,
      jumlah: form.jumlah,
      keterangan: form.keterangan.trim() || undefined,
    };

    setSaving(true);
    const result = editId
      ? await setDenda((prev) =>
          prev.map((d) => (d.id === editId ? { ...d, ...fields } : d)),
        )
      : await setDenda((prev) => [
          {
            id: 'DN-' + Date.now(), // sementara; diganti id asli dari database
            ...fields,
            tanggal: tanggalHariIniDenda(),
          },
          ...prev,
        ]);
    setSaving(false);

    if (!result.ok) {
      notify(result.errors[0] || 'Denda gagal disimpan.', 'error');
      return;
    }
    notify(
      editId
        ? 'Denda berhasil diperbarui.'
        : `Denda ${formatDenda(form.jumlah)} untuk ${tokoDipilih.namaToko} tercatat.`,
      'success',
    );
    setFormOpen(false);
    setEditId(null);
  };

  const handleDelete = async (row: DendaToko) => {
    const ok = await confirm(
      `Denda ${formatDenda(row.jumlah)} untuk toko "${row.namaToko}" akan dihapus dari database.`,
      { title: 'Hapus Denda?', confirmText: 'Ya, Hapus', danger: true },
    );
    if (!ok) return;
    const result = await setDenda((prev) => prev.filter((d) => d.id !== row.id));
    notify(
      result.ok ? 'Denda berhasil dihapus.' : result.errors[0] || 'Gagal menghapus.',
      result.ok ? 'info' : 'error',
    );
  };

  return (
    <Card extra="mt-5 w-full h-full px-6 pb-6 sm:overflow-x-auto">
      <div className="relative flex flex-col gap-4 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            Denda Toko
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Daftar denda toko bulan {labelBulanKey(bulanAktif)}. Mau lihat
            bulan sebelumnya? Pilih bulannya di kolom filter. Nominal denda
            hanya dicatat dan tidak dikurangkan dari omzet maupun profit.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:!bg-navy-700 sm:w-[220px]">
            <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari toko, pemilik..."
              className="h-full w-full bg-white/0 text-sm text-navy-700 outline-none placeholder:text-gray-500 dark:!bg-navy-700 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
          <DendaFilterBulan
            value={filterBulan}
            onChange={setFilterBulan}
            bulanBerjalan={bulanBerjalan}
          />
          <button
            onClick={openAdd}
            className="linear flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            <MdAdd className="h-5 w-5" />
            Tambah Denda
          </button>
        </div>
      </div>

      <DendaTable
        rows={rows}
        showPemilik
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyText={`Belum ada denda di ${labelBulanKey(bulanAktif)}.`}
      />

      <ModalOverlay
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editId ? 'Edit Denda Toko' : 'Tambah Denda Toko'}
      >
        <DendaForm
          value={form}
          onChange={setForm}
          tokoOptions={toko.map((t) => t.namaToko)}
          showPemilik
          pemilik={namaPemilik}
          tanpaPemilik={!!tokoDipilih && !ownerId}
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
            {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Simpan Denda'}
          </button>
        </div>
      </ModalOverlay>
    </Card>
  );
};

export default DendaTokoSection;
