const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * Middleware that optionally reads the user's session token and attaches
 * req.sessionUser (with role, name, etc.) without redirecting or blocking
 * unauthenticated visitors.
 */
const optionalAuth = async (req, res, next) => {
  req.sessionUser = null;
  const token = req.cookies.auth_token;
  if (!token) return next();

  try {
    const verifyRes = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (verifyRes.ok) {
      const data = await verifyRes.json();
      req.sessionUser = data.user; // { id, email, name, unit, status, role }
      console.log('[optionalAuth] sessionUser loaded:', req.sessionUser.email, req.sessionUser.role);
    } else {
      console.log('[optionalAuth] verifyRes not ok:', verifyRes.status);
    }
  } catch (err) {
    console.error('[optionalAuth] error:', err.message);
  }
  next();
};

module.exports = { optionalAuth };
