const express = require('express');
const router = express.Router();

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

// Landing Page (Choose Create or Join)
router.get('/', (req, res) => {
  res.render('quiz/index', { title: 'Quizzsz - JALA', currentPage: 'quiz' });
});

// Create Quiz Page
router.get('/create', (req, res) => {
  res.render('quiz/create', { title: 'Create Quiz - JALA', currentPage: 'quiz' });
});

// Take Quiz Page
router.get('/take/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const response = await fetch(`${API_URL}/quiz/${code}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const quiz = await response.json();
    res.render('quiz/take', { title: `Quiz: ${quiz.title}`, currentPage: 'quiz', quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error.message);
    res.render('error', { message: 'Quiz tidak ditemukan atau terjadi kesalahan server.' });
  }
});

// Result Page
router.get('/result/:code', (req, res) => {
  const { code } = req.params;
  const score = req.query.score || 0;
  const participant = req.query.name || 'Peserta';
  res.render('quiz/result', { title: 'Quiz Result', currentPage: 'quiz', code, score, participant });
});

module.exports = router;
