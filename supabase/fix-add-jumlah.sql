-- =====================================================================
-- FIX: Kolom "Jumlah Per Pcs" untuk produk utama.
--
-- Produk utama menyimpan jumlahnya di kolom `jumlah` (default 1).
-- Jumlah produk TAMBAHAN disimpan di dalam JSON `produk_list`
-- (field "jumlah" per item), jadi tidak butuh kolom baru.
--
-- Jalankan file ini sekali di Supabase SQL Editor.
-- =====================================================================

alter table public.penjualan
  add column if not exists jumlah integer not null default 1;

alter table public.pesanan_masuk
  add column if not exists jumlah integer not null default 1;

comment on column public.penjualan.jumlah is
  'Jumlah per pcs produk utama (default 1). Dipakai Analisa sebagai jumlah terjual.';
comment on column public.pesanan_masuk.jumlah is
  'Jumlah per pcs produk utama (default 1).';
