-- ============================================================================
-- PANEL DROPSHIP BY RB — SUPABASE SCHEMA + ROW LEVEL SECURITY
-- ============================================================================
-- Jalankan file ini di Supabase Dashboard > SQL Editor (sekali jalan, urutan
-- sudah benar). Aman dijalankan ulang karena pakai IF NOT EXISTS / OR REPLACE.
--
-- ARSITEKTUR KEAMANAN:
-- - Semua tabel punya RLS aktif. Browser HANYA pakai anon key + JWT user yang
--   login. Tanpa RLS yang mengizinkan, query akan selalu kosong/ditolak,
--   walau seseorang membuka Network tab dan melihat request mentahnya.
-- - Service role key (dipakai di src/lib/supabaseAdmin.ts) HANYA hidup di
--   server (API route), tidak pernah dikirim ke browser, dan itu satu-satunya
--   cara membuat akun auth baru untuk member.
-- ============================================================================

-- ---------- 1. ROLE ENUM ----------
do $$ begin
  create type app_role as enum ('super_admin', 'admin', 'member');
exception when duplicate_object then null; end $$;

-- ---------- 2. PROFILES (1:1 dengan auth.users) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  role app_role not null default 'member',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Helper function aman dari recursion (SECURITY DEFINER, bypass RLS saat
-- dipanggil dari dalam policy tabel profiles itu sendiri).
create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Semua user login boleh baca profile dirinya sendiri; super_admin boleh baca semua.
drop policy if exists "profiles_select_self_or_superadmin" on profiles;
create policy "profiles_select_self_or_superadmin" on profiles
  for select using (
    id = auth.uid()
    or public.is_super_admin()
  );

-- Hanya super_admin yang boleh insert/update/delete profile (buat akun member baru dsb).
drop policy if exists "profiles_write_superadmin_only" on profiles;
create policy "profiles_write_superadmin_only" on profiles
  for all using (
    public.is_super_admin()
  ) with check (
    public.is_super_admin()
  );

-- ---------- 3. HELPER: current user role ----------
create or replace function current_role_app() returns app_role
language sql stable security definer as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin_or_super() returns boolean
language sql stable security definer as $$
  select current_role_app() in ('admin', 'super_admin');
$$;

-- ---------- 4. TOKO ----------
create table if not exists toko (
  id bigint generated always as identity primary key,
  owner_id uuid references profiles(id) on delete set null, -- member pemilik toko
  nama text not null,          -- nama pemilik (redundant tapi cepat dibaca)
  email text,
  metode text,
  nama_toko text not null,
  denda numeric not null default 0,
  pelanggaran text default '-',
  saldo_iklan numeric not null default 0,
  status_akun_toko text not null default 'Aktif', -- Aktif | Ban
  created_at timestamptz not null default now()
);

alter table toko enable row level security;

-- Super admin & admin: full access. Member: hanya baca toko miliknya sendiri.
drop policy if exists "toko_select" on toko;
create policy "toko_select" on toko for select using (
  is_admin_or_super() or owner_id = auth.uid()
);

drop policy if exists "toko_write_admin_super" on toko;
create policy "toko_write_admin_super" on toko for all using (
  is_admin_or_super()
) with check (
  is_admin_or_super()
);

-- ---------- 5. PESANAN MASUK (laporan dari member, status default Menunggu) ----------
create table if not exists pesanan_masuk (
  id bigint generated always as identity primary key,
  reporter_id uuid references profiles(id) on delete set null, -- member pelapor
  nama text not null,
  toko text not null,
  produk text not null,
  varian text,
  sku text,
  no_hp text,
  alamat text,
  keterangan text,
  no_pesanan_al text,
  harga_jual numeric default 0, -- estimasi awal dari member, bisa 0/null
  modal numeric default 0,
  status text not null default 'Menunggu', -- Menunggu | Diproses | Terkirim(hapus setelah diproses) | Refund
  tanggal timestamptz not null default now()
);

alter table pesanan_masuk enable row level security;

-- Admin & super_admin lihat semua pesanan masuk. Member hanya lihat & insert punya dia sendiri.
drop policy if exists "pesanan_masuk_select" on pesanan_masuk;
create policy "pesanan_masuk_select" on pesanan_masuk for select using (
  is_admin_or_super() or reporter_id = auth.uid()
);

drop policy if exists "pesanan_masuk_insert_member" on pesanan_masuk;
create policy "pesanan_masuk_insert_member" on pesanan_masuk for insert with check (
  reporter_id = auth.uid() or is_admin_or_super()
);

-- Hanya admin/super_admin yang boleh update (proses) atau hapus pesanan masuk.
drop policy if exists "pesanan_masuk_update_admin" on pesanan_masuk;
create policy "pesanan_masuk_update_admin" on pesanan_masuk for update using (
  is_admin_or_super()
);

drop policy if exists "pesanan_masuk_delete_admin" on pesanan_masuk;
create policy "pesanan_masuk_delete_admin" on pesanan_masuk for delete using (
  is_admin_or_super()
);

-- ---------- 6. PENJUALAN ----------
create table if not exists penjualan (
  id bigint generated always as identity primary key,
  nama_toko text not null,
  nama_pembeli text,
  no_hp text,
  alamat_pembeli text,
  nama_produk text,
  sku_produk text,
  no_pesanan_al text,
  harga_jual numeric not null default 0,
  modal_shopee numeric not null default 0,
  no_resi text,
  jasa_pengiriman text,
  status_pengiriman text not null default 'Terkirim', -- Terkirim | Refund
  status_akun_toko text not null default 'Aktif',      -- Aktif | Ban
  owner_id uuid references profiles(id) on delete set null, -- member pemilik toko (untuk isolasi dashboard)
  tanggal_transaksi timestamptz not null default now()
);

alter table penjualan enable row level security;

-- Super admin & admin lihat semua. Member cuma lihat penjualan dari toko miliknya sendiri.
drop policy if exists "penjualan_select" on penjualan;
create policy "penjualan_select" on penjualan for select using (
  is_admin_or_super() or owner_id = auth.uid()
);

-- Hanya admin/super_admin yang boleh insert/update/delete (proses transaksi & refund).
drop policy if exists "penjualan_write_admin_super" on penjualan;
create policy "penjualan_write_admin_super" on penjualan for all using (
  is_admin_or_super()
) with check (
  is_admin_or_super()
);

-- ---------- 7. REFUND ----------
create table if not exists refund (
  id bigint generated always as identity primary key,
  nama text,
  nama_toko text,
  email_toko text,
  no_hp text,
  sku text,
  no_pesanan_al text default '-',
  no_pesanan_shp text default '-',
  update_no_pesanan text default '-',
  alasan text not null default 'Refund',
  keterangan text,
  status text not null default 'Belum', -- Belum | Proses | Selesai
  nama_produk text,
  omzet numeric,
  profit numeric,
  alamat text,
  owner_id uuid references profiles(id) on delete set null,
  tanggal timestamptz not null default now()
);

alter table refund enable row level security;

drop policy if exists "refund_select" on refund;
create policy "refund_select" on refund for select using (
  is_admin_or_super() or owner_id = auth.uid()
);

drop policy if exists "refund_write_admin_super" on refund;
create policy "refund_write_admin_super" on refund for all using (
  is_admin_or_super()
) with check (
  is_admin_or_super()
);

-- ---------- 8. BRUTAL ITEMS ----------
create table if not exists brutal_items (
  id bigint generated always as identity primary key,
  anggota_id uuid references profiles(id) on delete cascade,
  nama_toko text,
  kategori_toko text,
  produk text,
  status text not null default 'Muncul', -- Muncul | Tidak
  iklan text not null default 'Iklan',   -- Iklan | Tidak
  orderan text,
  sku text,
  jumlah_terjual text,
  ulasan_produk text,
  review_produk text,
  rating_toko text,
  pelanggaran text,
  keterangan text,
  tanggal timestamptz not null default now()
);

alter table brutal_items enable row level security;

-- Super admin & admin lihat semua data brutal semua anggota. Member cuma lihat & kelola miliknya sendiri.
drop policy if exists "brutal_select" on brutal_items;
create policy "brutal_select" on brutal_items for select using (
  is_admin_or_super() or anggota_id = auth.uid()
);

drop policy if exists "brutal_write" on brutal_items;
create policy "brutal_write" on brutal_items for all using (
  is_admin_or_super() or anggota_id = auth.uid()
) with check (
  is_admin_or_super() or anggota_id = auth.uid()
);

-- ---------- 9. DATA BUYER ----------
create table if not exists data_buyer (
  id bigint generated always as identity primary key,
  no_hp text,
  akun_buyer text,
  akun_al text,
  status text not null default 'KOSONG', -- DIPAKAI | KOSONG
  keterangan text,
  tanggal timestamptz not null default now()
);

alter table data_buyer enable row level security;

-- Hanya admin & super_admin yang mengakses Data Buyer (Member tidak butuh).
drop policy if exists "data_buyer_all_admin_super" on data_buyer;
create policy "data_buyer_all_admin_super" on data_buyer for all using (
  is_admin_or_super()
) with check (
  is_admin_or_super()
);

-- ---------- 10. REALTIME — WAJIB supaya data baru muncul otomatis tanpa refresh ----------
-- Tanpa ini, perubahan data TIDAK akan ter-broadcast ke browser lain meskipun
-- RLS sudah benar. Aman dijalankan ulang (ON CONFLICT DO NOTHING via exception).
do $$
begin
  alter publication supabase_realtime add table toko;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table pesanan_masuk;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table penjualan;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table refund;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table brutal_items;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table data_buyer;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table profiles;
exception when duplicate_object then null; end $$;

-- ---------- 11. INDEX untuk performa query mapping toko -> pemilik ----------
create index if not exists idx_toko_owner on toko(owner_id);
create index if not exists idx_penjualan_owner on penjualan(owner_id);
create index if not exists idx_refund_owner on refund(owner_id);
create index if not exists idx_brutal_anggota on brutal_items(anggota_id);
create index if not exists idx_pesanan_masuk_reporter on pesanan_masuk(reporter_id);

-- ============================================================================
-- CATATAN PENTING SAAT PAKAI:
-- 1. Buat akun via API route /api/member (pakai service role, server-side)
--    supaya baris di 'profiles' otomatis terisi role & nama yang benar.
-- 2. Saat Super Admin men-setting toko baru, WAJIB isi owner_id = id member
--    pemiliknya, supaya data ke-mapping otomatis ke dashboard member itu.
-- 3. Saat Admin "Proses" pesanan masuk jadi Penjualan, isi owner_id di baris
--    'penjualan' dari pesanan_masuk.reporter_id (dilanjutkan) ATAU dari
--    toko.owner_id (dicari via nama_toko) — pilih salah satu source of truth.
--    Contoh disarankan: ambil dari toko.owner_id supaya konsisten dengan
--    kepemilikan toko yang di-setting Super Admin.
-- ============================================================================
