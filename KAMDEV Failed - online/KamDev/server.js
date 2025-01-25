const express = require('express');
const mongoose = require('mongoose');
const Mood = require('./models/Mood'); // Import the Mood model

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // To parse JSON bodies

// Connect to MongoDB
mongoose.connect('your_mongodb_connection_string', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// API endpoint to fetch mood data
app.get('/api/moods', async (req, res) => {
    try {
        const moods = await Mood.find(); // Fetch all moods from the database
        res.json(moods); // Send the mood data as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error'); // Handle server errors
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
