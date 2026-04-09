const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.get('/api/programs', (req, res) => {
  res.json([
    { id: 1, name: 'Teknik Ketenagalistrikan', count: 42, category: 'Teknis' },
    { id: 2, name: 'K3 & Lingkungan', count: 18, category: 'K3' },
    { id: 3, name: 'Kepemimpinan & Manajerial', count: 24, category: 'Leadership' },
    { id: 4, name: 'Transformasi Digital', count: 15, category: 'Digital' },
  ]);
});

app.get('/api/stats', (req, res) => {
  res.json({
    alumni: 150000,
    instructors: 500,
    programs: 200,
    years: 50,
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Contact form submission:', { name, email, message });
  res.json({ success: true, message: 'Pesan Anda telah diterima. Kami akan segera menghubungi Anda.' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PLN PUSDIKLAT Server running on http://localhost:${PORT}`);
});
