'use client';
import React from 'react';
import Card from 'components/card';
import InputField from 'components/fields/InputField';
import { useUI } from 'context/UIContext';
import { supabase, isSupabaseConfigured } from 'lib/supabaseClient';
import { MdLock } from 'react-icons/md';

/**
 * Kartu "Ubah Password" untuk akun yang sedang login (berlaku untuk semua
 * role: super_admin, admin, member). Alur validasi:
 * 1. Password Sekarang divalidasi dengan re-login diam-diam ke Supabase Auth
 *    (kalau salah, Supabase menolak sebelum password baru disimpan).
 * 2. Password Baru & Konfirmasi Password Baru harus sama dan minimal 6 karakter.
 */
const ChangePasswordCard = () => {
  const { notify } = useUI();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      notify('Supabase belum dikonfigurasi.', 'error');
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      notify('Semua field password wajib diisi.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      notify('Password baru minimal 6 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('Konfirmasi password baru tidak cocok.', 'error');
      return;
    }
    if (newPassword === currentPassword) {
      notify(
        'Password baru tidak boleh sama dengan password sekarang.',
        'error',
      );
      return;
    }

    setSaving(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (userErr || !email) {
        notify('Sesi login tidak ditemukan. Silakan login ulang.', 'error');
        setSaving(false);
        return;
      }

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInErr) {
        notify('Password sekarang salah.', 'error');
        setSaving(false);
        return;
      }

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateErr) {
        notify(updateErr.message || 'Gagal mengubah password.', 'error');
        setSaving(false);
        return;
      }

      notify('Password berhasil diubah.', 'success');
      reset();
    } catch (e: any) {
      notify(e?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card extra="p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
          <MdLock className="h-6 w-6 text-brand-500 dark:text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            Ubah Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ganti password akun kamu. Password baru minimal 6 karakter.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:max-w-md">
        <InputField
          id="currentPassword"
          label="Password Sekarang"
          placeholder="Masukkan password sekarang"
          type="password"
          extra=""
          value={currentPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCurrentPassword(e.target.value)
          }
        />
        <InputField
          id="newPassword"
          label="Password Baru"
          placeholder="Minimal 6 karakter"
          type="password"
          extra=""
          value={newPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewPassword(e.target.value)
          }
        />
        <InputField
          id="confirmPassword"
          label="Konfirmasi Password Baru"
          placeholder="Ulangi password baru"
          type="password"
          extra=""
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
        />
        <button
          type="submit"
          disabled={saving}
          className="linear mt-1 flex w-fit items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdLock className="h-4 w-4" />
          {saving ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </form>
    </Card>
  );
};

export default ChangePasswordCard;
