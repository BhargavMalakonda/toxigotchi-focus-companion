# ToxiGotchi

> **Your focus keeps your pet alive.**

A gamified productivity web app that turns Pomodoro sessions into a virtual pet survival experience. Stay focused or your pet suffers the consequences.

<p align="center">
  <img src="assets/images/logo.png" alt="ToxiGotchi Logo" width="200" />
</p>

![Status](https://img.shields.io/badge/Status-Completed-success)
![Built For](https://img.shields.io/badge/Built%20For-Ship--in--a--Day%20Buildathon-blue)
![Built In](https://img.shields.io/badge/Built%20In-7%20Hours-orange)
![Platform](https://img.shields.io/badge/Platform-Web-green)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## Live Demo

🔗 **Website:** [toxigotchi.vercel.app](https://toxigotchi.vercel.app/)

---

## Mobile Access

### Option 1: Install it like an app

You can access ToxiGotchi from your Android device without cloning the source code:

1. Open the ToxiGotchi web app in Chrome on your Android device.
2. Tap the three-dot menu.
3. Select **Add to Home screen** or **Install app**, if available.
4. Follow the on-screen instructions.

The availability and behavior of this option depend on the website's PWA configuration and your browser.

### Option 2: Native Android Wrapper

A dedicated Android wrapper for ToxiGotchi is available separately:

🔗 **Android Repository:** [ToxiGotchi-Android](https://github.com/BhargavMalakonda/ToxiGotchi-Android)

This is a native Android app that wraps the web experience, distinct from opening the website in a mobile browser.

---

## Overview

ToxiGotchi is a gamified productivity application that turns focus sessions into a virtual pet survival experience.

Developed by a team of two in 7 hours during the Ship-in-a-Day Buildathon, the project explores how behavioral psychology and gamification can improve productivity by creating emotional accountability.

Unlike traditional Pomodoro timers that simply notify users, ToxiGotchi gives every focus session real consequences—your virtual pet survives only if you stay focused.

---

## Features

- 🐕 **Virtual Pet** — A digital companion whose health depends on your focus
- ⏱️ **Customizable Pomodoro Timer** — Set your own focus/break durations and session count
- 🚨 **Tab-Switch Detection** — Switching tabs during a focus session damages your pet
- 🔥 **Daily Streak Tracking** — Build consecutive focus days to maintain your streak
- 🏆 **Leaderboards** — Global Hall of Shame and Friends Weekly XP rankings
- ✍️ **Apology Gate** — Type a genuine apology (minimum 15 words) to unlock after a failed session
- 📳 **Mobile Vibration Feedback** — Haptic alerts on supported devices
- 🔐 **Google Authentication** — Secure sign-in via Firebase Auth
- ☁️ **Cloud Sync** — Progress saved to Firebase Firestore
- 📱 **Responsive Design** — Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Auth & Database | Firebase Authentication, Firebase Firestore |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- A modern web browser
- A [Firebase](https://firebase.google.com/) project (free tier works)

### Clone the Repository

```bash
git clone https://github.com/BhargavMalakonda/toxigotchi-focus-companion.git
cd toxigotchi-focus-companion
```

### Firebase Setup

1. Create a Firebase project at the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** → Sign-in method → **Google**.
3. Create a **Firestore Database** (production or test mode).
4. Copy your Firebase config from Project Settings → General → Your apps.
5. Open `js/config/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

This is the **single file** that both `index.html` and `app.html` load. You only need to edit it once.

6. Configure Firestore Security Rules appropriate for your project before deploying.

### Run Locally

Open `index.html` in your browser, or serve the project with any static file server:

```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

Then navigate to `http://localhost:8000`.

---

## Usage

1. Open the app — you'll see the ToxiGotchi login screen.
2. Sign in with Google.
3. Configure your session: set a goal, focus duration, break duration, and number of sessions.
4. Click **Lock In**, then **Start Focus**.
5. Stay on the tab. Switching away during a focus session triggers the fail state.
6. If you fail, type a 15+ word apology containing "sorry" or "apologize" to continue.
7. Complete all sessions to keep your pet healthy and your streak alive.

---

## Project Structure

```
toxigotchi-focus-companion/
├── index.html              # Login page (entry point)
├── app.html                # Main focus timer application
├── assets/
│   └── images/
│       └── logo.png        # ToxiGotchi logo
├── css/
│   ├── login.css           # Login page styles
│   └── app.css             # Application styles (includes responsive)
├── js/
│   ├── config/
│   │   └── firebase-config.js  # Firebase project config + initialization
│   ├── namespace.js        # Shared window.ToxiGotchi namespace
│   ├── firestore.js        # Firestore reads, writes, data sync
│   ├── pet.js              # Pet health state and health-bar UI
│   ├── timer.js            # Pomodoro timer engine, session lifecycle, audio
│   ├── distractions.js     # Tab-visibility detection, fail state, apology gate
│   ├── leaderboard.js      # Leaderboard modal and tab switching
│   ├── auth.js             # Auth-state handling, in-app login/logout (app.html)
│   ├── login.js            # Google sign-in flow (index.html only)
│   └── app.js              # App init, setup screen, completion screen
├── README.md
├── LICENSE
└── .gitignore
```

---

## Deployment

This is a static site with no build step. Deploy to any static host:

### Vercel

```bash
npx vercel
```

### GitHub Pages

1. Push to GitHub.
2. Go to Settings → Pages.
3. Set source to your main branch.
4. Your site will be available at `https://username.github.io/toxigotchi-focus-companion/`.

> **Note:** Make sure your Firebase config and authorized domains include your deployment URL.

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## Team

**Chaitanya Bhargav Malakonda** — [GitHub](https://github.com/BhargavMalakonda) · [LinkedIn](https://www.linkedin.com/in/chaitanya-bhargav-malakonda/)

**Dhruv Malu** — [GitHub](https://github.com/Dhruvmalu) · [LinkedIn](https://www.linkedin.com/in/dhruv-malu-845788324)

---

## Support

If you found this project interesting, consider giving it a ⭐ on GitHub. It helps others discover the project and motivates us to build more.
