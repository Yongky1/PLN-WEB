const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const os = require('os');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const adminRouter = require('./routes/admin');
const pagesRouter = require('./routes/pages');
const proxyRouter = require('./routes/proxy');
const sessionRouter = require('./routes/session');
const { authGuard } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const helmetOptions = require('./config/helmetOptions');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.locals.formatDescription = (desc) => {
  if (!desc || typeof desc !== 'string') return 'Deskripsi belum tersedia.';
  
  // 1. Sanitize HTML
  let formatted = desc
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // 2. Parse bold (**text**)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 3. Parse source ([Source]) at the end
  const sourceMatch = formatted.match(/\[(.*?)\]\s*$/);
  let sourceHtml = '';
  if (sourceMatch) {
    formatted = formatted.replace(/\[(.*?)\]\s*$/, '').trim();
    sourceHtml = ` <span class="text-[12px] italic text-[var(--color-text-secondary)] opacity-80">${sourceMatch[1]}</span>`;
  }
  
  return formatted + sourceHtml;
};

app.use(cookieParser());
app.use(helmet(helmetOptions));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts/three', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use(
  '/scripts/three/jsm',
  express.static(path.join(__dirname, 'node_modules/three/examples/jsm'))
);

// Proxy /uploads/* → backend (untuk file GLB/GLTF/gambar)
// Ini diperlukan agar Three.js bisa load file 3D lewat port 3000, bukan langsung ke port 4000
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
app.use('/uploads', async (req, res) => {
  try {
    const targetUrl = `${BACKEND_URL}${req.originalUrl}`;
    const response = await fetch(targetUrl);
    if (!response.ok) return res.status(response.status).end();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    const contentLength = response.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    // Stream body langsung ke client
    const { Readable } = require('stream');
    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error('[Upload Proxy] Error:', err.message);
    res.status(502).end();
  }
});

const { optionalAuth } = require('./middleware/optionalAuth');

// Attach session user info to every request (non-blocking)
app.use(optionalAuth);
app.use((req, res, next) => {
  res.locals.sessionUser = req.sessionUser || null;
  res.locals.userRole = req.sessionUser ? req.sessionUser.role : null;
  next();
});

app.use('/', pagesRouter);
app.use('/', proxyRouter);
app.use('/', sessionRouter);
app.use('/quiz', require('./routes/quiz'));
app.use('/poll', require('./routes/poll'));
app.use('/box', require('./routes/box'));
app.use('/pembelajaran', require('./routes/pembelajaran'));

app.use('/admin', authGuard, adminRouter);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
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
  console.log(`📡 Backend API : ${process.env.BACKEND_URL || 'http://localhost:4000'}`);
  console.log(`===============================================`);
});
