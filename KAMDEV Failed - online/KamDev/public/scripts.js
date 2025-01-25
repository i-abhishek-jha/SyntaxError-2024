// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Example API endpoint (assuming you're using a MongoDB model called Mood)
app.post('/api/moods', async (req, res) => {
    // Your code to handle saving moods
});

app.get('/api/moods', async (req, res) => {
    // Your code to handle fetching moods
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
