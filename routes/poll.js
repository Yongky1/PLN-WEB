const express = require('express');
const router = express.Router();
const { authGuard, instrukturOnly } = require('../middleware/auth');

// Landing Page (Choose Create or Join)
router.get('/', (req, res) => {
  res.render('poll/index', { title: 'Jajak Pendapat - JALA', currentPage: 'pembelajaran' });
});

// Create Poll Page (Host Setup)
router.get('/create', authGuard, instrukturOnly, (req, res) => {
  res.render('poll/host-setup', { title: 'Create Jajak Pendapat', currentPage: 'pembelajaran' });
});

// Join Poll Page (Participant Join)
router.get('/join', (req, res) => {
  res.render('poll/join', { title: 'Join Jajak Pendapat', currentPage: 'pembelajaran' });
});

// Take Poll Page (Participant view after joining)
router.get('/take/:code', (req, res) => {
  const { code } = req.params;
  const participantName = req.query.name || 'Anonim';
  res.render('poll/take', { title: `Jajak Pendapat: ${code}`, currentPage: 'pembelajaran', code, participantName });
});

// Host Live Dashboard (Host view after creating)
router.get('/host/:code', authGuard, instrukturOnly, (req, res) => {
  const { code } = req.params;
  const { title, time } = req.query;
  res.render('poll/host-live', { 
    title: `Host Jajak Pendapat: ${code}`, 
    currentPage: 'pembelajaran', 
    code, 
    pollTitle: title || 'Jajak Pendapat', 
    pollTime: time || 60 
  });
});

module.exports = router;
