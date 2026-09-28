-- =====================================================================
-- FIX: Setup Backup ke Google Spreadsheet lebih simpel -- Sheet ID
-- sekarang disimpan di database & diisi lewat UI Setting (Super Admin),
-- bukan lewat environment variable lagi.
--
-- Kredensial rahasia (Service Account email + private key) TETAP di
-- environment variable (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)
-- karena itu credential sensitif yang seharusnya memang tidak disimpan di
-- database / tidak boleh terlihat di UI.
--
-- Jalankan file ini sekali di Supabase SQL Editor.
-- =====================================================================

create table if not exists app_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id) on delete set null
);

alter table app_settings enable row level security;

-- Semua role login boleh BACA (dipakai buat cek status koneksi dsb),
-- tapi cuma Super Admin yang boleh UBAH.
drop policy if exists "app_settings_select" on app_settings;
create policy "app_settings_select" on app_settings for select using (
  auth.role() = 'authenticated'
);

drop policy if exists "app_settings_write_super" on app_settings;
create policy "app_settings_write_super" on app_settings for all using (
  public.is_super_admin()
) with check (
  public.is_super_admin()
);
