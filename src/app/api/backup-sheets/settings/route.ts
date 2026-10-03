import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from 'lib/supabaseAdmin';
import { supabase } from 'lib/supabaseClient';

/**
 * Setup Backup ke Google Spreadsheet -- disederhanakan supaya Super Admin
 * bisa atur Sheet ID langsung dari UI (halaman Setting), tidak perlu lagi
 * masuk ke environment variable Vercel segala.
 *
 * Kredensial rahasia Service Account (email & private key) TETAP di env var
 * karena itu memang harus rahasia -- tapi email-nya sendiri (bukan rahasia)
 * ditampilkan di sini supaya Super Admin tahu email mana yang perlu di-
 * "Share" akses Editor-nya di Google Sheet miliknya (itulah langkah
 * "connect"-nya: share sheet ke email ini, lalu paste Sheet ID di sini).
 */
async function getCallerRole(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData.user) return null;
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();
  return { userId: userData.user.id, role: profile?.role || null };
}

export async function GET(req: NextRequest) {
  const caller = await getCallerRole(req);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('key, value, updated_at')
    .in('key', [
      'google_sheet_id',
      'google_sheet_last_backup',
      'backup_auto_mode',
      'backup_auto_last_run',
      'backup_auto_last_status',
    ]);

  const map: Record<string, string> = {};
  (data || []).forEach((r) => {
    map[r.key] = r.value || '';
  });

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  const hasCredentials = !!(
    serviceAccountEmail && process.env.GOOGLE_PRIVATE_KEY
  );

  let autoStatus: any = null;
  try {
    autoStatus = map['backup_auto_last_status']
      ? JSON.parse(map['backup_auto_last_status'])
      : null;
  } catch {
    autoStatus = null;
  }

  return NextResponse.json({
    autoMode: map['backup_auto_mode'] || 'off',
    autoLastRun: map['backup_auto_last_run'] || null,
    autoStatus,
    cronReady: !!process.env.CRON_SECRET,
    sheetId: map['google_sheet_id'] || '',
    lastBackupAt: map['google_sheet_last_backup'] || null,
    serviceAccountEmail,
    hasCredentials,
  });
}

export async function POST(req: NextRequest) {
  const caller = await getCallerRole(req);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (caller.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const now = new Date().toISOString();
  const upsert = (key: string, value: string) =>
    supabaseAdmin.from('app_settings').upsert({
      key,
      value,
      updated_at: now,
      updated_by: caller.userId,
    });

  // --- Jadwal backup otomatis (off / weekly / monthly) ---
  if (body.autoMode !== undefined) {
    const mode = String(body.autoMode);
    if (!['off', 'weekly', 'monthly'].includes(mode)) {
      return NextResponse.json({ error: 'Pilihan jadwal tidak valid.' }, { status: 400 });
    }
    const { error } = await upsert('backup_auto_mode', mode);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Baseline: hitung jadwal berikutnya mulai dari SEKARANG (bukan langsung
    // backup saat tombol disimpan).
    const { error: e2 } = await upsert('backup_auto_last_run', now);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // --- Sheet ID ---
  const sheetId = String(body.sheetId || '').trim();
  if (!sheetId) {
    return NextResponse.json(
      { error: 'Sheet ID tidak boleh kosong.' },
      { status: 400 },
    );
  }
  const { error } = await upsert('google_sheet_id', sheetId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
