const express = require('express');
const path = require('path');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const os = require('os');
const adminRouter = require('./routes/admin');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://ajax.googleapis.com',
          'https://cdnjs.cloudflare.com',
        ],
        'script-src-attr': ["'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'blob:', '*'],
        'connect-src': ["'self'", 'blob:', '*'],
        'worker-src': ["'self'", 'blob:'],
        'media-src': ["'self'", 'blob:', '*'],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': null,
      },
    },
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts/three', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/scripts/three/jsm', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'PLN Pusdiklat — Ekosistem Pembelajaran Masa Depan',
    currentPage: 'home',
  });
});

app.get('/tools', async (req, res) => {
  try {
    const fetchRes = await fetch(`${BACKEND_URL}/api/tools`);
    if (!fetchRes.ok) throw new Error(`Backend error: ${fetchRes.status}`);
    const dbTools = await fetchRes.json();

    let categories = [];
    try {
      const catRes = await fetch(`${BACKEND_URL}/api/categories?type=tool`);
      if (catRes.ok) categories = await catRes.json();
    } catch (e) {
      console.error('Gagal fetch kategori tools:', e.message);
    }

    // Mapping kolom DB → field yang dibutuhkan tools.ejs
    const toolsData = dbTools.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category?.id || 'teknis',
      categoryLabel: t.category?.name || 'Teknis',
      bgGradient: t.bgGradient || 'linear-gradient(135deg, #1a2030 0%, #0d1520 100%)',
      description: t.description || '',
      standard: t.standard || '-',
      status: t.status || 'Wajib',
      file3d: t.file3d || null,
      image: t.image || null,
    }));

    res.render('tools', {
      title: 'Tools & Alat K3 — PLN Pusdiklat',
      toolsData,
      categories,
      currentPage: 'tools',
    });
  } catch (err) {
    console.error('[/tools] Gagal fetch data dari backend:', err.message);
    res.render('tools', {
      title: 'Tools & Alat K3 — PLN Pusdiklat',
      toolsData: [],
      categories: [],
      currentPage: 'tools',
    });
  }
});

app.get('/material', async (req, res) => {
  try {
    const fetchRes = await fetch(`${BACKEND_URL}/api/materials`);
    if (!fetchRes.ok) throw new Error(`Backend error: ${fetchRes.status}`);
    const dbMaterials = await fetchRes.json();

    let categories = [];
    try {
      const catRes = await fetch(`${BACKEND_URL}/api/categories?type=material`);
      if (catRes.ok) categories = await catRes.json();
    } catch (e) {
      console.error('Gagal fetch kategori materials:', e.message);
    }

    // Mapping kolom DB → field yang dibutuhkan material.ejs
    const materialData = dbMaterials.map((m) => ({
      id: m.id,
      name: m.name,
      code: m.code || '',
      category: m.category?.id || 'lainnya',
      categoryLabel: m.category?.name || 'Lainnya',
      bgGradient: m.bgGradient || 'linear-gradient(135deg, #1a2030 0%, #0d1520 100%)',
      description: m.description || '',
      image: m.image || null,
      // file3d: ambil asset pertama jika ada (material_assets)
      file3d: m.assets && m.assets.length > 0 ? m.assets[0].file : null,
    }));

    res.render('material', {
      title: 'Material Jaringan — PLN Pusdiklat',
      materialData,
      categories,
      currentPage: 'material',
    });
  } catch (err) {
    console.error('[/material] Gagal fetch data dari backend:', err.message);
    res.render('material', {
      title: 'Material Jaringan — PLN Pusdiklat',
      materialData: [],
      categories: [],
      currentPage: 'material',
    });
  }
});

app.get('/ModulKonstruksi', async (req, res) => {
  try {
    const sort = req.query.sort || 'newest';
    const fetchRes = await fetch(`${BACKEND_URL}/api/modules?sort=${sort}`);
    if (!fetchRes.ok) throw new Error(`Backend error: ${fetchRes.status}`);
    let dbModules = await fetchRes.json();

    // Pastikan yang diterima adalah array (bukan objek error)
    if (!Array.isArray(dbModules)) {
      console.error('[/ModulKonstruksi] Backend tidak mengembalikan array:', dbModules);
      dbModules = [];
    }

    const activeModules = dbModules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      image: m.image,
      materialCount: m.materials && m.materials[0] ? (m.materials[0].count ?? 0) : 0,
      equipmentCount: m.tools && m.tools[0] ? (m.tools[0].count ?? 0) : 0,
      assets: m.assets || [],
    }));

    res.render('ModulKonstruksi', {
      title: 'Modul Pembelajaran — PLN Pusdiklat',
      activeModules,
      inactiveModules: [],
      currentSort: sort,
      currentPage: 'konstruksi',
    });
  } catch (err) {
    console.error(err);
    res.render('ModulKonstruksi', {
      title: 'Modul Pembelajaran — PLN Pusdiklat',
      activeModules: [],
      inactiveModules: [],
      currentSort: 'newest',
      currentPage: 'konstruksi',
    });
  }
});

app.get('/ModulKonstruksi/:id', async (req, res) => {
  const moduleId = req.params.id;
  try {
    const fetchRes = await fetch(`${BACKEND_URL}/api/modules/${moduleId}`);
    if (!fetchRes.ok) {
      return res.redirect('/ModulKonstruksi');
    }
    const moduleItem = await fetchRes.json();

    const mappedModule = {
      id: moduleItem.id,
      title: moduleItem.title,
      description: moduleItem.description,
      materialCount: moduleItem.materials ? moduleItem.materials.length : 0,
      equipmentCount: moduleItem.tools ? moduleItem.tools.length : 0,
      assets: moduleItem.assets || [],
      materials: moduleItem.materials || [],
      tools: moduleItem.tools || [],
    };

    res.render('ModulViewer', {
      title: `${mappedModule.title} - PLN Pusdiklat 3D`,
      module: mappedModule,
    });
  } catch (err) {
    console.error(err);
    res.redirect('/ModulKonstruksi');
  }
});

// Middleware Proteksi Rute Admin
// Verifikasi token ke backend — bukan hanya cek keberadaan cookie
const authGuard = async (req, res, next) => {
  const token = req.cookies.auth_token;

  // 1. Cookie tidak ada → langsung lempar ke login
  if (!token) {
    return res.redirect('/login');
  }

  try {
    // 2. Verifikasi token ke backend (Supabase)
    const verifyRes = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!verifyRes.ok) {
      // Token expired / tidak valid → hapus cookie & redirect login
      res.clearCookie('auth_token');
      return res.redirect('/login');
    }

    const data = await verifyRes.json();
    req.user = data.user; // Simpan data user (id, name, email, unit) di req.user

    next();
  } catch (err) {
    // Backend tidak bisa dihubungi → amankan dengan redirect login
    console.error('authGuard: Gagal verifikasi token ke backend:', err.message);
    res.clearCookie('auth_token');
    return res.redirect('/login');
  }
};

// Admin login route
app.get('/login', (req, res) => {
  // Jika sudah ada cookie token, jangan biarkan login lagi, lempar ke admin
  if (req.cookies.auth_token) {
    return res.redirect('/admin');
  }
  res.render('login', { title: 'Login Admin - PLN Pusdiklat' });
});

// Proxy Login Route
app.post('/api/login', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Login proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// Proxy Change Password Route
app.put('/api/change-password', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token)
    return res.status(401).json({ error: 'Sesi anda telah berakhir. Silakan login ulang.' });

  try {
    const response = await fetch(`${BACKEND_URL}/api/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Change password proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// Proxy Update Profile Route
app.put('/api/profile', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token)
    return res.status(401).json({ error: 'Sesi anda telah berakhir. Silakan login ulang.' });

  try {
    const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Update profile proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// Helper Route: Set Session (Cookie)
app.post('/set-session', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token missing' });

  // Set cookie (HttpOnly: false agar bisa dibaca client-side jika perlu, atau true untuk keamanan extra)
  // Di sini kita pakai default (Session Cookie - hilang saat browser tutup)
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ success: true });
});

// Helper Route: Clear Session (Cookie)
app.get('/clear-session', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

app.get('/admin-logout', async (req, res) => {
  const token = req.cookies.auth_token;
  if (token) {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Gagal logout di backend:', err.message);
    }
  }
  res.clearCookie('auth_token');
  res.redirect('/login');
});

// Proxy PATCH: mesh-name mapping
app.patch('/api/module-materials/:id/mesh-name', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Sesi anda telah berakhir. Silakan login ulang.' });
  try {
    const response = await fetch(`${BACKEND_URL}/api/module-materials/${req.params.id}/mesh-name`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mesh-name material proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

app.patch('/api/module-tools/:id/mesh-name', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Sesi anda telah berakhir. Silakan login ulang.' });
  try {
    const response = await fetch(`${BACKEND_URL}/api/module-tools/${req.params.id}/mesh-name`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mesh-name tool proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// Admin routes - Menggunakan authGuard
app.use('/admin', authGuard, adminRouter);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${status}: ${err.message}`);
  if (isDev && err.stack) console.error(err.stack);

  try {
    res.status(status).render('error', {
      title: `Error ${status} — PLN Pusdiklat`,
      status,
      message: isDev ? err.message : 'Terjadi kesalahan yang tidak terduga.',
    });
  } catch (_renderErr) {
    res.status(status).send(`<h1>Error ${status}</h1><p>${err.message}</p>`);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  // Cari IP jaringan lokal
  const nets = os.networkInterfaces();
  let localIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  console.log(`===============================================`);
  console.log(`🚀 PLN Pusdiklat Concept running on http://localhost:${PORT}`);
  console.log(`🌍 Untuk akses dari device lain : http://${localIP}:${PORT}`);
  console.log(`📡 Backend API : ${BACKEND_URL}`);
  console.log(`===============================================`);
});
