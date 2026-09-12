'use client';
import React from 'react';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import PemulihanForm, {
  emptyForm,
  PemulihanFormValue,
} from 'components/admin/pemulihan/PemulihanForm';
import TokoDetailModal from 'components/admin/pemulihan/TokoDetailModal';
import { PemulihanRow } from 'variables/dropshipPemulihan';
import { MdAdd, MdSearch, MdEdit, MdDelete } from 'react-icons/md';
import { useUI } from 'context/UIContext';
import { useAppData } from 'context/AppDataContext';
import { usePagination } from 'hooks/usePagination';
import PaginationControl from 'components/pagination/PaginationControl';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const PemulihanPage = () => {
  const { notify, confirm } = useUI();
  const { toko: data, setToko: setData } = useAppData();
  const [search, setSearch] = React.useState('');

  const filteredData = data.filter((row) =>
    row.nama.toLowerCase().includes(search.toLowerCase()),
  );
  const { page, totalPages, pageData, next, prev } = usePagination(
    filteredData,
    10,
  );

  // Tambah data
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState<PemulihanFormValue>(emptyForm);

  // Edit data
  const [editOpen, setEditOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [editForm, setEditForm] = React.useState<PemulihanFormValue>(
    emptyForm,
  );

  // Detail (klik baris)
  const [selected, setSelected] = React.useState<PemulihanRow | null>(null);

  const openAdd = () => {
    setAddForm(emptyForm);
    setAddOpen(true);
  };

  const saveAdd = () => {
    const newId = data.length ? Math.max(...data.map((d) => d.id)) + 1 : 1;
    setData([...data, { id: newId, ...addForm }]);
    setAddOpen(false);
    notify('Data toko berhasil ditambahkan.', 'success');
  };

  const openEdit = (e: React.MouseEvent, row: PemulihanRow) => {
    e.stopPropagation();
    const { id, ...rest } = row;
    setEditId(id);
    setEditForm(rest);
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (editId === null) return;
    setData(
      data.map((row) =>
        row.id === editId ? { id: editId, ...editForm } : row,
      ),
    );
    setEditOpen(false);
    setEditId(null);
    notify('Perubahan data toko berhasil disimpan.', 'success');
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const row = data.find((d) => d.id === id);
    const ok = await confirm(
      `Data toko "${row?.namaToko}" akan dihapus secara permanen.`,
      { title: 'Hapus Data Toko?', confirmText: 'Ya, Hapus', danger: true },
    );
    if (!ok) return;
    setData(data.filter((row) => row.id !== id));
    setSelected(null);
    notify('Data toko berhasil dihapus.', 'info');
  };

  return (
    <div className="mt-3">
      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Toko
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Database toko dropship untuk keperluan pemulihan akun
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:bg-navy-700 sm:w-[240px]">
              <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan nama..."
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
                  { label: 'NAMA', hide: '' },
                  { label: 'EMAIL', hide: 'hidden lg:table-cell' },
                  { label: 'METODE', hide: 'hidden md:table-cell' },
                  { label: 'NAMA TOKO', hide: '' },
                  { label: 'DENDA', hide: 'hidden sm:table-cell' },
                  { label: 'PELANGGARAN', hide: 'hidden lg:table-cell' },
                  { label: 'SALDO IKLAN', hide: 'hidden md:table-cell' },
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
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data dengan nama tersebut.
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
                  <td className="hidden border-white/0 py-3 pr-2 lg:table-cell">
                    <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-300">
                      {row.email}
                    </p>
                  </td>
                  <td className="hidden border-white/0 py-3 pr-2 md:table-cell">
                    <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                      {row.metode}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-2">
                    <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                      {row.namaToko}
                    </p>
                  </td>
                  <td className="hidden border-white/0 py-3 pr-2 sm:table-cell">
                    <p
                      className={`truncate text-sm font-bold ${
                        row.denda > 0
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-navy-700 dark:text-white'
                      }`}
                    >
                      {formatRupiah(row.denda)}
                    </p>
                  </td>
                  <td className="hidden border-white/0 py-3 pr-2 lg:table-cell">
                    <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-300">
                      {row.pelanggaran}
                    </p>
                  </td>
                  <td className="hidden border-white/0 py-3 pr-2 md:table-cell">
                    <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                      {formatRupiah(row.saldoIklan)}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-4">
                    <div className="flex flex-nowrap items-center justify-center gap-1">
                      <button
                        onClick={(e) => openEdit(e, row)}
                        className="rounded-lg p-2 text-gray-600 transition duration-150 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                      >
                        <MdEdit className="h-4 w-4" />
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

      {/* Modal Tambah Data */}
      <ModalOverlay
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah Data Toko"
        maxWidthClass="max-w-[640px]"
      >
        <PemulihanForm value={addForm} onChange={setAddForm} />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setAddOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={saveAdd}
            className="linear rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            Simpan
          </button>
        </div>
      </ModalOverlay>

      {/* Modal Edit Data */}
      <ModalOverlay
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Data Toko"
        maxWidthClass="max-w-[640px]"
      >
        <PemulihanForm value={editForm} onChange={setEditForm} />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setEditOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={saveEdit}
            className="linear rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            Simpan
          </button>
        </div>
      </ModalOverlay>

      {/* Modal Detail (klik baris, read-only) */}
      <ModalOverlay
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Toko"
      >
        {selected && <TokoDetailModal toko={selected} />}
      </ModalOverlay>
    </div>
  );
};

export default PemulihanPage;
