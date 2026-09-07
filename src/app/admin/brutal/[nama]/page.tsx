'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import BrutalForm, {
  emptyBrutalForm,
  BrutalFormValue,
} from 'components/admin/brutal/BrutalForm';
import BrutalDetailModal from 'components/admin/brutal/BrutalDetailModal';
import { useBrutal } from 'context/BrutalContext';
import { useMember } from 'context/MemberContext';
import { useUI } from 'context/UIContext';
import { BrutalItem, BrutalStatus, BrutalIklan } from 'variables/dropshipBrutal';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabaseClient';
import { MdAdd, MdArrowBack, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

const statusStyle: Record<BrutalStatus, string> = {
  Muncul: 'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
  Tidak: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300',
};

const iklanStyle: Record<BrutalIklan, string> = {
  Iklan: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300',
  Tidak: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300',
};

const DataBrutalAnggotaPage = ({
  params,
}: {
  params: Promise<{ nama: string }>;
}) => {
  const { nama: anggotaId } = React.use(params);
  const { items, setItems } = useBrutal();
  const { member } = useMember();
  const { profile } = useAuth();
  const { notify, confirm } = useUI();
  const router = useRouter();

  const isMemberRole = isSupabaseConfigured && profile?.role === 'member';

  React.useEffect(() => {
    // Member tidak boleh melihat data brutal anggota lain.
    if (isMemberRole && profile && anggotaId !== profile.id) {
      router.replace(`/admin/brutal/${profile.id}`);
    }
  }, [isMemberRole, profile, anggotaId, router]);

  const currentAnggota = member.find((a) => a.id === anggotaId);
  const [search, setSearch] = React.useState('');

  const [formOpen, setFormOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<BrutalFormValue>(emptyBrutalForm());

  const [selected, setSelected] = React.useState<BrutalItem | null>(null);

  const dataAnggota = items.filter((i) => i.anggotaId === anggotaId);
  const filtered = dataAnggota.filter((i) => {
    const term = search.toLowerCase();
    return (
      i.namaToko.toLowerCase().includes(term) ||
      i.produk.toLowerCase().includes(term) ||
      i.kategoriToko.toLowerCase().includes(term)
    );
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyBrutalForm());
    setFormOpen(true);
  };

  const openEdit = (e: React.MouseEvent, row: BrutalItem) => {
    e.stopPropagation();
    const { id, anggotaId: _a, ...rest } = row;
    setEditId(id);
    setForm(rest);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      setItems(
        items.map((row) =>
          row.id === editId ? { id: editId, anggotaId, ...form } : row,
        ),
      );
      notify('Perubahan data brutal berhasil disimpan.', 'success');
    } else {
      const newId = 'BR-' + Date.now();
      setItems([{ id: newId, anggotaId, ...form }, ...items]);
      notify('Data brutal baru berhasil ditambahkan.', 'success');
    }
    setFormOpen(false);
    setEditId(null);
  };

  const handleDelete = async (e: React.MouseEvent, row: BrutalItem) => {
    e.stopPropagation();
    const ok = await confirm(
      `Data brutal untuk toko "${row.namaToko}" akan dihapus secara permanen.`,
      { title: 'Hapus Data Brutal?', confirmText: 'Ya, Hapus', danger: true },
    );
    if (!ok) return;
    setItems(items.filter((i) => i.id !== row.id));
    setSelected(null);
    notify('Data brutal berhasil dihapus.', 'info');
  };

  return (
    <div className="mt-3">
      {!isMemberRole && (
        <button
          onClick={() => router.push('/admin/brutal')}
          className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-600 transition duration-150 hover:text-brand-500 dark:text-gray-300 dark:hover:text-white"
        >
          <MdArrowBack className="h-4 w-4" />
          Kembali ke Brutal
        </button>
      )}

      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Data Brutal {currentAnggota?.nama || anggotaId}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Klik baris untuk detail lengkap
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:bg-navy-700 sm:w-[260px]">
              <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari toko, produk, kategori..."
                className="h-full w-full bg-transparent text-sm text-navy-700 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={openAdd}
              className="linear flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
            >
              <MdAdd className="h-5 w-5" />
              Tambah Data
            </button>
          </div>
        </div>

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {[
                  { label: 'NAMA TOKO', hide: '' },
                  { label: 'KATEGORI TOKO', hide: 'hidden sm:table-cell' },
                  { label: 'PRODUK', hide: '' },
                  { label: 'STATUS', hide: '' },
                  { label: 'IKLAN', hide: 'hidden sm:table-cell' },
                  { label: 'AKSI', hide: '' },
                ].map(({ label: h, hide }) => (
                  <th
                    key={h}
                    className={`border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 ${hide} ${h === 'AKSI' || h === 'STATUS' || h === 'IKLAN' ? 'text-center' : 'text-start'}`}
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
                    colSpan={6}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Belum ada data brutal untuk anggota ini.
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
                        {row.namaToko}
                      </p>
                    </td>
                    <td className="hidden border-white/0 py-3 pr-2 sm:table-cell">
                      <p className="truncate text-sm text-gray-600 dark:text-gray-300">
                        {row.kategoriToko}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                        {row.produk}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2 text-center">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold sm:px-3 sm:text-xs ${statusStyle[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="hidden border-white/0 py-3 pr-2 text-center sm:table-cell">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${iklanStyle[row.iklan]}`}
                      >
                        {row.iklan}
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
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editId ? 'Edit Data Brutal' : 'Tambah Data Brutal'}
        maxWidthClass="max-w-[640px]"
      >
        <BrutalForm value={form} onChange={setForm} />
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
            {editId ? 'Simpan Perubahan' : 'Simpan Data'}
          </button>
        </div>
      </ModalOverlay>

      <ModalOverlay
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Brutal"
        maxWidthClass="max-w-[640px]"
      >
        {selected && <BrutalDetailModal item={selected} />}
      </ModalOverlay>
    </div>
  );
};

export default DataBrutalAnggotaPage;
