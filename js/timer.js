/**
 * timer.js
 * --------
 * Pomodoro timer engine and focus-session lifecycle.
 * Uses absolute timestamps (Date.now) to avoid timer drift.
 *
 * Depends on (must be loaded before this file):
 *   - js/pet.js          (updateHealthUI, petHealth)
 *   - js/firestore.js    (trackFocusCompletion)
 *
 * Exposes on window.ToxiGotchi:
 *   - isTimerRunning
 *   - timerInterval
 *   - isBreakTime
 *   - isGameOver
 *   - timeLeft
 *   - focusDuration
 *   - breakDuration
 *   - totalSessions
 *   - currentSession
 *   - startTimer()
 *   - formatTime(secs)
 *   - setRoast(msg, bad)
 *   - setStatus(text)
 *   - updateTracker()
 */

(function () {
  'use strict';

  const TG = window.ToxiGotchi;

  // ── Audio ──────────────────────────────────────────────────────
  var audioCtx     = new (window.AudioContext || window.webkitAudioContext)();
  TG.alarmInterval = null;

  function playHarshBeep() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    var osc  = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  }

  // ── Timer state ────────────────────────────────────────────────
  TG.timeLeft      = 1500;
  TG.timerInterval = null;
  TG.isTimerRunning = false;
  TG.isBreakTime   = false;
  TG.isGameOver    = false;
  TG.sessions      = 0;
  TG.totalSessions = 4;
  TG.currentSession = 1;
  TG.focusDuration = 1500;
  TG.breakDuration = 300;

  var targetEndTime = 0;

  // ── Helpers ────────────────────────────────────────────────────
  TG.formatTime = function (secs) {
    var m = String(Math.floor(secs / 60)).padStart(2, '0');
    var s = String(secs % 60).padStart(2, '0');
    return m + ':' + s;
  };

  TG.setRoast = function (msg, bad) {
    var roastBox = document.getElementById('roast-box');
    if (!roastBox) return;
    roastBox.textContent = msg;
    roastBox.className   = bad ? 'bad' : '';
  };

  TG.setStatus = function (text) {
    var statusLabel = document.getElementById('status-label');
    if (statusLabel) statusLabel.textContent = text;
  };

  TG.updateTracker = function () {
    var trackerCurrent  = document.getElementById('tracker-current');
    var trackerTotal    = document.getElementById('tracker-total');
    var trackerPhase    = document.getElementById('tracker-phase');
    var sessionTracker  = document.getElementById('session-tracker');

    if (trackerCurrent) trackerCurrent.textContent = TG.currentSession;
    if (trackerTotal)   trackerTotal.textContent   = TG.totalSessions;

    if (TG.isBreakTime) {
      if (trackerPhase)   trackerPhase.textContent   = 'Break';
      if (sessionTracker) sessionTracker.className   = 'break-mode';
    } else {
      if (trackerPhase)   trackerPhase.textContent   = 'Focus';
      if (sessionTracker) sessionTracker.className   = '';
    }
  };

  // ── Main timer function ────────────────────────────────────────
  TG.startTimer = function () {
    var timerDisplay    = document.getElementById('timer-display');
    var timerBox        = document.querySelector('.timer-box');
    var petImage        = document.getElementById('pet-image');
    var startBtn        = document.getElementById('start-btn');
    var giveUpBtn       = document.getElementById('give-up-btn');
    var sessionCountEl  = document.getElementById('session-count');
    var completionScreen = document.getElementById('completion-screen');
    var completionGoalText = document.getElementById('completion-goal-text');
    var mainApp         = document.getElementById('main-app');
    var goalInput       = document.getElementById('goal-input');

    if (!TG.currentUser) {
      alert('Please login first!');
      return;
    }
    if (TG.isTimerRunning || TG.isHostageMode) return;

    // ── Game Over restart ──────────────────────────────────────
    if (TG.isGameOver) {
      TG.isGameOver      = false;
      TG.petHealth       = 100;
      TG.currentSession  = 1;
      TG.isBreakTime     = false;
      TG.updateHealthUI();
      petImage.innerText = '🐕';
      petImage.className = '';
      TG.setRoast('A fresh start. Try not to fail.');
      startBtn.textContent = '▶ Start Focus';
      startBtn.disabled    = false;
      TG.setStatus('IDLE');
      return;
    }

    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (TG.alarmInterval) {
      clearInterval(TG.alarmInterval);
      TG.alarmInterval = null;
    }
    document.title = 'ToxiGotchi';

    TG.sessions++;
    if (sessionCountEl) sessionCountEl.textContent = TG.sessions;

    if (TG.isBreakTime) {
      startBtn.textContent = 'Break Running';
      petImage.innerText   = '🦮';
      petImage.className   = '';
      TG.setRoast('Enjoy your pathetic break.');
      TG.setStatus('BREAK');
      if (timerBox) timerBox.setAttribute('data-label', 'BREAK');
    } else {
      startBtn.textContent = 'Focus Running';
      petImage.innerText   = '🐕';
      petImage.className   = '';
      TG.setRoast('Finally working. Prove me wrong.');
      TG.setStatus('FOCUSING');
      if (timerBox) timerBox.setAttribute('data-label', 'FOCUS');
    }

    timerDisplay.textContent = TG.formatTime(TG.timeLeft);
    timerDisplay.classList.remove('danger');
    TG.updateTracker();
    giveUpBtn.disabled = false;
    startBtn.disabled  = true;

    TG.isTimerRunning = true;
    targetEndTime     = Date.now() + (TG.timeLeft * 1000);

    TG.timerInterval = setInterval(function () {
      if (!TG.isTimerRunning) return;

      TG.timeLeft = Math.round((targetEndTime - Date.now()) / 1000);
      if (TG.timeLeft < 0) TG.timeLeft = 0;
      timerDisplay.textContent = TG.formatTime(TG.timeLeft);

      if (!TG.isBreakTime && TG.timeLeft <= 300) {
        timerDisplay.classList.add('danger');
      }

      if (TG.timeLeft <= 0) {
        clearInterval(TG.timerInterval);
        TG.isTimerRunning = false;
        timerDisplay.classList.remove('danger');
        giveUpBtn.disabled = true;

        // ── Focus session finished, more sessions remain → break ──
        if (!TG.isBreakTime && TG.currentSession < TG.totalSessions) {
          TG.petHealth = Math.min(100, TG.petHealth + 10);
          TG.updateHealthUI();
          TG.isBreakTime               = true;
          TG.timeLeft                  = TG.breakDuration;
          timerDisplay.textContent     = TG.formatTime(TG.timeLeft);
          petImage.innerText           = '🦮';
          petImage.className           = '';
          startBtn.textContent         = 'Start Break';
          startBtn.disabled            = false;
          if (timerBox) timerBox.setAttribute('data-label', 'BREAK');
          TG.setRoast('Take a break.');
          TG.setStatus('BREAK');
          TG.updateTracker();
        }

        // ── Final focus session finished → completion screen ──────
        else if (!TG.isBreakTime && TG.currentSession === TG.totalSessions) {
          TG.petHealth = Math.min(100, TG.petHealth + 10);
          TG.updateHealthUI();
          if (completionGoalText) {
            completionGoalText.textContent =
              (goalInput && goalInput.value.trim()) || 'your goal';
          }
          if (mainApp)          mainApp.style.display          = 'none';
          if (completionScreen) completionScreen.style.display = 'flex';
          TG.trackFocusCompletion();
        }

        // ── Break finished → next focus session ───────────────────
        else if (TG.isBreakTime && TG.currentSession < TG.totalSessions) {
          TG.currentSession++;
          TG.isBreakTime               = false;
          TG.timeLeft                  = TG.focusDuration;
          timerDisplay.textContent     = TG.formatTime(TG.timeLeft);
          petImage.innerText           = '🐕';
          petImage.className           = '';
          startBtn.textContent         = 'Start Focus';
          startBtn.disabled            = false;
          if (timerBox) timerBox.setAttribute('data-label', 'FOCUS');
          TG.updateTracker();

          if (!TG.alarmInterval) {
            playHarshBeep();
            TG.alarmInterval = setInterval(playHarshBeep, 600);
          }
          TG.setRoast('Break is over. WAKE UP.', true);
          document.title = '⚠️ WAKE UP!';
          TG.setStatus('READY');
        }
      }
    }, 1000);
  };

}());
