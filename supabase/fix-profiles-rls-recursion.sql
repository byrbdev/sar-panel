-- ============================================================================
-- FIX: Infinite recursion pada RLS policy tabel `profiles`
-- ============================================================================
-- Jalankan di Supabase Dashboard > SQL Editor.
--
-- MASALAH:
-- Policy lama melakukan `exists (select 1 from profiles p where ...)` di
-- dalam policy tabel `profiles` itu sendiri. Postgres menerapkan RLS lagi ke
-- subquery tsb, memicu error:
--   "infinite recursion detected in policy for relation \"profiles\""
--
-- Akibatnya query select profile SELALU gagal (error), AuthContext.tsx
-- menelan error itu diam-diam (setProfile(null)), dan halaman /admin/default
-- jadi blank putih selamanya (redirect loop dengan /auth/sign-in).
--
-- SOLUSI:
-- Buat helper function SECURITY DEFINER (bypass RLS saat dipanggil dari
-- dalam policy, karena berjalan dengan hak akses pemilik function, bukan
-- pemanggil), lalu pakai function itu di policy — bukan subquery langsung
-- ke tabel `profiles`.
-- ============================================================================

-- 1) Helper function yang aman dari recursion.
--    (Fungsi ini boleh dipanggil bebas, termasuk dari dalam policy profiles,
--     karena SECURITY DEFINER membuatnya berjalan tanpa terkena RLS lagi.)
create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

-- 2) Ganti policy SELECT supaya tidak query dirinya sendiri secara langsung.
drop policy if exists "profiles_select_self_or_superadmin" on profiles;
create policy "profiles_select_self_or_superadmin" on profiles
  for select using (
    id = auth.uid()
    or public.is_super_admin()
  );

-- 3) Ganti policy WRITE (insert/update/delete) juga — sama-sama recursive.
drop policy if exists "profiles_write_superadmin_only" on profiles;
create policy "profiles_write_superadmin_only" on profiles
  for all using (
    public.is_super_admin()
  ) with check (
    public.is_super_admin()
  );

-- Selesai. current_role_app() dan is_admin_or_super() yang sudah ada di
-- schema.sql kamu TIDAK perlu diubah — keduanya sudah SECURITY DEFINER
-- dan tidak dipakai langsung sebagai policy tabel `profiles`, jadi aman.
