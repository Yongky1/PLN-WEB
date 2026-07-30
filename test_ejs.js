const ejs = require('ejs');
const path = require('path');

const filePath = path.join(__dirname, 'views', 'admin', 'quiz.ejs');
ejs.renderFile(filePath, {
  title: 'Test',
  quizzes: [
    {
      id: '1',
      title: 'Test Quiz',
      code: 'TEST01',
      questions: [],
      submissions: [],
      created_at: new Date()
    }
  ],
  allSubmissions: [
    {
      id: '1',
      participant_name: 'Test Name',
      score: 100,
      created_at: new Date(),
      quiz: { title: 'Test Quiz', code: 'TEST01' }
    }
  ],
  currentUser: {}
}, (err, str) => {
  if (err) {
    console.error('Error rendering:', err);
  } else {
    console.log('Success');
  }
});
