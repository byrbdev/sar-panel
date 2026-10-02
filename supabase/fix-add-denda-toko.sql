-- =====================================================================
-- FITUR: Denda Toko (per bulan)
--
-- Super Admin: lihat semua denda, filter bulan/tahun, tambah/ubah/hapus.
-- Member     : lapor denda untuk toko miliknya sendiri lewat menu "Denda",
--              dan hanya bisa melihat denda miliknya sendiri.
--
-- Satu tabel yang sama dipakai kedua sisi; bedanya hanya cara ambil data
-- (Super Admin = semua baris, Member = owner_id miliknya, dijaga RLS).
--
-- PENTING: tabel ini MURNI pencatatan. Tidak ada trigger/view/rumus yang
-- menghubungkannya ke omzet, profit, atau Top Up iklan.
--
-- Jalankan file ini sekali di Supabase SQL Editor. Aman dijalankan ulang.
-- =====================================================================

create table if not exists public.denda_toko (
  id bigint generated always as identity primary key,
  toko_id bigint references public.toko(id) on delete set null,
  nama_toko text not null,                                   -- disalin saat dicatat, tetap terbaca walau toko diganti nama/dihapus
  owner_id uuid references public.profiles(id) on delete set null, -- member pemilik toko saat denda dicatat
  pemilik text,
  jumlah numeric not null check (jumlah > 0),
  keterangan text,
  tanggal timestamptz not null default now()                 -- dasar pengelompokan per bulan (WIB di sisi aplikasi)
);

create index if not exists idx_denda_toko_owner on public.denda_toko(owner_id);
create index if not exists idx_denda_toko_tanggal on public.denda_toko(tanggal);

alter table public.denda_toko enable row level security;

-- Super admin & admin melihat semua. Member hanya melihat miliknya sendiri.
drop policy if exists "denda_toko_select" on public.denda_toko;
create policy "denda_toko_select" on public.denda_toko
  for select using (is_admin_or_super() or owner_id = auth.uid());

-- Super admin boleh mencatat untuk toko mana pun. Member HANYA boleh
-- mencatat atas nama dirinya sendiri, dan hanya untuk toko yang memang
-- miliknya (dicek ke tabel toko, bukan percaya kiriman browser).
drop policy if exists "denda_toko_insert" on public.denda_toko;
create policy "denda_toko_insert" on public.denda_toko
  for insert with check (
    public.is_super_admin()
    or (
      owner_id = auth.uid()
      and exists (
        select 1 from public.toko t
        where t.id = toko_id and t.owner_id = auth.uid()
      )
    )
  );

-- Ubah & hapus: hanya super admin (member tidak bisa mengubah laporan yang sudah terkirim).
drop policy if exists "denda_toko_update" on public.denda_toko;
create policy "denda_toko_update" on public.denda_toko
  for update using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "denda_toko_delete" on public.denda_toko;
create policy "denda_toko_delete" on public.denda_toko
  for delete using (public.is_super_admin());

-- Realtime supaya data laporan member langsung muncul di Super Admin.
do $$ begin
  alter publication supabase_realtime add table public.denda_toko;
exception when duplicate_object then null; end $$;
