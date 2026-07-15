const express = require('express');
const router = express.Router();
const { cachedFetch } = require('../utils/cache');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

// Katalog Instruktur
router.get('/katalog', async (req, res) => {
  console.log('GET /pembelajaran/katalog, sessionUser:', req.sessionUser);
  try {
    const katalogData = await cachedFetch(`${BACKEND_URL}/api/pembelajaran/katalog-instruktur`).catch(() => []);
    res.render('pembelajaran/katalog', {
      title: 'Katalog Instruktur — PLN Pusdiklat',
      currentPage: 'pembelajaran',
      katalogData,
    });
  } catch (err) {
    console.error('[/pembelajaran/katalog] Error:', err.message);
    res.render('pembelajaran/katalog', {
      title: 'Katalog Instruktur — PLN Pusdiklat',
      currentPage: 'pembelajaran',
      katalogData: [],
    });
  }
});

// Jadwal Instruktur
router.get('/jadwal', async (req, res) => {
  try {
    const [jadwalData, katalogData] = await Promise.all([
      cachedFetch(`${BACKEND_URL}/api/pembelajaran/jadwal-instruktur`).catch(() => []),
      cachedFetch(`${BACKEND_URL}/api/pembelajaran/katalog-instruktur`).catch(() => []),
    ]);
    res.render('pembelajaran/jadwal', {
      title: 'Jadwal Instruktur — PLN Pusdiklat',
      currentPage: 'pembelajaran',
      jadwalData,
      katalogData,
    });
  } catch (err) {
    console.error('[/pembelajaran/jadwal] Error:', err.message);
    res.render('pembelajaran/jadwal', {
      title: 'Jadwal Instruktur — PLN Pusdiklat',
      currentPage: 'pembelajaran',
      jadwalData: [],
      katalogData: [],
    });
  }
});

module.exports = router;
