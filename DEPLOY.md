# Panduan Deploy — Panel Dropship By RB

Panduan ini mengasumsikan kamu belum pernah pakai Supabase/Vercel sama
sekali. Ikuti urut dari atas ke bawah.

---

## BAGIAN 1 — Setup Supabase (Database + Auth)

### 1.1 Buat Project
1. Buka https://supabase.com → **Sign up / Login** (bisa pakai akun GitHub/Google)
2. Klik **New Project**
3. Isi:
   - **Name**: `panel-dropship-rb` (bebas)
   - **Database Password**: buat password kuat, **simpan di tempat aman**
   - **Region**: pilih `Southeast Asia (Singapore)` — paling dekat & cepat untuk Indonesia
4. Klik **Create new project**, tunggu ±2 menit sampai project siap

### 1.2 Jalankan Skema Database
1. Di sidebar kiri project Supabase, klik **SQL Editor**
2. Klik **New query**
3. Buka file `supabase/schema.sql` yang ada di project ini, **copy semua isinya**
4. Paste ke SQL Editor, klik **Run** (atau `Ctrl+Enter`)
5. Pastikan muncul "Success. No rows returned" — kalau ada error merah, screenshot dan cek lagi apakah ada bagian yang ke-skip saat copy

### 1.3 Ambil Kredensial API
1. Di sidebar, klik **Project Settings** (ikon gerigi) → **API**
2. Catat 3 hal ini (akan dipakai nanti):
   - **Project URL** → contoh: `https://xxxxxxxxxxxx.supabase.co`
   - **anon public** key (di bagian Project API keys)
   - **service_role** key (di bagian yang sama, **klik "Reveal"** dulu — INI RAHASIA, jangan share ke siapapun & jangan commit ke Git)

### 1.4 Buat Akun Super Admin Pertama
Karena tidak ada UI untuk bikin akun Super Admin (harus ada 1 dulu sebelum
bisa bikin akun lain lewat panel), buat manual:

1. Di sidebar Supabase, klik **Authentication** → **Users** → **Add user** → **Create new user**
2. Isi email & password kamu sendiri, centang **Auto Confirm User**, klik **Create user**
3. Copy **User UID** yang muncul di daftar user (bentuknya seperti `a1b2c3d4-...`)
4. Buka lagi **SQL Editor** → **New query**, jalankan (ganti `PASTE_USER_UID_DISINI` dan nama kamu):

```sql
insert into profiles (id, nama, role)
values ('PASTE_USER_UID_DISINI', 'Nama Kamu', 'super_admin');
```

5. Klik **Run**. Sekarang kamu punya akun Super Admin.

---

## BAGIAN 2 — Setup Google Sheets Backup (Opsional, bisa dilakukan belakangan)

### 2.1 Buat Google Sheet
1. Buka https://sheets.google.com → buat spreadsheet baru, kasih nama misal "Backup Panel Dropship"
2. Lihat URL-nya: `https://docs.google.com/spreadsheets/d/INI_ID_SHEET_NYA/edit`
3. Copy bagian `INI_ID_SHEET_NYA` — itu **GOOGLE_SHEET_ID**

### 2.2 Buat Service Account
1. Buka https://console.cloud.google.com
2. Buat project baru (atau pakai yang sudah ada) → beri nama bebas
3. Di search bar atas, cari **"Google Sheets API"** → klik **Enable**
4. Di sidebar kiri: **APIs & Services** → **Credentials**
5. Klik **Create Credentials** → **Service Account**
6. Isi nama bebas (misal `panel-dropship-backup`), klik **Create and Continue** → **Done**
7. Klik service account yang baru dibuat → tab **Keys** → **Add Key** → **Create new key** → pilih **JSON** → **Create**
8. File JSON otomatis ke-download. Buka file itu, cari 2 nilai:
   - `client_email` → itu **GOOGLE_SERVICE_ACCOUNT_EMAIL**
   - `private_key` → itu **GOOGLE_PRIVATE_KEY** (isinya panjang, ada `-----BEGIN PRIVATE KEY-----` dst, termasuk karakter `\n`)

### 2.3 Share Google Sheet ke Service Account
1. Balik ke Google Sheet yang tadi dibuat
2. Klik **Share** (kanan atas)
3. Paste email dari `client_email` tadi (bentuknya seperti `xxx@xxx.iam.gserviceaccount.com`)
4. Kasih akses **Editor**, klik **Send** (boleh un-check "Notify people")

Simpan 3 nilai ini untuk Bagian 3 nanti: `GOOGLE_SHEET_ID`,
`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`.

---

## BAGIAN 3 — Push ke GitHub

1. Extract file zip project ini ke folder di komputer kamu
2. Buka terminal di folder itu, jalankan:

```bash
git init
git add .
git commit -m "Initial commit"
```

3. Buat repository baru di https://github.com/new (bisa Private), **jangan** centang "Add README"
4. Jalankan (ganti URL dengan punya kamu):

```bash
git remote add origin https://github.com/USERNAME/panel-dropship-rb.git
git branch -M main
git push -u origin main
```

---

## BAGIAN 4 — Deploy ke Vercel

### 4.1 Import Project
1. Buka https://vercel.com → **Sign up / Login** (paling gampang pakai akun GitHub)
2. Klik **Add New** → **Project**
3. Cari & pilih repository `panel-dropship-rb` yang barusan di-push → klik **Import**
4. Framework Preset otomatis kedetect **Next.js** — biarkan default, **jangan klik Deploy dulu**

### 4.2 Isi Environment Variables
Sebelum deploy, scroll ke bagian **Environment Variables**, tambahkan satu-satu:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari langkah 1.3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key dari langkah 1.3 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key dari langkah 1.3 |
| `GOOGLE_SHEET_ID` | dari langkah 2.1 (boleh dilewati dulu kalau belum setup) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | dari langkah 2.2 (boleh dilewati dulu) |
| `GOOGLE_PRIVATE_KEY` | dari langkah 2.2 — **paste apa adanya termasuk `\n`** (boleh dilewati dulu) |

Pastikan tidak ada spasi tambahan di awal/akhir value.

### 4.3 Deploy
1. Klik **Deploy**
2. Tunggu ±2-3 menit sampai muncul "Congratulations" dan link seperti `panel-dropship-rb.vercel.app`
3. Klik link itu untuk buka website-nya

### 4.4 Setting Redirect URL di Supabase (WAJIB, kalau tidak login akan gagal)
1. Balik ke Supabase → **Authentication** → **URL Configuration**
2. Di **Site URL**, isi URL Vercel kamu, contoh: `https://panel-dropship-rb.vercel.app`
3. Di **Redirect URLs**, tambahkan juga URL yang sama (+ `/**` di belakangnya kalau diminta)
4. Klik **Save**

---

## BAGIAN 5 — Testing Setelah Deploy

Lakukan urut, jangan skip:

1. **Login** — buka `https://panel-dropship-rb.vercel.app/auth/sign-in`, login pakai akun Super Admin dari langkah 1.4
2. **Tes Toko** — buka menu Toko, tambah 1 toko dummy, pilih Nama pemilik dari dropdown (kalau dropdown kosong, tambah dulu Member di menu Member)
3. **Cek di Supabase** — buka **Table Editor** → tabel `toko`, pastikan barisnya muncul
4. **Refresh browser** — data harus tetap ada (bukti sudah tersimpan permanen, bukan cuma di memori browser)
5. **Tes Member** — buka menu Member, tambah 1 akun dengan role Member, catat email/password-nya
6. **Tes login sebagai Member** — logout, login pakai akun Member tadi, pastikan dashboard-nya beda (cuma lihat toko miliknya)
7. **Tes alur Penjualan** — sebagai Member, klik "Lapor Penjualan", isi data, kirim. Login lagi sebagai Super Admin, cek muncul di "Pesanan Masuk Realtime", klik "Proses", isi harga, simpan. Login lagi sebagai Member, cek Omzet & Profit sudah muncul di dashboardnya
8. **Tes Backup Sheets** (kalau sudah setup Bagian 2) — sebagai Super Admin, buka menu Setting → klik "Backup Sekarang", cek Google Sheet-nya ke-update

---

## Troubleshooting Umum

**"Supabase belum dikonfigurasi" masih muncul di production**
→ Pastikan environment variables di Vercel sudah benar, lalu **redeploy** (Vercel → Deployments → titik tiga → Redeploy). Env var baru tidak otomatis ke-apply ke deployment lama.

**Login berhasil tapi langsung ke-redirect balik ke halaman login**
→ Cek **Site URL** & **Redirect URLs** di Supabase Authentication settings (Bagian 4.4), harus persis sama dengan domain Vercel kamu.

**Data tidak muncul / kosong terus padahal sudah ditambah**
→ Buka Browser DevTools → tab Console, cek ada error merah atau tidak. Kemungkinan besar RLS policy menolak karena role belum sesuai — cek tabel `profiles`, pastikan baris user itu ada dan role-nya benar.

**Backup Sheets gagal**
→ Pastikan Google Sheet sudah di-**share** ke email service account dengan akses **Editor** (bukan Viewer), dan `GOOGLE_PRIVATE_KEY` di-copy lengkap termasuk baris `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`.

**Ingin custom domain (bukan `.vercel.app`)**
→ Vercel → Project Settings → Domains → tambahkan domain kamu, ikuti instruksi DNS yang diberikan. Setelah aktif, update lagi **Site URL** di Supabase (Bagian 4.4) ke domain baru.
