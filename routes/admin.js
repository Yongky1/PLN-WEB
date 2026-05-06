/**
 * routes/admin.js
 * Semua route untuk halaman admin PLN Pusdiklat.
 * Setiap route merender layout.ejs + konten halaman via variabel `body`.
 *
 * Pattern:   renderAdmin(res, page, title, subtitle, extraData)
 * Back end:  tambahkan data dari DB di bagian extraData setiap route.
 */

const express = require('express');
const router  = express.Router();
const ejs     = require('ejs');
const path    = require('path');

// Helper: render halaman admin dengan layout
function renderAdmin(res, page, title, subtitle, extraData = {}) {
    const viewsDir  = path.join(__dirname, '..', 'views', 'admin');
    const layoutPath = path.join(viewsDir, 'layout.ejs');
    const bodyPath   = path.join(viewsDir, `${page}.ejs`);

    // Render body dulu, lalu inject ke layout
    ejs.renderFile(bodyPath, { ...extraData }, (errBody, bodyHtml) => {
        if (errBody) {
            console.error(`[Admin] Error rendering ${page}.ejs:`, errBody);
            return res.status(500).send('Error rendering page');
        }
        ejs.renderFile(layoutPath, {
            page,
            title,
            subtitle,
            body: bodyHtml,
            scripts: '',    // opsional: inject script tambahan per halaman
            ...extraData,
        }, (errLayout, html) => {
            if (errLayout) {
                console.error('[Admin] Error rendering layout.ejs:', errLayout);
                return res.status(500).send('Error rendering layout');
            }
            res.send(html);
        });
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
    try {
        const fetchRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/modules?all=true`);
        const modules = await fetchRes.json();
        
        // Peta data agar sesuai dengan ejs format jika perlu, 
        // tapi ejs admin/modules.ejs masih menggunakan variabel statis m.name, m.cat dll
        // Kita akan pass data as-is dan sesuaikan EJS nya di langkah berikutnya
        renderAdmin(res, 'modules', 'Modul Konten', 'Kelola modul pembelajaran dan konten', { modules });
    } catch(err) {
        console.error(err);
        renderAdmin(res, 'modules', 'Modul Konten', 'Kelola modul pembelajaran dan konten', { modules: [] });
    }
});

// Manajemen Konstruksi
router.get('/konstruksi', (req, res) => {
    renderAdmin(res, 'konstruksi', 'Manajemen Konstruksi', 'Tambah dan kelola data konstruksi jaringan');
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
    // TODO (back end): const toolsList = await db.getTools();
});

// Pengaturan
router.get('/settings', (req, res) => {
    // req.user diset oleh authGuard di server.js
    renderAdmin(res, 'settings', 'Pengaturan', 'Konfigurasi sistem dan preferensi admin', { adminProfile: req.user });
});

module.exports = router;
