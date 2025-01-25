// models/Mood.js
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    moodValue: {
        type: String, // Change this to Number if you're using numerical values (e.g., 1-5)
        required: true
    },
    date: {
        type: Date,
        default: Date.now // Automatically set to current date
    }
});

const Mood = mongoose.model('Mood', moodSchema);
module.exports = Mood;
