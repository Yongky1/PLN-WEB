module.exports = {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "'wasm-unsafe-eval'",
        'https://ajax.googleapis.com',
        'https://cdnjs.cloudflare.com',
      ],
      // Eksplisit izinkan 'self' untuk ES Module (type="module") dan importmap
      'script-src-elem': [
        "'self'",
        "'unsafe-inline'",
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
};
