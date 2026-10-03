import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from 'lib/supabaseAdmin';
import {
  ambilSheetId,
  jalankanBackup,
  BackupConfigError,
} from 'lib/backupSheets';
import { bulanKeyWib, bulanWib, hariIndexFromIso, hariIndexWib } from 'utils/bulanJakarta';

export const dynamic = 'force-dynamic';

/**
 * GET /api/backup-sheets/cron
 *
 * Dipanggil Vercel Cron SETIAP HARI (lihat vercel.json). Route ini yang
 * memutuskan apakah backup otomatis sudah waktunya, berdasarkan pengaturan
 * Super Admin di halaman Setting (app_settings.backup_auto_mode):
 *
 * - 'off'     : tidak melakukan apa-apa.
 * - 'weekly'  : backup bila sudah >= 7 hari kalender (WIB) sejak backup
 *               otomatis terakhir. Mem-backup bulan berjalan; bila bulan
 *               sudah berganti sejak run terakhir, bulan sebelumnya ikut
 *               diperbarui supaya hari-hari terakhirnya tidak terlewat.
 * - 'monthly' : backup sekali tiap pergantian bulan (WIB), isinya bulan yang
 *               BARU SAJA berakhir (data lengkap satu bulan penuh).
 *
 * Keamanan: wajib header `Authorization: Bearer <CRON_SECRET>` (Vercel
 * mengirimnya otomatis bila env CRON_SECRET diset).
 */
const KEY_MODE = 'backup_auto_mode';
const KEY_LAST_RUN = 'backup_auto_last_run';
const KEY_LAST_STATUS = 'backup_auto_last_status';

const bulanSebelumnya = (d: Date): Date => {
  const { tahun, bulan } = bulanWib(d);
  // tengah bulan sebelumnya (siang UTC) -> aman dari batas zona waktu
  return new Date(Date.UTC(tahun, bulan - 1, 15, 12));
};

const simpan = async (key: string, value: string) =>
  supabaseAdmin.from('app_settings').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET belum diset di server.' },
      { status: 500 },
    );
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: rows } = await supabaseAdmin
    .from('app_settings')
    .select('key, value')
    .in('key', [KEY_MODE, KEY_LAST_RUN]);
  const map: Record<string, string> = {};
  (rows || []).forEach((r: any) => {
    map[r.key] = r.value || '';
  });

  const mode = map[KEY_MODE] || 'off';
  if (mode !== 'weekly' && mode !== 'monthly') {
    return NextResponse.json({ ran: false, reason: 'Backup otomatis nonaktif.' });
  }

  const now = new Date();
  const lastRun = map[KEY_LAST_RUN] || null;
  const lastRunDate = lastRun ? new Date(lastRun) : null;
  const lastHari = hariIndexFromIso(lastRun);

  // Belum pernah jalan (mode baru diaktifkan tanpa baseline): jalankan sekarang.
  let due = lastHari === null;
  const bulanTarget: Date[] = [];

  if (mode === 'weekly') {
    if (!due) due = hariIndexWib(now) - (lastHari as number) >= 7;
    if (due) {
      bulanTarget.push(now);
      if (lastRunDate && bulanKeyWib(lastRunDate) !== bulanKeyWib(now)) {
        bulanTarget.unshift(bulanSebelumnya(now));
      }
    }
  } else {
    if (!due) due = bulanKeyWib(lastRunDate as Date) !== bulanKeyWib(now);
    if (due) bulanTarget.push(bulanSebelumnya(now));
  }

  if (!due) {
    return NextResponse.json({ ran: false, reason: 'Belum waktunya.' });
  }

  try {
    const sheetId = await ambilSheetId();
    const hasil = [];
    for (const target of bulanTarget) {
      hasil.push(await jalankanBackup({ sheetId, bulanTarget: target }));
    }
    const iso = now.toISOString();
    await simpan(KEY_LAST_RUN, iso);
    await simpan(
      KEY_LAST_STATUS,
      JSON.stringify({ ok: true, at: iso, tabs: hasil.map((h) => h.sheetName) }),
    );
    return NextResponse.json({ ran: true, tabs: hasil.map((h) => h.sheetName) });
  } catch (err: any) {
    const pesan = err?.message || 'Terjadi kesalahan server';
    // last_run SENGAJA tidak diubah -> dicoba lagi pada cron berikutnya (besok).
    await simpan(
      KEY_LAST_STATUS,
      JSON.stringify({ ok: false, at: now.toISOString(), error: pesan }),
    );
    return NextResponse.json(
      { error: pesan },
      { status: err instanceof BackupConfigError ? 400 : 500 },
    );
  }
}
