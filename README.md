# Frontend Web PLN (Pusdiklat LMS)

Ini adalah repositori frontend untuk proyek Web PLN (Learning Management System). Proyek ini dibangun menggunakan Node.js, Express.js (sebagai view renderer server), EJS (View Engine), dan Tailwind CSS.

## Persyaratan Sistem (Prerequisites)

Pastikan perangkat Anda telah memenuhi prasyarat berikut sebelum menjalankan aplikasi:

1. **Node.js** (Sangat diwajibkan menggunakan versi **v20.6.0** atau lebih baru)
   - Proyek frontend ini menggunakan fitur *native* Node.js untuk membaca environment variables (`node --env-file`), sehingga memerlukan versi Node.js yang memadai (v20.6.0+).
   - Anda dapat mengunduh Node.js dari [nodejs.org](https://nodejs.org/).
   - Untuk memverifikasi versi, jalankan: `node -v`
2. **Backend Server**
   - Pastikan **Backend Web PLN** dan **Database PostgreSQL** sudah Anda setup dan sedang berjalan secara lokal di perangkat Anda (Biasanya di port 3000).
3. **Git**
   - Untuk mengunduh (clone) repositori.

## Panduan Instalasi dan Menjalankan Proyek

### 1. Clone Repositori

Buka terminal Anda dan lakukan *clone* repositori frontend ini, lalu masuk ke foldernya:

```bash
git clone <URL_REPO_FRONTEND_INI>
cd PLN-WEB
```

### 2. Instalasi Dependensi (Package)

Jalankan perintah npm ini untuk menginstal semua *package* (termasuk Tailwind CSS dan library lain):

```bash
npm install
```

### 3. Konfigurasi Environment Variables

1. Buat sebuah file baru bernama `.env` di folder utama (root) repositori `PLN-WEB`.
2. Masukkan konfigurasi Anda. Contoh isi dari file `.env`:

```env
# Port lokal untuk menjalankan frontend server ini
PORT=4000
# URL menuju backend server yang sudah Anda jalankan (sesuaikan jika port backend Anda berbeda)
BACKEND_URL=http://localhost:3000
```

### 4. Menjalankan Server Frontend

Proyek ini telah dikonfigurasi menggunakan *npm-run-all* untuk menjalankan *compiler* Tailwind CSS beserta server Node.js secara bersamaan (parallel). 

Untuk menjalankannya di mode *development*, ketik perintah berikut di terminal:

```bash
npm run dev
```

Jika proses berjalan tanpa error, aplikasi web akan langsung bisa Anda akses melalui web browser favorit Anda di alamat:  
`http://localhost:4000` (Atau menyesuaikan port yang Anda konfigurasi di dalam file `.env`).

---

**Penting:** Jika beberapa fitur seperti login atau load data pada halaman gagal dijalankan (menampilkan *loading* terus atau pesan error API), pastikan sekali lagi bahwa terminal yang menjalankan **Backend Server** masih aktif dan *running* dengan koneksi database PostgreSQL yang benar.
