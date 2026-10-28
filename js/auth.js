/**
 * auth.js
 * -------
 * Google authentication, auth-state handling, user-profile UI,
 * and logout flow for app.html.
 *
 * Depends on (must be loaded before this file):
 *   - Firebase compat CDN scripts (firebase-app, firebase-auth)
 *   - js/config/firebase-config.js   (firebase initialized)
 *   - js/firestore.js                (initializeUser)
 *
 * Exposes on window.ToxiGotchi:
 *   - auth         Firebase Auth instance
 *   - currentUser  Currently signed-in Firebase user (or null)
 */

(function () {
  'use strict';

  const TG = window.ToxiGotchi;

  // Firebase service references
  TG.auth     = firebase.auth();
  TG.provider = new firebase.auth.GoogleAuthProvider();

  // ── Auth-state observer ────────────────────────────────────────
  TG.auth.onAuthStateChanged(function (user) {
    const loginBtn   = document.getElementById('login-btn-header');
    const userProfile = document.getElementById('user-profile');

    if (!user) {
      TG.currentUser = null;
      TG.userData    = null;
      if (loginBtn)    loginBtn.style.display    = 'block';
      if (userProfile) userProfile.style.display = 'none';
    } else {
      TG.currentUser = user;
      if (loginBtn)    loginBtn.style.display    = 'none';
      // Kick off Firestore user initialization
      TG.initializeUser(user);
    }
  });

  // ── In-app login button (header) ───────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var loginBtn  = document.getElementById('login-btn-header');
    var logoutBtn = document.getElementById('logout-btn');

    if (loginBtn) {
      loginBtn.addEventListener('click', function () {
        TG.auth.signInWithPopup(TG.provider)
          .then(function (result) {
            console.log('Logged in:', result.user);
          })
          .catch(function (error) {
            console.error('Login error:', error);
          });
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
        try {
          logoutBtn.disabled    = true;
          logoutBtn.textContent = '⏻';

          TG.setRoast('Logging out... See you next time.');

          // Stop any running timer
          if (TG.isTimerRunning) {
            clearInterval(TG.timerInterval);
            TG.isTimerRunning = false;
          }

          // Stop vibration
          if (TG.vibrationInterval) {
            clearInterval(TG.vibrationInterval);
            TG.vibrationInterval = null;
          }

          await TG.auth.signOut();

          TG.currentUser = null;
          TG.userData    = null;

          window.location.href = 'index.html?_=' + Date.now();
        } catch (error) {
          console.error('Logout error:', error);
          window.location.replace('index.html');
        }
      });
    }
  });

}());
