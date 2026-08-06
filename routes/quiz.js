const express = require('express');
const router = express.Router();

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

// Landing Page (Choose Create or Join)
router.get('/', (req, res) => {
  res.render('quiz/index', { title: 'Quizzsz - JALA', currentPage: 'quiz' });
});

// Instructor Quiz Data Page
router.get('/data', async (req, res) => {
  console.log('Hit /quiz/data route');
  try {
    const response = await fetch(`${API_URL}/quiz`);
    let quizzes = [];
    if (response.ok) {
      const data = await response.json();
      quizzes = data.quizzes || [];
    }
    res.render('quiz/data', { title: 'Data Kuis Instruktur', currentPage: 'quiz', quizzes });
  } catch (error) {
    console.error('Error fetching quiz data for instructor:', error);
    res.render('quiz/data', { title: 'Data Kuis Instruktur', currentPage: 'quiz', quizzes: [] });
  }
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
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.error || `HTTP error! status: ${response.status}`);
      err.status = response.status;
      throw err;
    }
    const quiz = await response.json();
    res.render('quiz/take', { title: `Quiz: ${quiz.title}`, currentPage: 'quiz', quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error.message);
    res.render('error', { 
      title: 'Terjadi Kesalahan', 
      currentPage: 'quiz', 
      status: error.status || 500,
      message: error.message || 'Quiz tidak ditemukan atau terjadi kesalahan server.' 
    });
  }
});

// Host Quiz Page (Live Dashboard)
router.get('/host/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const response = await fetch(`${API_URL}/quiz/${code}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.error || `HTTP error! status: ${response.status}`);
      err.status = response.status;
      throw err;
    }
    const quiz = await response.json();
    res.render('quiz/host', { title: `Host Quiz: ${quiz.title}`, currentPage: 'quiz', quiz });
  } catch (error) {
    console.error('Error fetching quiz for host:', error.message);
    res.render('error', { 
      title: 'Terjadi Kesalahan', 
      currentPage: 'quiz',
      status: error.status || 500, 
      message: error.message || 'Quiz tidak ditemukan atau terjadi kesalahan server.' 
    });
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
