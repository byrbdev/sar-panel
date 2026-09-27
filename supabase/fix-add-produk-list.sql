-- =====================================================================
-- FIX: Dukungan multi-produk dalam satu invoice/No Pesanan AL.
--
-- Satu pembeli / satu checkout bisa punya beberapa produk berbeda
-- (Produk + Varian + SKU) dalam satu transaksi. Sebelumnya tabel
-- `penjualan` & `orders` cuma punya SATU slot produk. Sekarang produk
-- utama tetap di kolom seperti biasa, dan produk TAMBAHAN (kalau ada)
-- disimpan sebagai JSON array di kolom `produk_list`.
--
-- Finansial (harga_jual, modal_shopee/modal) TIDAK berubah -- tetap satu
-- nilai untuk seluruh invoice, tidak dipecah per produk.
--
-- Jalankan file ini sekali di Supabase SQL Editor.
-- =====================================================================

-- Tabel penjualan: kolom `varian` belum pernah ada sebelumnya.
alter table public.penjualan
  add column if not exists varian text default '';

alter table public.penjualan
  add column if not exists produk_list jsonb;

-- Tabel pesanan_masuk (Pesanan Masuk / Lapor Penjualan dari member)
alter table public.pesanan_masuk
  add column if not exists produk_list jsonb;

comment on column public.penjualan.produk_list is
  'Array produk TAMBAHAN dalam invoice/No Pesanan AL yang sama, di luar produk utama (nama_produk/varian/sku_produk). Format: [{"id","namaProduk","varian","skuProduk"}]';
comment on column public.pesanan_masuk.produk_list is
  'Array produk TAMBAHAN dalam invoice/No Pesanan AL yang sama, di luar produk utama (produk/varian/sku). Format: [{"id","namaProduk","varian","skuProduk"}]';
