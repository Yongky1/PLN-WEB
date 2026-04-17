# 📦 [HANDOVER] Frontend Web - PLN Pusdiklat Internship

Frontend aplikasi web untuk ekosistem pembelajaran interaktif PLN Pusdiklat. Aplikasi ini menyajikan visualisasi 3D peralatan dan konstruksi jaringan listrik secara interaktif.

---

> [!CAUTION]
> **PENGUMUMAN**: Project ini masih dalam tahap pengembangan aktif dan **belum merupakan versi final**. Beberapa fitur mungkin belum stabil atau masih memerlukan peningkatan.

---

## 🌟 Fitur Unggulan

- **Interactive 3D Viewer**: Visualisasi dalam format 3D menggunakan Google <model-viewer>.
- **Admin Panel**: Dashboard khusus untuk admin mengelola konten modul, material, dan alat K3.

---

## 🏗️ Arsitektur Teknologi

- **Core**: Node.js & Express.js
- **Templating**: EJS (Embedded JavaScript)
- **Styling**: Tailwind CSS v4.0
- **3D Engine**: Google <model-viewer> (Web Component)
- **Bundler/Optimization**: Vite & PostCSS

---

1. **Install Dependensi**

   ```bash
   npm install
   ```

2. **Konfigurasi Environment**
   - Salin file `.env.example` menjadi `.env`.
   - Pastikan variabel `BACKEND_URL` mengarah ke URL API Backend yang aktif.
   ```bash
   cp .env.example .env
   ```

---

## 🛠️ Cara Menjalankan

Lakukan langkah ini di dalam folder `PLN-WEB`:

1.  **Instalasi Dependensi (Wajib saat pertama kali):**

    ```bash
    npm install
    ```

2.  **Menjalankan Proyek (Mode Pengembangan):**
    Menjalankan server dan Tailwind CSS secara paralel:

    ```bash
    npm run dev
    ```

3.  **Menjalankan Proyek (Mode Produksi):**
    ```bash
    npm start
    ```

---

## 📂 Organisasi Kode

- `public/`: Aset statis (Gambar, CSS, Client JS, Model 3D).
- `views/`: Template EJS untuk struktur halaman (Apple-style design).
- `routes/`: Logika routing frontend dan proxy data ke backend.
- `src/`: Aset sumber untuk Tailwind CSS.
- `tailwind.config.js`: Konfigurasi tema dan plugin styling.

---

Developed for **PLN Pusdiklat** Concept.
