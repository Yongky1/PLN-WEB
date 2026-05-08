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
function renderAdmin(res, page, title, subtitle, extraData = {}) {
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
        scripts: '', // opsional: inject script tambahan per halaman
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

// Redirect /admin → /admin/overview
router.get('/', (req, res) => res.redirect('/admin/overview'));

// Overview
router.get('/overview', (req, res) => {
  renderAdmin(res, 'overview', 'Overview', 'Selamat datang di panel administrator');
  // TODO (back end): tambahkan data statistik dari DB:
  // const stats = await db.getStats();
  // renderAdmin(res, 'overview', 'Overview', '...', { stats });
});

// Laporan
router.get('/laporan', (req, res) => {
  renderAdmin(res, 'laporan', 'Laporan', 'Statistik dan laporan penggunaan platform');
  // TODO (back end): const reports = await db.getReports(req.query.period);
});

// Manajemen User
router.get('/users', (req, res) => {
  renderAdmin(res, 'users', 'Manajemen User', 'Kelola akun dan akses pengguna');
  // TODO (back end): const users = await db.getUsers();
  // renderAdmin(res, 'users', ..., { users });
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
    });
  } catch (err) {
    console.error(err);
    renderAdmin(res, 'modules', 'Modul Konten', 'Kelola modul, material, dan peralatan', {
      modules: [],
      materials: [],
      tools: [],
    });
  }
});

// Manajemen Konstruksi
router.get('/konstruksi', (req, res) => {
  renderAdmin(
    res,
    'konstruksi',
    'Manajemen Konstruksi',
    'Tambah dan kelola data konstruksi jaringan'
  );
  // TODO (back end): const konstruksiList = await db.getKonstruksi();
});

// Manajemen Material
router.get('/material', (req, res) => {
  renderAdmin(res, 'material', 'Manajemen Material', 'Tambah dan kelola katalog material jaringan');
  // TODO (back end): const materialList = await db.getMaterial();
});

// Manajemen Peralatan (Tools)
router.get('/tools', (req, res) => {
  renderAdmin(res, 'tools', 'Manajemen Peralatan', 'Tambah dan kelola katalog alat lapangan');
});

// Manajemen Kategori
router.get('/categories', (req, res) => {
  renderAdmin(res, 'categories', 'Manajemen Kategori', 'Kelola kategori material dan peralatan');
});

// Pengaturan
router.get('/settings', (req, res) => {
  // req.user diset oleh authGuard di server.js
  renderAdmin(res, 'settings', 'Pengaturan', 'Konfigurasi sistem dan preferensi admin', {
    adminProfile: req.user,
  });
});

module.exports = router;
