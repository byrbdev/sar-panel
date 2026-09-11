-- Jalankan kalau tabel penjualan & pesanan_masuk sudah dibuat sebelum kolom
-- ini ditambahkan. Aman dijalankan berkali-kali.
alter table penjualan add column if not exists no_pesanan_al text;
alter table pesanan_masuk add column if not exists no_pesanan_al text;
