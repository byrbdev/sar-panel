import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from 'lib/supabaseAdmin';
import { supabase } from 'lib/supabaseClient';
import {
  ambilSheetId,
  jalankanBackup,
  BackupConfigError,
} from 'lib/backupSheets';

/**
 * POST /api/backup-sheets
 *
 * Backup MANUAL (tombol "Backup Sekarang") ke Google Spreadsheet, khusus
 * Super Admin. Logika backup ada di lib/backupSheets.ts (dipakai juga oleh
 * cron backup otomatis di /api/backup-sheets/cron).
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: userData, error: userErr } =
      await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();
    if (!callerProfile || callerProfile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await jalankanBackup({
      sheetId: await ambilSheetId(),
      actorId: userData.user.id,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    const status = err instanceof BackupConfigError ? 400 : 500;
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan server' },
      { status },
    );
  }
}
