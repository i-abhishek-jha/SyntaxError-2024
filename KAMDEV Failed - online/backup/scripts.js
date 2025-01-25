// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOuePCkI9OKtaxFJdTZjnUMEzxs5nPlbg",
    authDomain: "track-mood-d55c8.firebaseapp.com",
    projectId: "track-mood-d55c8",
    storageBucket: "track-mood-d55c8.appspot.com",
    messagingSenderId: "543507583522",
    appId: "1:543507583522:web:d008e27239055e7a3ff07b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Music files for different moods
const musicTracks = {
    happy: [
        "https://www.bensound.com/bensound-music/bensound-sunny.mp3",  // Happy music
        "https://www.bensound.com/bensound-music/bensound-littleidea.mp3", // Cheerful tune
        "https://www.bensound.com/bensound-music/bensound-ukulele.mp3"  // Ukulele happy music
    ],
    sad: [
        "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3", // Sad music
        "https://www.bensound.com/bensound-music/bensound-forbidden.mp3", // Emotional music
        "https://www.bensound.com/bensound-music/bensound-dreams.mp3" // Melancholic tune
    ],
    neutral: [
        "https://www.bensound.com/bensound-music/bensound-tomorrow.mp3", // Neutral music
        "https://www.bensound.com/bensound-music/bensound-epic.mp3", // Calm and neutral music
        "https://www.bensound.com/bensound-music/bensound-betterdays.mp3" // Chill instrumental
    ],
    angry: [
        "https://www.bensound.com/bensound-music/bensound-energy.mp3", // Angry music
        "https://www.bensound.com/bensound-music/bensound-actionable.mp3", // Intense music
        "https://www.bensound.com/bensound-music/bensound-stronger.mp3" // Heavy beat music
    ]
};

// Mood selection function
window.imageClick = async function(mood) {
    const moodMessage = document.getElementById("mood-message");
    moodMessage.innerText = `You're feeling ${mood}! ${getMoodEmoji(mood)}`;

    await saveMood(mood);
    changeMusic(mood);
    await loadChart();
};

// Function to get emoji based on mood
function getMoodEmoji(mood) {
    switch (mood) {
        case 'happy': return '😊';
        case 'sad': return '😢';
        case 'neutral': return '😐';
        case 'angry': return '😡';
        default: return '';
    }
}

// Function to save mood to Firestore
async function saveMood(mood) {
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD
    try {
        await addDoc(collection(db, "moods"), { mood, date });
        document.getElementById("mood-message").innerText = `Mood "${mood}" saved successfully!`;
    } catch (error) {
        console.error("Error writing document: ", error);
    }
}

// Function to load mood data and create chart
async function loadChart() {
    const moodData = {};
    const querySnapshot = await getDocs(collection(db, "moods"));

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const mood = data.mood;
        const date = data.date;

        if (!moodData[date]) {
            moodData[date] = { happy: 0, sad: 0, neutral: 0, angry: 0 };
        }
        moodData[date][mood]++;
    });

    // Prepare data for the chart
    const labels = Object.keys(moodData);
    const happyCounts = labels.map(date => moodData[date].happy);
    const sadCounts = labels.map(date => moodData[date].sad);
    const neutralCounts = labels.map(date => moodData[date].neutral);
    const angryCounts = labels.map(date => moodData[date].angry);

    // Create the chart
    const ctx = document.getElementById('moodChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Happy', backgroundColor: 'rgba(255, 205, 86, 0.5)', borderColor: 'rgba(255, 205, 86, 1)', data: happyCounts },
                { label: 'Sad', backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)', data: sadCounts },
                { label: 'Neutral', backgroundColor: 'rgba(201, 203, 207, 0.5)', borderColor: 'rgba(201, 203, 207, 1)', data: neutralCounts },
                { label: 'Angry', backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgba(255, 99, 132, 1)', data: angryCounts },
            ],
        },
        options: {
            scales: { y: { beginAtZero: true } },
        },
    });
}

// Function to change music based on the selected mood
function changeMusic(mood) {
    const audioElement = document.getElementById('relaxMusic');
    const tracks = musicTracks[mood];
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    audioElement.src = randomTrack;
    audioElement.play();
}

// Function to save journal entry to Firestore
async function saveJournal() {
    const entry = document.getElementById('journalEntry').value;
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD
    const journalMessage = document.getElementById('journalMessage');

    if (entry.trim() === '') {
        journalMessage.innerText = "Please write something before saving.";
        return;
    }

    try {
        await addDoc(collection(db, "journals"), { entry, date });
        journalMessage.innerText = `Journal entry saved on ${date}.`;
        document.getElementById('journalEntry').value = ''; // Clear the textarea
        loadJournalEntries(); // Load the updated entries
    } catch (error) {
        console.error("Error saving journal entry: ", error);
    }
}

// Function to load journal entries from Firestore
async function loadJournalEntries() {
    const journalEntriesDiv = document.getElementById('journalEntries');
    journalEntriesDiv.innerHTML = ''; // Clear previous entries
    const querySnapshot = await getDocs(collection(db, "journals"));

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const entry = data.entry;
        const date = data.date;

        // Create a new paragraph for each entry
        const entryParagraph = document.createElement('p');
        entryParagraph.innerText = `${date}: ${entry}`;
        journalEntriesDiv.appendChild(entryParagraph);
    });
}

// Update the openTab function to load journal entries when the Journal tab is opened
function openTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';  // Hide all tabs
    });
    document.getElementById(tabId).style.display = 'block';  // Show the selected tab

    if (tabId === 'journal') {
        loadJournalEntries(); // Fetch journal entries when the Journal tab is opened
    } else if (tabId === 'chart') {
        loadChart(); // Fetch mood data when the chart tab is opened
    }
}

// Set the default tab to be visible on page load
window.onload = async function() {
    openTab('moodTracker');
    await loadChart(); // Load chart when page loads
};
