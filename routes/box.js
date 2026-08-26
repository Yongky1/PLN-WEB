const express = require('express');
const router = express.Router();
const { authGuard, instrukturOnly } = require('../middleware/auth');

// Landing Page (Choose Create or Join)
router.get('/', (req, res) => {
  res.render('box/index', { title: 'Whats In The Box', currentPage: 'pembelajaran' });
});

// Create Box Game (Host Setup)
router.get('/create', authGuard, instrukturOnly, (req, res) => {
  console.log('[box.js] /create hit. req.cookies.auth_token:', !!req.cookies.auth_token);
  res.render('box/host-setup', { 
    title: 'Buat Game Whats In The Box', 
    currentPage: 'pembelajaran',
    authToken: req.cookies.auth_token || ''
  });
});

// Join Box Game (Participant Join)
router.get('/join', (req, res) => {
  res.render('box/join', { title: 'Join Whats In The Box', currentPage: 'pembelajaran' });
});

// Take Box Game (Participant view after joining)
router.get('/take/:code', (req, res) => {
  const { code } = req.params;
  const participantName = req.query.name || 'Anonim';
  res.render('box/take', { title: `Whats In The Box: ${code}`, currentPage: 'pembelajaran', code, participantName });
});

// Host Live Dashboard (Host view after creating)
router.get('/host/:code', authGuard, instrukturOnly, (req, res) => {
  const { code } = req.params;
  const { word, clues, timeBetweenClues } = req.query;
  res.render('box/host-live', { 
    title: `Host Box: ${code}`, 
    currentPage: 'pembelajaran', 
    code,
    word,
    clues,
    timeBetweenClues
  });
});

module.exports = router;
