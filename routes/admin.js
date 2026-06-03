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

// Helper: render halaman admin dengan layout
function renderAdmin(res, page, title, subtitle, extraData = {}, currentUser = null) {
  const viewsDir = path.join(__dirname, '..', 'views', 'admin');
  const layoutPath = path.join(viewsDir, 'layout.ejs');
  const bodyPath = path.join(viewsDir, `${page}.ejs`);

  // Render body dulu, lalu inject ke layout
  ejs.renderFile(bodyPath, { ...extraData }, (errBody, bodyHtml) => {
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
   ROUTES
   ===================================================== */

// Redirect /admin → /admin/konstruksi
router.get('/', (req, res) => res.redirect('/admin/konstruksi'));

// Manajemen User
router.get('/users', (req, res) => {
  renderAdmin(res, 'users', 'Manajemen User', 'Kelola akun dan akses pengguna', {}, req.user);
});

// Modul Konten
router.get('/modules', async (req, res) => {
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
    renderAdmin(res, 'modules', 'Modul Konten', 'Kelola modul, material, dan peralatan', {
      modules,
      materials,
      tools,
    }, req.user);
  } catch (err) {
    console.error(err);
    renderAdmin(res, 'modules', 'Modul Konten', 'Kelola modul, material, dan peralatan', {
      modules: [],
      materials: [],
      tools: [],
    }, req.user);
  }
});

// Manajemen Konstruksi
router.get('/konstruksi', (req, res) => {
  renderAdmin(res, 'konstruksi', 'Manajemen Konstruksi', 'Tambah dan kelola data konstruksi jaringan', {}, req.user);
});

// Manajemen Material
router.get('/material', (req, res) => {
  renderAdmin(res, 'material', 'Manajemen Material', 'Tambah dan kelola katalog material jaringan', {}, req.user);
});

// Manajemen Peralatan (Tools)
router.get('/tools', (req, res) => {
  renderAdmin(res, 'tools', 'Manajemen Peralatan', 'Tambah dan kelola katalog alat lapangan', {}, req.user);
});

// Manajemen Kategori
router.get('/categories', (req, res) => {
  renderAdmin(res, 'categories', 'Manajemen Kategori', 'Kelola kategori material dan peralatan', {}, req.user);
});

// Mesh Mapping — per modul
router.get('/konstruksi/:id/mapping', async (req, res) => {
  const base = process.env.BACKEND_URL || 'http://localhost:4000';
  const { id } = req.params;
  try {
    const moduleRes = await fetch(`${base}/api/modules/${id}`);
    if (!moduleRes.ok) return res.redirect('/admin/modules');
    const moduleData = await moduleRes.json();

    // Normalisasi URL aset: ganti absolute URL backend → relative path
    // agar Three.js tidak request langsung ke port 4000 (CORS/403 error)
    if (Array.isArray(moduleData.assets)) {
      moduleData.assets = moduleData.assets.map(asset => ({
        ...asset,
        file: asset.file ? asset.file.replace(/^https?:\/\/[^/]+/, '') : asset.file,
      }));
    }

    renderAdmin(res, 'mapping', `Mesh Mapping`, `Hubungkan mesh 3D ke material & peralatan — ${moduleData.title}`, { moduleData }, req.user);
  } catch (err) {
    console.error('[Admin] Error loading mapping page:', err);
    res.redirect('/admin/modules');
  }
});

// Pengaturan
router.get('/settings', (req, res) => {
  renderAdmin(res, 'settings', 'Pengaturan', 'Konfigurasi sistem dan preferensi admin', {
    adminProfile: req.user,
  }, req.user);
});

module.exports = router;
