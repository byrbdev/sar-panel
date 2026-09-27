-- =====================================================================
-- FIX: Tambah kolom "ID Produk" di database Brutal.
--
-- Jalankan file ini sekali di Supabase SQL Editor.
-- =====================================================================

alter table public.brutal_items
  add column if not exists id_produk text default '';

comment on column public.brutal_items.id_produk is
  'ID Produk (identitas produk di marketplace, terpisah dari SKU)';
