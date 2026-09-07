import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from 'lib/supabaseAdmin';
import { supabase } from 'lib/supabaseClient';

/**
 * POST /api/backup-sheets
 * Menyalin seluruh tabel (toko, penjualan, refund, pesanan_masuk,
 * brutal_items, data_buyer) ke Google Spreadsheet — satu sheet per tabel.
 *
 * Kredensial Google Service Account HANYA hidup di server (env var),
 * tidak pernah dikirim ke browser. Hanya Super Admin yang boleh memicu ini.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser(
      token,
    );
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

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(
      /\\n/g,
      '\n',
    );

    if (!sheetId || !clientEmail || !privateKey) {
      return NextResponse.json(
        {
          error:
            'Google Sheets belum dikonfigurasi. Isi GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY di environment variables.',
        },
        { status: 400 },
      );
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const tables = [
      'toko',
      'penjualan',
      'refund',
      'pesanan_masuk',
      'brutal_items',
      'data_buyer',
    ];

    const results: Record<string, number> = {};

    for (const table of tables) {
      const { data: rows, error } = await supabaseAdmin
        .from(table)
        .select('*');
      if (error || !rows) {
        results[table] = 0;
        continue;
      }

      const sheetName = table;
      // Pastikan sheet (tab) untuk tabel ini ada; kalau belum, buat dulu.
      await ensureSheetExists(sheets, sheetId, sheetName);

      const header = rows.length > 0 ? Object.keys(rows[0]) : [];
      const values = [
        header,
        ...rows.map((r) => header.map((h) => formatCell(r[h]))),
      ];

      await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:ZZ100000`,
      });

      if (values.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          requestBody: { values },
        });
      }

      results[table] = rows.length;
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

async function ensureSheetExists(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetName: string,
) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some(
    (s) => s.properties?.title === sheetName,
  );
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: sheetName } } }],
    },
  });
}
