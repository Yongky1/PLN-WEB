const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Also serve three.js from node_modules for easy access on the frontend
app.use('/scripts/three', express.static(path.join(__dirname, 'node_modules/three/build')));

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'PLN Pusdiklat — Ekosistem Pembelajaran Masa Depan'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 PLN Pusdiklat Concept running on http://localhost:${PORT}`);
    console.log(`===============================================`);
});
