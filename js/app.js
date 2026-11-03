/**
 * app.js
 * ------
 * Application initialization, shared UI update logic, setup screen,
 * completion screen, and event wiring that spans multiple modules.
 *
 * This is the final script loaded on app.html. By this point all
 * other ToxiGotchi modules have already registered their functions
 * on window.ToxiGotchi.
 *
 * Depends on (must be loaded before this file):
 *   - js/config/firebase-config.js
 *   - js/firestore.js    (initializeUser, loadLeaderboards, userData)
 *   - js/pet.js          (petHealth, updateHealthUI)
 *   - js/timer.js        (startTimer, formatTime, setRoast, setStatus,
 *                         updateTracker, timeLeft, focusDuration,
 *                         breakDuration, totalSessions, currentSession,
 *                         isBreakTime, isGameOver, sessions)
 *   - js/distractions.js (isHostageMode, vibrationInterval,
 *                         triggerFailState)
 *   - js/leaderboard.js
 *   - js/auth.js
 */

(function () {
  'use strict';

  const TG = window.ToxiGotchi;

  // ── updateUI — refresh profile strip and streak widget ─────────
  TG.updateUI = function () {
    if (!TG.currentUser || !TG.userData) return;

    var userProfile    = document.getElementById('user-profile');
    var userNameSpan   = document.getElementById('user-name');
    var userXpSpan     = document.getElementById('user-xp');
    var userStreakSpan  = document.getElementById('user-streak');
    var streakCounter  = document.getElementById('streak-counter');
    var streakWidgetBody = document.getElementById('streak-widget-body');

    if (userProfile)    userProfile.style.display  = 'flex';
    if (userNameSpan)   userNameSpan.textContent   = TG.userData.name || TG.currentUser.displayName;
    if (userXpSpan)     userXpSpan.textContent     = TG.userData.xp    || 0;
    if (userStreakSpan) userStreakSpan.textContent  = TG.userData.streak || 0;

    if (streakCounter) {
      streakCounter.innerHTML =
        `<span class="fire">🔥</span> ${TG.userData.streak || 0} Day Streak`;
    }

    if (streakWidgetBody) {
      if (TG.userData.streak > 0) {
        streakWidgetBody.innerHTML =
          `You're on a <strong>${TG.userData.streak}-day streak</strong>. Complete a focus session today to keep it alive.`;
      } else {
        streakWidgetBody.innerHTML = 'Start your streak today! Complete a focus session.';
      }
    }

    TG.setRoast(`Welcome back, ${TG.userData.name}. Ready to focus?`);
    TG.loadLeaderboards();
  };

  // ── DOM wiring (runs after DOM is ready) ──────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    // ── Setup screen ──────────────────────────────────────────
    var setupScreen    = document.getElementById('setup-screen');
    var mainApp        = document.getElementById('main-app');
    var goalInput      = document.getElementById('goal-input');
    var focusTimeInput = document.getElementById('focus-time-input');
    var breakTimeInput = document.getElementById('break-time-input');
    var sessionsInput  = document.getElementById('sessions-input');
    var lockInBtn      = document.getElementById('lock-in-btn');
    var currentGoalDisplay = document.getElementById('current-goal-display');
    var timerDisplay   = document.getElementById('timer-display');
    var startBtn       = document.getElementById('start-btn');
    var giveUpBtn      = document.getElementById('give-up-btn');
    var petImage       = document.getElementById('pet-image');
    var timerBox       = document.querySelector('.timer-box');

    if (lockInBtn) {
      lockInBtn.addEventListener('click', function () {
        if (!TG.currentUser) {
          alert('Please login first!');
          return;
        }
        if (!goalInput.value.trim()) {
          alert('You need a goal to proceed.');
          goalInput.focus();
          return;
        }

        TG.focusDuration  = (parseInt(focusTimeInput.value, 10) || 25) * 60;
        TG.breakDuration  = (parseInt(breakTimeInput.value, 10) || 5)  * 60;
        TG.totalSessions  = parseInt(sessionsInput.value, 10)   || 4;

        TG.currentSession = 1;
        TG.isBreakTime    = false;
        TG.timeLeft       = TG.focusDuration;
        TG.petHealth      = 100;
        TG.updateHealthUI();

        if (currentGoalDisplay) {
          currentGoalDisplay.textContent = '🎯 Goal: ' + goalInput.value.trim();
        }
        if (timerDisplay) timerDisplay.textContent = TG.formatTime(TG.timeLeft);
        if (timerBox)     timerBox.setAttribute('data-label', 'FOCUS');
        TG.updateTracker();

        if (setupScreen) setupScreen.style.display = 'none';
        if (mainApp)     mainApp.style.display     = 'flex';
      });
    }

    // ── Start button ───────────────────────────────────────────
    if (startBtn) {
      startBtn.addEventListener('click', TG.startTimer);
    }

    // ── Completion screen ──────────────────────────────────────
    var completionScreen  = document.getElementById('completion-screen');
    var completionBtnRow  = document.getElementById('completion-btn-row');
    var newTaskBtn        = document.getElementById('new-task-btn');
    var enoughBtn         = document.getElementById('enough-btn');
    var enoughMsg         = document.getElementById('enough-msg');
    var sessionCountEl    = document.getElementById('session-count');

    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', function () {
        if (completionScreen) completionScreen.style.display = 'none';
        if (enoughMsg)        enoughMsg.style.display        = 'none';
        if (completionBtnRow) completionBtnRow.style.display = 'flex';

        TG.currentSession = 1;
        TG.isBreakTime    = false;
        TG.timeLeft       = TG.focusDuration;
        TG.sessions       = 0;
        TG.petHealth      = 100;
        if (sessionCountEl) sessionCountEl.textContent = 0;
        TG.updateHealthUI();

        if (goalInput)      goalInput.value         = '';
        if (focusTimeInput) focusTimeInput.value     = '25';
        if (breakTimeInput) breakTimeInput.value     = '5';
        if (sessionsInput)  sessionsInput.value      = '4';
        if (timerDisplay) {
          timerDisplay.textContent = '25:00';
          timerDisplay.classList.remove('danger');
        }
        if (timerBox) timerBox.setAttribute('data-label', 'FOCUS');
        if (startBtn) {
          startBtn.textContent = '▶ Start Focus';
          startBtn.disabled    = false;
        }
        if (petImage) { petImage.innerText = '🐕'; petImage.className = ''; }

        TG.setRoast('I am watching you. Start the timer.');
        TG.setStatus('IDLE');
        if (giveUpBtn) giveUpBtn.disabled = true;

        if (mainApp)     mainApp.style.display     = 'none';
        if (setupScreen) setupScreen.style.display = 'flex';
      });
    }

    if (enoughBtn) {
      enoughBtn.addEventListener('click', function () {
        if (completionBtnRow) completionBtnRow.style.display = 'none';
        if (enoughMsg)        enoughMsg.style.display        = 'block';
      });
    }

    // ── Browser exit warning ───────────────────────────────────
    window.addEventListener('beforeunload', function (e) {
      if (TG.isTimerRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // ── Logo error fallback ────────────────────────────────────
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        this.style.display = 'none';
      });
    });

  });

}());
