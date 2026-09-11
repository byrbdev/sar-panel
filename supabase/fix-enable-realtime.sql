-- ============================================================================
-- FIX: Aktifkan Realtime Replication
-- ============================================================================
-- Jalankan ini kalau kamu sudah pernah setup Supabase sebelumnya dan data
-- baru tidak muncul otomatis tanpa refresh browser. Tanpa tabel didaftarkan
-- ke publication 'supabase_realtime', perubahan data TIDAK di-broadcast ke
-- browser lain meskipun RLS & kode frontend sudah benar.
-- Aman dijalankan berkali-kali.
-- ============================================================================

do $$ begin
  alter publication supabase_realtime add table toko;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table pesanan_masuk;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table penjualan;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table refund;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table brutal_items;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table data_buyer;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table profiles;
exception when duplicate_object then null; end $$;

-- Verifikasi: jalankan query ini, harus muncul 7 baris tabel di atas
select schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime';
