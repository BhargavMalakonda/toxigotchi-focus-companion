/**
 * firebase-config.js
 * ------------------
 * Firebase project configuration and SDK initialization.
 *
 * Replace the placeholder values below with your own Firebase project
 * config before deploying. See README.md → Firebase Setup for details.
 *
 * SECURITY NOTE: These are browser-facing identifiers, not server-side
 * secrets. Protect the project using Firebase Authentication rules,
 * Firestore Security Rules, and API key restrictions in the Google
 * Cloud Console.
 *
 * This file must be loaded AFTER the Firebase compat CDN scripts and
 * BEFORE any other ToxiGotchi JS files.
 */

const firebaseConfig = {
  apiKey:            "YOUR_FIREBASE_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// Initialize the Firebase app once.
// Both index.html and app.html load this file, so guard against
// accidental double-initialization (e.g. during hot-reload in dev).
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
