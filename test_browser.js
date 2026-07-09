(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Kuis Tanpa Judul',
        questions: [
          {
            type: 'PG',
            text: '1+1',
            options: [
              { text: '999', is_correct: false },
              { text: 'salah semua', is_correct: false },
              { text: '2', is_correct: true }
            ]
          },
          {
            type: 'CHECKBOX',
            text: 'faza makhluk dari mana?',
            options: [
              { text: 'Bumi', is_correct: true },
              { text: 'Jupiter', is_correct: false },
              { text: 'Australia', is_correct: false },
              { text: 'Tegal', is_correct: true }
            ]
          },
          {
            type: 'ESSAY',
            text: 'merk tv nya apa ()',
            options: [
              { text: 'SHARP', is_correct: true }
            ]
          }
        ]
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log("SUCCESS:", data);
  } catch (err) {
    console.error("FAILED:", err.message);
  }
})();
