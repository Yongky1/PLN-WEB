const express = require('express');
const { invalidateCache } = require('../utils/cache');

const router = express.Router();
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const proxyAuthHeader = (req) => ({ Authorization: `Bearer ${req.cookies.auth_token}` });

const requireCookie = (req, res) => {
  if (!req.cookies.auth_token) {
    res.status(401).json({ error: 'Sesi anda telah berakhir. Silakan login ulang.' });
    return false;
  }
  return true;
};

// Login
router.post('/api/login', async (req, res) => {
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

// Change Password
router.put('/api/change-password', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...proxyAuthHeader(req) },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Change password proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// Update Profile
router.put('/api/profile', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...proxyAuthHeader(req) },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Update profile proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// PATCH mesh-names (plural): simpan array mesh ke satu material
router.patch('/api/module-materials/:id/mesh-names', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/module-materials/${req.params.id}/mesh-names`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...proxyAuthHeader(req) },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    if (response.ok) {
      // Invalidate cache agar viewer publik langsung melihat data terbaru
      invalidateCache('/api/modules');
      invalidateCache('/api/module-materials');
    }
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mesh-names material proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// PATCH mesh-name: tool
router.patch('/api/module-tools/:id/mesh-name', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/module-tools/${req.params.id}/mesh-name`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...proxyAuthHeader(req) },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    if (response.ok) {
      // Invalidate cache agar viewer publik langsung melihat data terbaru
      invalidateCache('/api/modules');
      invalidateCache('/api/module-tools');
    }
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mesh-name tool proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// GET mapped-meshes (public)
router.get('/api/modules/:id/mapped-meshes', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/modules/${req.params.id}/mapped-meshes`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mapped-meshes proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// GET mesh-config (public)
router.get('/api/modules/:id/mesh-config', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/modules/${req.params.id}/mesh-config`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mesh-config get proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// POST mesh-config (admin only)
router.post('/api/modules/:id/mesh-config', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/modules/${req.params.id}/mesh-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...proxyAuthHeader(req) },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Mesh-config post proxy error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

// ── Users (admin only) ────────────────────────────────────────────────────────
router.get('/api/users', async (req, res) => {
  if (!requireCookie(req, res)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`, { headers: proxyAuthHeader(req) });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

router.post('/api/users', async (req, res) => {
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

router.put('/api/users/:id', async (req, res) => {
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

router.delete('/api/users/:id', async (req, res) => {
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

// ── Categories ────────────────────────────────────────────────────────────────
router.get('/api/categories', async (req, res) => {
  try {
    const qs = req.query.type ? `?type=${req.query.type}` : '';
    const response = await fetch(`${BACKEND_URL}/api/categories${qs}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal terhubung ke backend server' });
  }
});

router.post('/api/categories', async (req, res) => {
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

router.put('/api/categories/:id', async (req, res) => {
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

router.delete('/api/categories/:id', async (req, res) => {
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

// ── Generic catch-all proxy — MUST be last ────────────────────────────────────
router.all('/api/*', async (req, res) => {
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

    if (response.ok && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const path = req.path;
      if (path.startsWith('/api/modules') || path.startsWith('/api/module-materials') || path.startsWith('/api/module-tools')) {
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

module.exports = router;
