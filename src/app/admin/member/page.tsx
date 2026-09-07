'use client';
import React from 'react';
import Card from 'components/card';
import ModalOverlay from 'components/modal/ModalOverlay';
import MemberForm, {
  emptyMemberForm,
  MemberFormValue,
} from 'components/admin/member/MemberForm';
import { useMember } from 'context/MemberContext';
import { useBrutal } from 'context/BrutalContext';
import { useUI } from 'context/UIContext';
import { supabase, isSupabaseConfigured } from 'lib/supabaseClient';
import { MdAdd, MdDelete, MdPerson, MdAdminPanelSettings } from 'react-icons/md';

const MemberPage = () => {
  const { member, setMember } = useMember();
  const { items, setItems } = useBrutal();
  const { notify, confirm } = useUI();

  const [formOpen, setFormOpen] = React.useState(false);
  const [form, setForm] = React.useState<MemberFormValue>(emptyMemberForm());
  const [submitting, setSubmitting] = React.useState(false);

  const openAdd = () => {
    setForm(emptyMemberForm());
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.nama || !form.email || !form.password) {
      notify('Nama, email, dan password wajib diisi.', 'error');
      return;
    }
    if (form.password.length < 6) {
      notify('Password minimal 6 karakter.', 'error');
      return;
    }

    if (!isSupabaseConfigured) {
      notify(
        'Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu untuk membuat akun login sungguhan.',
        'error',
      );
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        notify('Sesi login tidak ditemukan. Silakan login ulang.', 'error');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        notify(json.error || 'Gagal membuat akun.', 'error');
        setSubmitting(false);
        return;
      }

      setMember([...member, { id: json.id, nama: json.nama }]);
      notify('Akun berhasil dibuat. Anggota bisa langsung login.', 'success');
      setFormOpen(false);
    } catch (e: any) {
      notify(e?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, nama: string) => {
    e.stopPropagation();
    const ok = await confirm(
      `Akun "${nama}" akan dihapus permanen, termasuk akses login & data Brutal miliknya.`,
      { title: 'Hapus Anggota?', confirmText: 'Ya, Hapus', danger: true },
    );
    if (!ok) return;

    if (isSupabaseConfigured) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        await fetch(`/api/member?id=${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // lanjutkan hapus dari state lokal meski request server gagal
      }
    }

    setMember(member.filter((m) => m.id !== id));
    setItems(items.filter((i) => i.anggotaId !== id));
    notify('Anggota berhasil dihapus.', 'info');
  };

  return (
    <div className="mt-3">
      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          Supabase belum dikonfigurasi (`.env.local` kosong). Halaman ini
          masih bisa dilihat, tapi pembuatan akun login sungguhan baru aktif
          setelah kredensial Supabase diisi.
        </div>
      )}
      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Member
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kelola akun Admin & Member — dipakai juga sebagai sumber
              pilihan Nama di seluruh halaman
            </p>
          </div>
          <button
            onClick={openAdd}
            className="linear flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            <MdAdd className="h-5 w-5" />
            Tambah Anggota
          </button>
        </div>

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {['NAMA', 'AKSI'].map((h) => (
                  <th
                    key={h}
                    className={`border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 ${h === 'AKSI' ? 'text-center' : 'text-start'}`}
                  >
                    <p className="text-sm font-bold text-gray-600 dark:text-white">
                      {h}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {member.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Belum ada anggota. Klik &quot;Tambah Anggota&quot; untuk mulai.
                  </td>
                </tr>
              ) : (
                member.map((m) => (
                  <tr
                    key={m.id}
                    className="transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
                  >
                    <td className="border-white/0 py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <MdPerson className="h-4 w-4 text-brand-500 dark:text-white" />
                        <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                          {m.nama}
                        </p>
                      </div>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <div className="flex flex-nowrap items-center justify-center gap-1">
                        <button
                          onClick={(e) => handleDelete(e, m.id, m.nama)}
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
        title="Tambah Anggota"
        maxWidthClass="max-w-[520px]"
      >
        <MemberForm value={form} onChange={setForm} />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setFormOpen(false)}
            className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="linear flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            <MdAdminPanelSettings className="h-4 w-4" />
            {submitting ? 'Membuat Akun...' : 'Buat Akun'}
          </button>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default MemberPage;
