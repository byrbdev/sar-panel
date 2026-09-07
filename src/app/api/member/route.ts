import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from 'lib/supabaseAdmin';
import { supabase } from 'lib/supabaseClient';

/**
 * POST /api/member
 * Body: { nama: string, email: string, password: string, role: 'admin' | 'member' }
 *
 * Hanya boleh dipanggil oleh Super Admin. Verifikasi dilakukan dengan
 * memeriksa token Authorization (JWT) milik pemanggil, lalu memastikan
 * baris profiles miliknya role = 'super_admin'. Service Role Key TIDAK
 * PERNAH dikirim ke client — hanya dipakai di server ini.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verifikasi siapa yang memanggil, lalu cek role-nya super_admin
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

    const body = await req.json();
    const { nama, email, password, role } = body as {
      nama: string;
      email: string;
      password: string;
      role: 'admin' | 'member';
    };

    if (!nama || !email || !password || !role) {
      return NextResponse.json(
        { error: 'nama, email, password, role wajib diisi' },
        { status: 400 },
      );
    }
    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }

    // Buat akun auth baru (server-side, pakai service role)
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createErr || !created.user) {
      return NextResponse.json(
        { error: createErr?.message || 'Gagal membuat akun' },
        { status: 400 },
      );
    }

    // Buat baris profile terkait
    const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
      id: created.user.id,
      nama,
      role,
    });

    if (profileErr) {
      // rollback: hapus auth user kalau insert profile gagal
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: profileErr.message }, { status: 400 });
    }

    return NextResponse.json({
      id: created.user.id,
      nama,
      email,
      role,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/member?id=xxx
 * Menghapus akun auth + profile. Hanya super_admin.
 */
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) {
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

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id wajib diisi' }, { status: 400 });
    }

    await supabaseAdmin.auth.admin.deleteUser(id);
    await supabaseAdmin.from('profiles').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
