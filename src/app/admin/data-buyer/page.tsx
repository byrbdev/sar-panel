'use client';
import React from 'react';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import BuyerForm, {
  emptyBuyerForm,
  BuyerFormValue,
} from 'components/admin/buyer/BuyerForm';
import BuyerDetailModal from 'components/admin/buyer/BuyerDetailModal';
import { BuyerRow, BuyerStatus } from 'variables/dropshipBuyer';
import { useUI } from 'context/UIContext';
import { useSyncedTable } from 'hooks/useSyncedTable';
import { MdAdd, MdSearch, MdEdit, MdDelete } from 'react-icons/md';

const statusStyle: Record<BuyerStatus, string> = {
  DIPAKAI: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300',
  KOSONG:
    'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
};

const buyerToDb = (b: BuyerRow) => ({
  id: b.id,
  no_hp: b.noHp,
  akun_buyer: b.akunBuyer,
  akun_al: b.akunAL,
  status: b.status,
  keterangan: b.keterangan,
});
const buyerFromDb = (r: any): BuyerRow => ({
  id: String(r.id),
  noHp: r.no_hp || '',
  akunBuyer: r.akun_buyer || '',
  akunAL: r.akun_al || '',
  status: r.status || 'KOSONG',
  keterangan: r.keterangan || '',
  tanggal: r.tanggal
    ? new Date(r.tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '',
});

const DataBuyerPage = () => {
  const { notify, confirm } = useUI();
  const [data, setData] = useSyncedTable<BuyerRow>(
    'data_buyer',
    [],
    buyerToDb,
    buyerFromDb,
    true,
  );
  const [search, setSearch] = React.useState('');

  // Tambah / Edit
  const [formOpen, setFormOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<BuyerFormValue>(emptyBuyerForm());

  // Detail (klik baris)
  const [selected, setSelected] = React.useState<BuyerRow | null>(null);

  const filteredData = data.filter((row) => {
    const term = search.toLowerCase();
    return (
      row.noHp.toLowerCase().includes(term) ||
      row.akunBuyer.toLowerCase().includes(term) ||
      row.akunAL.toLowerCase().includes(term)
    );
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyBuyerForm());
    setFormOpen(true);
  };

  const openEdit = (e: React.MouseEvent, row: BuyerRow) => {
    e.stopPropagation();
    const { id, ...rest } = row;
    setEditId(id);
    setForm(rest);
    setFormOpen(true);
  };

  const updateStatus = (id: string, status: BuyerStatus) => {
    setData(data.map((r) => (r.id === id ? { ...r, status } : r)));
    notify('Status akun buyer berhasil diperbarui.', 'success');
  };

  const handleSave = () => {
    if (editId) {
      setData(
        data.map((row) => (row.id === editId ? { id: editId, ...form } : row)),
      );
      notify('Perubahan data buyer berhasil disimpan.', 'success');
    } else {
      const newId = 'BY-' + Date.now();
      setData([{ id: newId, ...form }, ...data]);
      notify('Data buyer baru berhasil ditambahkan.', 'success');
    }
    setFormOpen(false);
    setEditId(null);
  };

  const handleDelete = async (e: React.MouseEvent, row: BuyerRow) => {
    e.stopPropagation();
    const ok = await confirm(
      `Akun buyer "${row.akunBuyer}" akan dihapus secara permanen.`,
      { title: 'Hapus Data Buyer?', confirmText: 'Ya, Hapus', danger: true },
    );
    if (!ok) return;
    setData(data.filter((r) => r.id !== row.id));
    setSelected(null);
    notify('Data buyer berhasil dihapus.', 'info');
  };

  return (
    <div className="mt-3">
      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Data Buyer
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Klik baris untuk detail akun buyer
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-11 items-center gap-2 rounded-lg bg-lightPrimary px-3 dark:bg-navy-700 sm:w-[260px]">
              <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari No HP, akun buyer, akun AL..."
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
                  { label: 'NOMOR HP', hide: '' },
                  { label: 'AKUN BUYER', hide: '' },
                  { label: 'AKUN AL', hide: 'hidden sm:table-cell' },
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
                    colSpan={5}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(row)}
                    className="cursor-pointer transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
                  >
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-xs font-bold text-navy-700 dark:text-white sm:text-sm">
                        {row.noHp}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-xs font-medium text-gray-600 dark:text-gray-300 sm:text-sm">
                        {row.akunBuyer}
                      </p>
                    </td>
                    <td className="hidden border-white/0 py-3 pr-2 sm:table-cell">
                      <p className="truncate font-mono text-xs text-gray-600 dark:text-gray-300">
                        {row.akunAL}
                      </p>
                    </td>
                    <td className="border-white/0 py-3 pr-2 text-center">
                      <select
                        value={row.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          updateStatus(row.id, e.target.value as BuyerStatus)
                        }
                        className={`rounded-full border-none px-2 py-1.5 text-[10px] font-bold outline-none sm:px-3 sm:text-xs ${statusStyle[row.status]}`}
                      >
                        <option value="DIPAKAI">DIPAKAI</option>
                        <option value="KOSONG">KOSONG</option>
                      </select>
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

      {/* Modal Tambah / Edit */}
      <ModalOverlay
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editId ? 'Edit Data Buyer' : 'Tambah Data Buyer'}
        maxWidthClass="max-w-[640px]"
      >
        <BuyerForm value={form} onChange={setForm} />
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

      {/* Modal Detail (klik baris, read-only) */}
      <ModalOverlay
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Buyer"
      >
        {selected && <BuyerDetailModal buyer={selected} />}
      </ModalOverlay>
    </div>
  );
};

export default DataBuyerPage;
