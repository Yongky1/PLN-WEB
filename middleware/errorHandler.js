function errorHandler(err, req, res, next) {
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
}

module.exports = errorHandler;
