'use client';
import React from 'react';
import Card from 'components/card';
import { useUI } from 'context/UIContext';
import { useAuth } from 'context/AuthContext';
import { supabase, isSupabaseConfigured } from 'lib/supabaseClient';
import {
  MdBackup,
  MdCloudDone,
  MdOutlineTableChart,
  MdContentCopy,
  MdCheckCircle,
  MdErrorOutline,
  MdOpenInNew,
} from 'react-icons/md';
import ChangePasswordCard from 'components/admin/profile/ChangePasswordCard';

type BackupSettings = {
  sheetId: string;
  lastBackupAt: string | null;
  serviceAccountEmail: string;
  hasCredentials: boolean;
};

const SettingPage = () => {
  const { notify } = useUI();
  const { profile } = useAuth();
  const [backingUp, setBackingUp] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<{
    sheetName: string;
    counts: { penjualan: number; refund: number; member: number };
    spreadsheetUrl: string;
  } | null>(null);

  const [settings, setSettings] = React.useState<BackupSettings | null>(null);
  const [sheetIdInput, setSheetIdInput] = React.useState('');
  const [savingSheetId, setSavingSheetId] = React.useState(false);

  const getToken = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session?.access_token || null;
  };

  const loadSettings = React.useCallback(async () => {
    if (!isSupabaseConfigured || profile?.role !== 'super_admin') return;
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/backup-sheets/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setSettings(json);
        setSheetIdInput(json.sheetId || '');
      }
    } catch {
      /* diamkan, tampilkan state kosong */
    }
  }, [profile?.role]);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSheetId = async () => {
    if (!sheetIdInput.trim()) {
      notify('Sheet ID tidak boleh kosong.', 'error');
      return;
    }
    setSavingSheetId(true);
    try {
      const token = await getToken();
      if (!token) {
        notify('Sesi login tidak ditemukan. Silakan login ulang.', 'error');
        return;
      }
      const res = await fetch('/api/backup-sheets/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sheetId: sheetIdInput.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        notify(json.error || 'Gagal menyimpan Sheet ID.', 'error');
        return;
      }
      notify('Sheet ID berhasil disimpan.', 'success');
      loadSettings();
    } catch (e: any) {
      notify(e?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setSavingSheetId(false);
    }
  };

  const copyEmail = () => {
    if (!settings?.serviceAccountEmail) return;
    navigator.clipboard.writeText(settings.serviceAccountEmail);
    notify('Email Service Account disalin.', 'success');
  };

  const handleBackup = async () => {
    if (!isSupabaseConfigured) {
      notify('Supabase belum dikonfigurasi.', 'error');
      return;
    }
    setBackingUp(true);
    try {
      const token = await getToken();
      if (!token) {
        notify('Sesi login tidak ditemukan. Silakan login ulang.', 'error');
        setBackingUp(false);
        return;
      }

      const res = await fetch('/api/backup-sheets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (!res.ok) {
        notify(json.error || 'Gagal backup ke Spreadsheet.', 'error');
        setBackingUp(false);
        return;
      }

      setLastResult(json);
      notify(`Backup ke sheet "${json.sheetName}" berhasil!`, 'success');
      loadSettings();
    } catch (e: any) {
      notify(e?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-5">
      <ChangePasswordCard />

      {profile?.role === 'super_admin' && (
      <Card extra="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdOutlineTableChart className="h-6 w-6 text-brand-500 dark:text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">
              Backup ke Google Spreadsheet
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Satu tab per bulan (otomatis dinamai sesuai bulan & tahun),
              berisi rekap Penjualan, Refund, dan Total Omzet/Profit per
              member bulan tersebut.
            </p>
          </div>
        </div>

        {/* Status koneksi */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
            {settings?.hasCredentials ? (
              <MdCheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
            ) : (
              <MdErrorOutline className="h-5 w-5 flex-shrink-0 text-amber-500" />
            )}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kredensial Service Account
              </p>
              <p className="text-sm font-semibold text-navy-700 dark:text-white">
                {settings?.hasCredentials ? 'Sudah dikonfigurasi' : 'Belum dikonfigurasi'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
            {settings?.sheetId ? (
              <MdCheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
            ) : (
              <MdErrorOutline className="h-5 w-5 flex-shrink-0 text-amber-500" />
            )}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sheet ID
              </p>
              <p className="truncate text-sm font-semibold text-navy-700 dark:text-white">
                {settings?.sheetId || 'Belum diatur'}
              </p>
            </div>
          </div>
        </div>

        {/* Setup: Sheet ID via UI */}
        <div className="mb-5 rounded-xl border border-dashed border-gray-300 p-4 dark:border-white/15">
          <p className="mb-3 text-sm font-bold text-navy-700 dark:text-white">
            Setup Koneksi (2 langkah)
          </p>

          <p className="mb-1.5 text-xs text-gray-500 dark:text-gray-400">
            1. Share Google Sheet kamu (akses <b>Editor</b>) ke email ini:
          </p>
          <div className="mb-4 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-lightPrimary px-3 py-2 text-xs text-navy-700 dark:bg-navy-900 dark:text-white">
              {settings?.serviceAccountEmail || '(belum dikonfigurasi di server)'}
            </code>
            {settings?.serviceAccountEmail && (
              <button
                onClick={copyEmail}
                title="Salin email"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-lightPrimary text-gray-600 transition hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/10"
              >
                <MdContentCopy className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="mb-1.5 text-xs text-gray-500 dark:text-gray-400">
            2. Paste Sheet ID-nya di sini (bagian dari URL spreadsheet:{' '}
            <code>docs.google.com/spreadsheets/d/<b>SHEET_ID_DI_SINI</b>/edit</code>):
          </p>
          <div className="flex items-center gap-2">
            <input
              id="sheetId"
              type="text"
              placeholder="Contoh: 1AbCdEfGhIjKlMnOpQrStUvWxYz..."
              value={sheetIdInput}
              onChange={(e) => setSheetIdInput(e.target.value)}
              className="h-12 flex-1 rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
            />
            <button
              onClick={handleSaveSheetId}
              disabled={savingSheetId}
              className="flex h-12 flex-shrink-0 items-center justify-center rounded-xl bg-navy-700 px-4 text-sm font-medium text-white transition hover:bg-navy-800 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
            >
              {savingSheetId ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>

        <button
          onClick={handleBackup}
          disabled={backingUp || !settings?.sheetId || !settings?.hasCredentials}
          className="linear flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdBackup className="h-4 w-4" />
          {backingUp ? 'Sedang Backup...' : 'Backup Sekarang'}
        </button>

        {settings?.lastBackupAt && !lastResult && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Backup terakhir:{' '}
            {new Date(settings.lastBackupAt).toLocaleString('id-ID', {
              dateStyle: 'full',
              timeStyle: 'short',
            })}
          </p>
        )}

        {lastResult && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-500/10">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400">
              <MdCloudDone className="h-4 w-4" />
              Backup ke tab &quot;{lastResult.sheetName}&quot; berhasil
            </p>
            <ul className="space-y-1 text-xs text-green-700 dark:text-green-300">
              <li>Penjualan: {lastResult.counts.penjualan} transaksi</li>
              <li>Refund: {lastResult.counts.refund} transaksi</li>
              <li>Member aktif bulan ini: {lastResult.counts.member} orang</li>
            </ul>
            <a
              href={lastResult.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-700 underline dark:text-green-300"
            >
              Buka Spreadsheet <MdOpenInNew className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <div className="mt-5 rounded-xl bg-lightPrimary p-4 text-xs text-gray-600 dark:bg-navy-700 dark:text-gray-300">
          <p className="mb-1 font-bold">Cara kerja backup bulanan:</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Tiap kali <b>Backup Sekarang</b> ditekan, sistem membuat/memakai
              tab dengan nama bulan &amp; tahun berjalan (mis. &quot;September
              2026&quot;), berisi HANYA data bulan itu.
            </li>
            <li>
              Ditekan lagi di bulan yang sama = data di tab itu dihitung ulang
              &amp; diperbarui (aman dipencet berkali-kali).
            </li>
            <li>
              Begitu bulan berganti, tab baru otomatis dibuat -- tab bulan
              sebelumnya tidak ikut berubah.
            </li>
          </ul>
          {!settings?.hasCredentials && (
            <p className="mt-2 text-amber-600 dark:text-amber-400">
              Catatan: kredensial Service Account (email &amp; private key)
              masih perlu diisi satu kali oleh developer lewat environment
              variable <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code> &amp;{' '}
              <code>GOOGLE_PRIVATE_KEY</code> -- ini kredensial rahasia jadi
              memang tidak bisa diatur lewat UI. Selebihnya (Sheet ID) sudah
              bisa diatur sendiri di atas.
            </p>
          )}
        </div>
      </Card>
      )}
    </div>
  );
};

export default SettingPage;
