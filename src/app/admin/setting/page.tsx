'use client';
import React from 'react';
import Card from 'components/card';
import { useUI } from 'context/UIContext';
import { supabase, isSupabaseConfigured } from 'lib/supabaseClient';
import { MdBackup, MdCloudDone, MdOutlineTableChart } from 'react-icons/md';

const SettingPage = () => {
  const { notify } = useUI();
  const [backingUp, setBackingUp] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<Record<
    string,
    number
  > | null>(null);

  const handleBackup = async () => {
    if (!isSupabaseConfigured) {
      notify('Supabase belum dikonfigurasi.', 'error');
      return;
    }
    setBackingUp(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
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

      setLastResult(json.results);
      notify('Backup ke Google Spreadsheet berhasil!', 'success');
    } catch (e: any) {
      notify(e?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-5">
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
              Salin seluruh data (Toko, Penjualan, Refund, Pesanan Masuk,
              Brutal, Data Buyer) ke Spreadsheet dinamis — satu tab per tabel.
            </p>
          </div>
        </div>

        <button
          onClick={handleBackup}
          disabled={backingUp}
          className="linear flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdBackup className="h-4 w-4" />
          {backingUp ? 'Sedang Backup...' : 'Backup Sekarang'}
        </button>

        {lastResult && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-500/10">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400">
              <MdCloudDone className="h-4 w-4" />
              Backup berhasil
            </p>
            <ul className="space-y-1 text-xs text-green-700 dark:text-green-300">
              {Object.entries(lastResult).map(([table, count]) => (
                <li key={table}>
                  {table}: {count} baris
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 rounded-xl bg-lightPrimary p-4 text-xs text-gray-600 dark:bg-navy-700 dark:text-gray-300">
          <p className="mb-1 font-bold">Cara setting (sekali saja):</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Buat Google Sheet baru, catat ID-nya dari URL.</li>
            <li>
              Buat Service Account di Google Cloud Console, aktifkan Google
              Sheets API.
            </li>
            <li>
              Share Google Sheet ke email Service Account (akses Editor).
            </li>
            <li>
              Isi <code>GOOGLE_SHEET_ID</code>,{' '}
              <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>,{' '}
              <code>GOOGLE_PRIVATE_KEY</code> di environment variables.
            </li>
          </ol>
          <p className="mt-2">
            Detail lengkap ada di file <code>DEPLOY.md</code> pada project.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingPage;
