# Frontend Web — PLN Pusdiklat

Aplikasi web untuk visualisasi interaktif modul konstruksi dan peralatan jaringan listrik PLN Pusdiklat, dilengkapi dengan viewer 3D dan panel admin.

> [!CAUTION]
> **STATUS: UNDER DEVELOPMENT** — Project ini masih dalam tahap pengembangan aktif dan belum merupakan versi final.

---

## Tech Stack

- **Runtime**: Node.js + Express.js
- **Templating**: EJS
- **Styling**: Tailwind CSS v4
- **3D Viewer**: Google `<model-viewer>`
- **Bundler**: Vite + PostCSS

---

## Setup dari Awal

### 1. Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) v18 atau lebih baru
- Backend API sudah berjalan (lihat README di `Backend-Web-PLN`)

### 2. Clone & Install

```bash
git clone <url-repo>
cd PLN-WEB
npm install
```

### 3. Konfigurasi `.env`

Buat file `.env` di root folder `PLN-WEB`:

```bash
cp .env.example .env
```

Isi nilai di `.env`:

| Variabel | Default | Keterangan |
|---|---|---|
| `BACKEND_URL` | `http://localhost:4000` | URL backend API yang sedang berjalan |
| `PORT` | `3000` | Port server frontend |

Contoh isi `.env`:

```
BACKEND_URL=http://localhost:4000
PORT=3000
```

> [!NOTE]
> Jika backend dan frontend berjalan di mesin yang berbeda (misal akses via IP lokal), ubah `BACKEND_URL` ke alamat IP mesin backend, contoh: `http://192.168.1.10:4000`.

### 4. Jalankan Server

```bash
# Mode pengembangan (server + Tailwind CSS watch berjalan paralel)
npm run dev

# Mode produksi (build CSS terlebih dahulu, lalu jalankan server)
npm run build:css && npm start
```

Server berjalan di `http://localhost:3000` (atau sesuai nilai `PORT` di `.env`).

Saat server aktif, terminal akan menampilkan:
- URL lokal: `http://localhost:3000`
- URL jaringan lokal (untuk akses dari HP/device lain di jaringan yang sama)
- URL backend yang terhubung

---

## Halaman yang Tersedia

| URL | Keterangan | Butuh Login |
|---|---|---|
| `/` | Halaman utama / katalog modul | — |
| `/login` | Halaman login admin | — |
| `/admin` | Dashboard admin | Ya |
| `/admin/konstruksi` | Kelola modul konstruksi | Ya |
| `/admin/material` | Kelola material | Ya |
| `/admin/tools` | Kelola alat K3 | Ya |
| `/admin/users` | Kelola pengguna admin | Ya |

---

## Struktur Folder

```
PLN-WEB/
├── config/          # Konfigurasi server (helmet, dll)
├── middleware/      # Auth guard, error handler
├── public/          # Aset statis (CSS, JS client, gambar)
│   └── js/admin/    # Script halaman admin
├── routes/          # Routing halaman, proxy API, session
├── src/             # Source Tailwind CSS
├── utils/           # Cache helper
├── views/           # Template EJS
│   └── admin/       # Template halaman admin
└── server.js
```

---

## Catatan Pengembangan

- Semua request API dari halaman admin diproksikan melalui server frontend ke backend — token auth disimpan di HttpOnly cookie, tidak terekspos ke JavaScript client.
- File CSS (`public/css/output.css`) di-generate dari `src/` oleh Tailwind CLI. Jangan edit `output.css` secara manual.

---

Developed for **PLN Pusdiklat**.
