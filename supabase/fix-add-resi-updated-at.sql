-- =====================================================================
-- FIX: Notifikasi "resi masuk" untuk Member harus benar-benar tersimpan
-- di database (bukan cuma di browser) dan otomatis "hilang" 3 hari
-- setelah resi diisi.
--
-- Sebelum fix ini, notifikasi cuma dihitung ulang dari kolom `no_resi`
-- setiap kali halaman dibuka, TANPA ada catatan waktu kapan resi itu
-- diisi -- jadi tidak mungkin tahu kapan sebuah notifikasi harus
-- kedaluwarsa (3 hari), dan aplikasi hanya bisa menampilkan status
-- "ada resi atau tidak" apa adanya.
--
-- Fix: tambahkan kolom `resi_updated_at`, diisi OTOMATIS oleh trigger
-- setiap kali `no_resi` berubah (bukan diisi manual dari client), lalu
-- aplikasi memfilter notifikasi yang `resi_updated_at` masih dalam
-- 3 hari terakhir.
--
-- Jalankan file ini sekali di Supabase SQL Editor.
-- =====================================================================

alter table public.penjualan
  add column if not exists resi_updated_at timestamptz;

-- Backfill: baris lama yang sudah punya no_resi dianggap baru saja diisi
-- (supaya tidak langsung semua "expired" begitu fitur ini di-deploy).
update public.penjualan
set resi_updated_at = now()
where no_resi is not null
  and trim(no_resi) <> ''
  and trim(no_resi) <> '-'
  and resi_updated_at is null;

create or replace function public.set_penjualan_resi_updated_at()
returns trigger as $$
begin
  if (
    new.no_resi is not null
    and trim(new.no_resi) <> ''
    and trim(new.no_resi) <> '-'
  ) and (
    tg_op = 'INSERT'
    or old.no_resi is distinct from new.no_resi
  ) then
    new.resi_updated_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_penjualan_resi_updated_at on public.penjualan;
create trigger trg_penjualan_resi_updated_at
  before insert or update on public.penjualan
  for each row
  execute function public.set_penjualan_resi_updated_at();

-- Opsional tapi direkomendasikan: bersihkan notifikasi yang sudah lewat
-- 3 hari secara berkala supaya `resi_updated_at` tidak menumpuk selamanya
-- (data penjualannya SENDIRI tidak dihapus, cuma "jam notifikasi"-nya saja
-- di-reset supaya tidak lagi muncul sebagai notifikasi baru).
-- Jadwalkan via Supabase Cron (pg_cron) kalau tersedia di plan Anda:
--
-- select cron.schedule(
--   'clear-expired-resi-notif',
--   '0 * * * *', -- tiap jam
--   $$ update public.penjualan
--      set resi_updated_at = null
--      where resi_updated_at < now() - interval '3 days'; $$
-- );
