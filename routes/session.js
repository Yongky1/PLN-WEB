const express = require('express');
const router = express.Router();

router.post('/set-session', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token missing' });

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ success: true });
});

router.get('/clear-session', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

router.get('/admin-logout', async (req, res) => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
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

module.exports = router;
