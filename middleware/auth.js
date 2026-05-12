const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

// Verifikasi token ke backend — bukan hanya cek keberadaan cookie
const authGuard = async (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const verifyRes = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!verifyRes.ok) {
      res.clearCookie('auth_token');
      return res.redirect('/login');
    }

    const data = await verifyRes.json();
    req.user = data.user;

    next();
  } catch (err) {
    console.error('authGuard: Gagal verifikasi token ke backend:', err.message);
    res.clearCookie('auth_token');
    return res.redirect('/login');
  }
};

module.exports = { authGuard };
