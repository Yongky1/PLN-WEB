const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:4000';

const optionalAuth = async (req, res, next) => {
  req.sessionUser = null;
  const token = req.cookies.auth_token;
  console.log(`[optionalAuth] Route: ${req.originalUrl} | Token exists: ${!!token}`);
  if (!token) return next();

  try {
    const verifyRes = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (verifyRes.ok) {
      const data = await verifyRes.json();
      req.sessionUser = data.user;
      console.log(`[optionalAuth] Route: ${req.originalUrl} | sessionUser loaded: ${req.sessionUser.email}, role: ${req.sessionUser.role}`);
    } else {
      console.log(`[optionalAuth] Route: ${req.originalUrl} | verifyRes not ok: ${verifyRes.status}`);
    }
  } catch (err) {
    console.error(`[optionalAuth] Route: ${req.originalUrl} | error:`, err.message);
  }
  next();
};

module.exports = { optionalAuth };
