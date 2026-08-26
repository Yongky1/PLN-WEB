/**
 * routes/admin.js
 * Semua route untuk halaman admin PLN Pusdiklat.
 * Setiap route merender layout.ejs + konten halaman via variabel `body`.
 *
 * Pattern:   renderAdmin(res, page, title, subtitle, extraData)
 * Back end:  tambahkan data dari DB di bagian extraData setiap route.
 */

const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const path = require('path');

const BACKEND_URL = process.env.API_URL || 'http://localhost:4000';
const API_URL = `${BACKEND_URL}/api`;

// Helper: render halaman admin dengan layout
function renderAdmin(res, page, title, subtitle, extraData = {}, currentUser = null) {
  const viewsDir = path.join(__dirname, '..', 'views', 'admin');
  const layoutPath = path.join(viewsDir, 'layout.ejs');
  const bodyPath = path.join(viewsDir, `${page}.ejs`);

  // Render body dulu, lalu inject ke layout
  ejs.renderFile(bodyPath, { ...extraData, currentUser }, (errBody, bodyHtml) => {
    if (errBody) {
      console.error(`[Admin] Error rendering ${page}.ejs:`, errBody);
      return res.status(500).send('Error rendering page');
    }
    ejs.renderFile(
      layoutPath,
      {
        page,
        title,
        subtitle,
        body: bodyHtml,
        scripts: '',
        currentUser,
        ...extraData,
      },
      (errLayout, html) => {
        if (errLayout) {
          console.error('[Admin] Error rendering layout.ejs:', errLayout);
          return res.status(500).send('Error rendering layout');
        }
        res.send(html);
      }
    );
  });
}

/* =====================================================
   MIDDLEWARE KHUSUS ADMIN (UPDL)
   ===================================================== */
const updlOnly = (req, res, next) => {
  if (req.user) {
    return next();
  }
  // Jika belum login, ke katalog instruktur (atau halaman login)
  return res.redirect('/admin/katalog-instruktur');
};

/* =====================================================
   ROUTES
   ===================================================== */

// Redirect /admin → /admin/konstruksi (Atau katalog instruktur jika bukan admin)
router.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/admin/konstruksi');
  }
  return res.redirect('/admin/katalog-instruktur');
});

// Manajemen User
router.get('/users', updlOnly, (req, res) => {
  renderAdmin(res, 'users', 'Manajemen User', 'Kelola akun dan akses pengguna', {}, req.user);
});

// Modul Konten
router.get('/modules', updlOnly, async (req, res) => {
  const base = process.env.BACKEND_URL || 'http://localhost:4000';
  try {
    const [modulesRes, materialsRes, toolsRes] = await Promise.all([
      fetch(`${base}/api/modules?all=true`),
      fetch(`${base}/api/materials`),
      fetch(`${base}/api/tools`),
    ]);
    const [modules, materials, tools] = await Promise.all([
      modulesRes.json(),
      materialsRes.json(),
      toolsRes.json(),
    ]);
    renderAdmin(
      res,
      'modules',
      'Modul Konten',
      'Kelola modul, material, dan peralatan',
      {
        modules,
        materials,
        tools,
      },
      req.user
    );
  } catch (err) {
    console.error(err);
    renderAdmin(
      res,
      'modules',
      'Modul Konten',
      'Kelola modul, material, dan peralatan',
      {
        modules: [],
        materials: [],
        tools: [],
      },
      req.user
    );
  }
});

// Manajemen Konstruksi
router.get('/konstruksi', updlOnly, (req, res) => {
  renderAdmin(
    res,
    'konstruksi',
    'Manajemen Konstruksi',
    'Tambah dan kelola data konstruksi jaringan',
    {},
    req.user
  );
});

// Kategori Konstruksi 3 Level
router.get('/construction-categories', updlOnly, (req, res) => {
  renderAdmin(
    res,
    'construction-categories',
    'Kategori Konstruksi',
    'Kelola hierarki 3 level kategori konstruksi',
    {},
    req.user
  );
});

// Manajemen Material
router.get('/material', updlOnly, (req, res) => {
  renderAdmin(
    res,
    'material',
    'Manajemen Material',
    'Tambah dan kelola katalog material jaringan',
    {},
    req.user
  );
});

// Manajemen Peralatan (Tools)
router.get('/tools', updlOnly, (req, res) => {
  renderAdmin(
    res,
    'tools',
    'Manajemen Peralatan',
    'Tambah dan kelola katalog alat lapangan',
    {},
    req.user
  );
});

// Manajemen ListrikPedia
router.get('/listrikpedia', updlOnly, (req, res) => {
  renderAdmin(
    res,
    'listrikpedia',
    'ListrikPedia',
    'Kelola singkatan dan istilah kelistrikan',
    {},
    req.user
  );
});

// Manajemen Kategori
router.get('/categories', updlOnly, (req, res) => {
  renderAdmin(
    res,
    'categories',
    'Manajemen Kategori',
    'Kelola kategori material dan peralatan',
    {},
    req.user
  );
});

// Mesh Mapping — per modul
router.get('/konstruksi/:id/mapping', updlOnly, async (req, res) => {
  const base = process.env.BACKEND_URL || 'http://localhost:4000';
  const { id } = req.params;
  try {
    const moduleRes = await fetch(`${base}/api/modules/${id}`);
    if (!moduleRes.ok) return res.redirect('/admin/modules');
    const moduleData = await moduleRes.json();

    // Normalisasi URL aset: ganti absolute URL backend → relative path
    // agar Three.js tidak request langsung ke port 4000 (CORS/403 error)
    if (Array.isArray(moduleData.assets)) {
      moduleData.assets = moduleData.assets.map((asset) => ({
        ...asset,
        file: asset.file ? asset.file.replace(/^https?:\/\/[^/]+/, '') : asset.file,
      }));
    }

    renderAdmin(
      res,
      'mapping',
      `Mesh Mapping`,
      `Hubungkan mesh 3D ke material & peralatan — ${moduleData.title}`,
      { moduleData },
      req.user
    );
  } catch (err) {
    console.error('[Admin] Error loading mapping page:', err);
    res.redirect('/admin/modules');
  }
});

// Pengaturan
router.get('/settings', updlOnly, (req, res) => {
  renderAdmin(
    res,
    'settings',
    'Pengaturan',
    'Konfigurasi sistem dan preferensi admin',
    {
      adminProfile: req.user,
    },
    req.user
  );
});

// Data Kuis
router.get('/quiz', updlOnly, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/quiz`, {
      headers: { Authorization: `Bearer ${req.cookies.auth_token}` }
    });
    if (!response.ok) throw new Error('Gagal memuat data kuis');
    const data = await response.json();

    renderAdmin(
      res,
      'quiz',
      'Data Kuis',
      'Manajemen Kuis dan Hasil Peserta',
      { quizzes: data.quizzes, allSubmissions: data.allSubmissions },
      req.user
    );
  } catch (err) {
    console.error('[Admin] Error loading quiz page:', err);
    res.redirect('/admin');
  }
});

// Katalog Instruktur
router.get('/katalog-instruktur', async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/pembelajaran/katalog-instruktur`);
    if (!response.ok) throw new Error('Gagal memuat data katalog');
    const data = await response.json();
    renderAdmin(res, 'katalog-instruktur', 'Katalog Instruktur', 'Kelola data instruktur dan status', { katalogData: data }, req.user);
  } catch (err) {
    console.error('[Admin] Error loading katalog page:', err);
    renderAdmin(res, 'katalog-instruktur', 'Katalog Instruktur', 'Kelola data instruktur dan status', { katalogData: [] }, req.user);
  }
});

// Jadwal Instruktur
router.get('/jadwal-instruktur', async (req, res) => {
  try {
    const [jadwalRes, katalogRes] = await Promise.all([
      fetch(`${API_URL}/pembelajaran/jadwal-instruktur`),
      fetch(`${API_URL}/pembelajaran/katalog-instruktur`),
    ]);
    if (!jadwalRes.ok || !katalogRes.ok) throw new Error('Gagal memuat data jadwal');
    const jadwalData = await jadwalRes.json();
    const katalogData = await katalogRes.json();
    renderAdmin(res, 'jadwal-instruktur', 'Jadwal Instruktur', 'Kelola jadwal mengajar instruktur', { jadwalData, katalogData }, req.user);
  } catch (err) {
    console.error('[Admin] Error loading jadwal page:', err);
    renderAdmin(res, 'jadwal-instruktur', 'Jadwal Instruktur', 'Kelola jadwal mengajar instruktur', { jadwalData: [], katalogData: [] }, req.user);
  }
});

// Background Dinamis
router.get('/background', async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/backgrounds`);
    let backgrounds = [];
    if (response.ok) {
      backgrounds = await response.json();
    }
    renderAdmin(res, 'background', 'Background Dinamis', 'Kelola background slideshow untuk halaman publik', { backgrounds }, req.user);
  } catch (err) {
    console.error('[Admin] Error loading background page:', err);
    renderAdmin(res, 'background', 'Background Dinamis', 'Kelola background slideshow untuk halaman publik', { backgrounds: [] }, req.user);
  }
});

// Bank Soal Whats In The Box
router.get('/box-presets', updlOnly, async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/box/presets`);
    let presets = [];
    if (response.ok) {
      presets = await response.json();
    }
    renderAdmin(res, 'box-presets', 'Bank Soal Whats In The Box', 'Kelola daftar preset game Whats In The Box', { presets }, req.user);
  } catch (err) {
    console.error('[Admin] Error loading box-presets page:', err);
    renderAdmin(res, 'box-presets', 'Bank Soal Whats In The Box', 'Kelola daftar preset game Whats In The Box', { presets: [] }, req.user);
  }
});

module.exports = router;
