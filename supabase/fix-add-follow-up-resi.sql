-- =====================================================================
-- FITUR: Halaman Resi + Follow Up Resi
--
-- Member menekan "Follow Up" di halaman Resi untuk penjualan yang resinya
-- belum diisi. Baris permintaan disimpan di tabel `follow_up_resi` dan
-- muncul sebagai notifikasi "Follow Up Resi" di Admin & Super Admin.
--
-- Jalankan file ini sekali di Supabase SQL Editor. Aman dijalankan ulang.
-- =====================================================================

create table if not exists public.follow_up_resi (
  id bigint generated always as identity primary key,
  penjualan_id bigint not null references public.penjualan(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null, -- member yang follow up
  no_pesanan_al text,
  nama_toko text,
  created_at timestamptz not null default now()
);

create index if not exists idx_follow_up_resi_penjualan on public.follow_up_resi(penjualan_id);
create index if not exists idx_follow_up_resi_owner on public.follow_up_resi(owner_id);

alter table public.follow_up_resi enable row level security;

-- Admin & super_admin melihat semua. Member hanya melihat miliknya sendiri.
drop policy if exists "follow_up_resi_select" on public.follow_up_resi;
create policy "follow_up_resi_select" on public.follow_up_resi
  for select using (is_admin_or_super() or owner_id = auth.uid());

-- Member hanya boleh membuat follow up atas nama dirinya sendiri, DAN hanya
-- untuk penjualan yang memang miliknya.
drop policy if exists "follow_up_resi_insert" on public.follow_up_resi;
create policy "follow_up_resi_insert" on public.follow_up_resi
  for insert with check (
    is_admin_or_super()
    or (
      owner_id = auth.uid()
      and exists (
        select 1 from public.penjualan p
        where p.id = penjualan_id and p.owner_id = auth.uid()
      )
    )
  );

-- Hapus: admin/super_admin, atau member pemiliknya (dipakai saat Follow Up
-- ulang -- baris lama diganti baris baru).
drop policy if exists "follow_up_resi_delete" on public.follow_up_resi;
create policy "follow_up_resi_delete" on public.follow_up_resi
  for delete using (is_admin_or_super() or owner_id = auth.uid());

drop policy if exists "follow_up_resi_update_admin" on public.follow_up_resi;
create policy "follow_up_resi_update_admin" on public.follow_up_resi
  for update using (is_admin_or_super());

-- Begitu resi terisi (dari halaman Resi, form Penjualan, atau cara apa pun),
-- follow up untuk penjualan itu otomatis dibersihkan.
create or replace function public.clear_follow_up_when_resi_filled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.no_resi is not null
     and trim(new.no_resi) <> ''
     and trim(new.no_resi) <> '-' then
    delete from public.follow_up_resi where penjualan_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clear_follow_up_resi on public.penjualan;
create trigger trg_clear_follow_up_resi
  after insert or update of no_resi on public.penjualan
  for each row
  execute function public.clear_follow_up_when_resi_filled();

-- Realtime supaya notifikasi masuk ke Admin tanpa refresh.
do $$ begin
  alter publication supabase_realtime add table public.follow_up_resi;
exception when duplicate_object then null; end $$;
