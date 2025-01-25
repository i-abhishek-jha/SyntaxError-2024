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
        "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
        "https://www.bensound.com/bensound-music/bensound-littleidea.mp3",
        "https://www.bensound.com/bensound-music/bensound-ukulele.mp3"
    ],
    sad: [
        "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
        "https://www.bensound.com/bensound-music/bensound-forbidden.mp3",
        "https://www.bensound.com/bensound-music/bensound-dreams.mp3"
    ],
    neutral: [
        "https://www.bensound.com/bensound-music/bensound-tomorrow.mp3",
        "https://www.bensound.com/bensound-music/bensound-epic.mp3",
        "https://www.bensound.com/bensound-music/bensound-betterdays.mp3"
    ],
    angry: [
        "https://www.bensound.com/bensound-music/bensound-energy.mp3",
        "https://www.bensound.com/bensound-music/bensound-actionable.mp3",
        "https://www.bensound.com/bensound-music/bensound-stronger.mp3"
    ]
};

// Function to change music based on mood
function changeMusic(mood) {
    const audioElement = document.getElementById('relaxMusic');
    const tracks = musicTracks[mood];
    
    if (!tracks || tracks.length === 0) {
        console.error("No tracks found for mood:", mood); // Debugging
        return;
    }

    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    console.log("Playing track:", randomTrack); // Debugging

    audioElement.src = randomTrack; // Set the source of the audio
    audioElement.load(); // Load the new audio file
    audioElement.play(); // Play the audio
}

// Function to handle the mood selection and change the music
window.imageClick = async function(mood) {
    console.log("Mood selected:", mood); // Debugging

    // Save the mood and update the UI
    await saveMood(mood);
    document.getElementById("mood-message").innerText = `You're feeling ${mood}!`;

    // Change the music based on the selected mood
    changeMusic(mood);
};

// Function to save mood to Firestore
async function saveMood(mood) {
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD
    try {
        await addDoc(collection(db, "moods"), {
            mood: mood,
            date: date
        });
        document.getElementById("mood-message").innerText = `Mood "${mood}" saved successfully!`;
        await loadChart(); // Load the chart after saving
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
                {
                    label: 'Happy',
                    backgroundColor: 'rgba(255, 205, 86, 0.2)',
                    borderColor: 'rgba(255, 205, 86, 1)',
                    borderWidth: 1,
                    data: happyCounts
                },
                {
                    label: 'Sad',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    data: sadCounts
                },
                {
                    label: 'Neutral',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    data: neutralCounts
                },
                {
                    label: 'Angry',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: angryCounts
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to save journal entry
async function saveJournal() {
    const journalText = document.getElementById('journalEntry').value;
    const date = new Date().toISOString().split('T')[0]; // Current date

    try {
        await addDoc(collection(db, "journal"), {
            text: journalText,
            date: date
        });
        document.getElementById("journalMessage").innerText = "Journal entry saved!";
        loadJournal(); // Reload the journal entries after saving
    } catch (error) {
        console.error("Error saving journal entry: ", error);
    }
}

// Function to load and display journal entries
async function loadJournal() {
    const journalContainer = document.getElementById('journalEntries');
    journalContainer.innerHTML = ''; // Clear previous entries
    const querySnapshot = await getDocs(collection(db, "journal"));

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const journalEntry = document.createElement('p');
        journalEntry.textContent = `${data.date}: ${data.text}`;
        journalContainer.appendChild(journalEntry);
    });
}

// Function to handle tab switching
window.openTab = function(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = 'none'; // Hide all tabs
    }
    document.getElementById(tabName).style.display = 'block'; // Show selected tab
};

// Load journal entries on page load
window.onload = function() {
    loadJournal(); // Load journal entries
};
