const express = require('express');
const path = require('path');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const os = require('os');
const adminRouter = require('./routes/admin');
const pagesRouter = require('./routes/pages');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { invalidateCache } = require('./utils/cache');
const { authGuard } = require('./middleware/auth');
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

app.use('/', pagesRouter);

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

// Proxy GET: mapped mesh names (public — dipakai viewer publik)
app.get('/api/modules/:id/mapped-meshes', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/modules/${req.params.id}/mapped-meshes`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mapped-meshes proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// Proxy GET: mesh config (public — dipakai viewer publik & admin)
app.get('/api/modules/:id/mesh-config', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/modules/${req.params.id}/mesh-config`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mesh-config get proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// Proxy POST: mesh config upsert (auth required — hanya admin)
app.post('/api/modules/:id/mesh-config', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Sesi anda telah berakhir. Silakan login ulang.' });
  try {
    const response = await fetch(`${BACKEND_URL}/api/modules/${req.params.id}/mesh-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mesh-config post proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// ── Proxy Routes: Users (admin only) ─────────────────────────────────────────
const proxyAuthHeader = (req) => ({ Authorization: `Bearer ${req.cookies.auth_token}` });

const requireCookie = (req, res) => {
  if (!req.cookies.auth_token) {
    res.status(401).json({ error: 'Sesi anda telah berakhir. Silakan login ulang.' });
    return false;
  }
  return true;
};

app.get('/api/users', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      headers: proxyAuthHeader(req),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

app.post('/api/users', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...proxyAuthHeader(req) },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...proxyAuthHeader(req) },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/${req.params.id}`, {
      method: 'DELETE',
      headers: proxyAuthHeader(req),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// ── Proxy Routes: Categories ───────────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const qs = req.query.type ? `?type=${req.query.type}` : '';
    const response = await fetch(`${BACKEND_URL}/api/categories${qs}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

app.post('/api/categories', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...proxyAuthHeader(req) },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/categories/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...proxyAuthHeader(req) },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/categories/${req.params.id}`, {
      method: 'DELETE',
      headers: proxyAuthHeader(req),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// ── Generic API Proxy (catch-all untuk endpoint yang belum ditangani route spesifik) ──
// Semua /api/* yang tidak tertangkap route di atas akan di-proxy ke backend.
// Token diambil dari HttpOnly cookie sehingga JS client tidak perlu menyimpan token.
app.all('/api/*', async (req, res) => {
  const token = req.cookies.auth_token;
  const qs = Object.keys(req.query).length ? '?' + new URLSearchParams(req.query).toString() : '';
  const targetUrl = `${BACKEND_URL}${req.path}${qs}`;

  const forwardHeaders = {};
  if (token) forwardHeaders['Authorization'] = `Bearer ${token}`;

  const contentType = req.headers['content-type'] || '';
  const isMultipart = contentType.includes('multipart/form-data');
  const hasJsonBody = contentType.includes('application/json') && ['POST', 'PUT', 'PATCH'].includes(req.method);

  let fetchOptions;
  if (isMultipart) {
    // Pipe stream langsung ke backend — body belum dibaca oleh express.json()
    forwardHeaders['Content-Type'] = contentType;
    if (req.headers['content-length']) forwardHeaders['Content-Length'] = req.headers['content-length'];
    fetchOptions = { method: req.method, headers: forwardHeaders, body: req, duplex: 'half' };
  } else if (hasJsonBody) {
    forwardHeaders['Content-Type'] = 'application/json';
    fetchOptions = { method: req.method, headers: forwardHeaders, body: JSON.stringify(req.body) };
  } else {
    fetchOptions = { method: req.method, headers: forwardHeaders };
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const responseContentType = response.headers.get('content-type') || '';

    // Invalidate cache saat admin ubah data katalog
    if (response.ok && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const path = req.path;
      if (path.startsWith('/api/modules')) {
        invalidateCache('/api/modules');
      } else if (path.startsWith('/api/materials') || path.startsWith('/api/material-assets')) {
        invalidateCache('/api/materials');
      } else if (path.startsWith('/api/tools')) {
        invalidateCache('/api/tools');
      } else if (path.startsWith('/api/categories')) {
        invalidateCache('/api/categories');
      }
    }

    if (responseContentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (err) {
    console.error(`[API Proxy] ${req.method} ${req.path} error:`, err.message);
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
