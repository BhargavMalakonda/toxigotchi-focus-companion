# ToxiGotchi

> **Your focus keeps your pet alive.**
>
> A gamified productivity web application that transforms traditional Pomodoro sessions into an engaging virtual pet experience, encouraging users to stay focused through behavioral reinforcement instead of reminders.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Hackathon](https://img.shields.io/badge/Built%20For-Ship--in--a--Day%20Buildathon-blue)
![Development Time](https://img.shields.io/badge/Built%20In-7%20Hours-orange)
![Platform](https://img.shields.io/badge/Platform-Web-green)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## Live Demo

🔗 **Website:** _[Live](https://toxigotchi.vercel.app/)_

---

## Overview

ToxiGotchi is a **gamified productivity application** that turns focus sessions into a virtual pet survival experience.

Developed by a **team of two in just 7 hours** during the **Ship-in-a-Day Buildathon**, the project explores how **behavioral psychology** and **gamification** can improve productivity by creating emotional accountability.

Unlike traditional Pomodoro timers that simply notify users, ToxiGotchi gives every focus session real consequences—your virtual pet survives only if you stay focused.

---

## Features

- Virtual pet linked to your productivity
- Customizable Pomodoro timer
- Tab-switch detection to discourage distractions
- Daily focus streak tracking
- Hall of Fame leaderboard
- Hall of Shame leaderboard
- "Apology Gate" after failed focus sessions
- Mobile vibration feedback
- Secure Google Authentication
- Cloud synchronization using Firebase Firestore
- Responsive design for desktop and mobile
- Drift-free timer using absolute timestamps for improved accuracy

---

## Why ToxiGotchi?

Most productivity applications depend on notifications and reminders.

ToxiGotchi takes a different approach by using **behavioral reinforcement**.

Instead of reminding users to focus, the application creates emotional attachment to a virtual companion whose well-being depends on the user's consistency. Missing a session, switching tabs, or abandoning the timer has visible consequences, making productivity feel rewarding rather than repetitive.

---

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend & Database

- Firebase Authentication
- Firebase Firestore

### Deployment

- Vercel

---

## Technical Highlights

- Built, tested, and deployed in **7 hours**
- Google OAuth authentication
- Real-time Firestore database integration
- Absolute timestamp timer implementation (avoids timer drift)
- Browser Visibility API for distraction detection
- Cloud-based leaderboard and streak management
- Mobile-friendly responsive interface

---

## Project Structure

```
ToxiGotchi/
│
├── app.html
├── index.html
├── logo.png
└── README.md
└── LICENSE
```

---

## Challenges

Building a complete web application in only **7 hours** required rapid decision-making and prioritization.

Some of the key challenges included:

- Designing a meaningful gamification system
- Implementing secure authentication
- Synchronizing user progress with Firestore
- Detecting distractions using browser APIs
- Delivering a polished UI within the hackathon time limit

---

## Buildathon

ToxiGotchi was created during the **Ship-in-a-Day Buildathon**, where teams were challenged to ideate, develop, and deploy a complete application within a single day.

### Event Details

- Event: Ship-in-a-Day Buildathon by Github student community - SRMIST
- Team Size: 2 Members
- Development Time: 7 Hours
- Outcome: Fully functional deployed web application

This project demonstrates rapid prototyping, teamwork, problem-solving, and the ability to deliver a complete product under strict time constraints.

---

## Future Improvements

- AI-powered productivity insights
- Pet evolution system
- Friend challenges
- Desktop notifications
- Progressive Web App (PWA)

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/BhargavMalakonda/toxigotchi-focus-companion.git
```

### Navigate to the Project

```bash
cd toxigotchi
```

## Firebase Setup

To run this project locally:

1. Create a Firebase project.
2. Enable Authentication (Google Sign-In).
3. Create a Firestore database.
4. Replace the placeholder values in `index.html` with your Firebase configuration:

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

Configure Firestore Security Rules according to your project's requirements before deploying.

### Run

Simply open `index.html` in your browser or deploy using your preferred hosting service.

---

## Contributing

Contributions, ideas, and feedback are always welcome.

Feel free to fork the repository, create a feature branch, and submit a pull request.

---

## Team

### Chaitanya Bhargav Malakonda

- _[Github](https://github.com/BhargavMalakonda)_
- _[LinkedIn](https://www.linkedin.com/in/chaitanya-bhargav-malakonda/)_

### Dhruv Malu

- _[Github](https://github.com/Dhruvmalu)_
- _[LinkedIn](https://www.linkedin.com/in/dhruv-malu-845788324)_


---

## License

This project is licensed under the MIT License.

---

## Support

If you found this project interesting, consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates us to build more impactful applications.
