-- Jalankan ini kalau tabel `toko` sudah dibuat sebelumnya (sebelum kolom
-- status_akun_toko ditambahkan ke schema.sql). Aman dijalankan berkali-kali.
alter table toko add column if not exists status_akun_toko text not null default 'Aktif';
