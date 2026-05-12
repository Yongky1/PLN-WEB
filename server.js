const express = require('express');
const path = require('path');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const os = require('os');
const adminRouter = require('./routes/admin');
const pagesRouter = require('./routes/pages');
const proxyRouter = require('./routes/proxy');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
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
app.use('/', proxyRouter);

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
