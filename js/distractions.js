/**
 * distractions.js
 * ---------------
 * Tab-visibility detection, fail-state logic, ransomware/apology
 * mode, and mobile vibration feedback.
 *
 * Depends on (must be loaded before this file):
 *   - js/pet.js        (updateHealthUI, petHealth)
 *   - js/timer.js      (isTimerRunning, isBreakTime, isGameOver,
 *                       timerInterval, vibrationInterval, setRoast,
 *                       setStatus, formatTime, timeLeft, focusDuration,
 *                       updateTracker)
 *   - js/firestore.js  (trackDistraction)
 *
 * Exposes on window.ToxiGotchi:
 *   - isHostageMode
 *   - vibrationInterval
 *   - triggerFailState()
 *   - enableRansomwareMode()
 */

(function () {
  'use strict';

  const TG = window.ToxiGotchi;

  TG.isHostageMode    = false;
  TG.vibrationInterval = null;

  // ── Visibility-change listener (tab switch detection) ──────────
  document.addEventListener('visibilitychange', function () {
    if (TG.isGameOver) return;
    if (document.hidden && TG.isTimerRunning && !TG.isBreakTime) {
      TG.triggerFailState();
    }
  });

  // ── Give Up button wired here (needs triggerFailState) ─────────
  document.addEventListener('DOMContentLoaded', function () {
    var giveUpBtn  = document.getElementById('give-up-btn');
    var apologyInput = document.getElementById('apology-input');
    var startBtn   = document.getElementById('start-btn');

    if (giveUpBtn) {
      giveUpBtn.addEventListener('click', function () {
        if (TG.isTimerRunning) TG.triggerFailState();
      });
    }

    // ── Runaway Start button (ransomware mode) ──────────────────
    if (startBtn) {
      startBtn.addEventListener('mouseover', function () {
        if (!TG.isHostageMode) return;

        var MARGIN = 60;
        var maxX   = window.innerWidth  - startBtn.offsetWidth  - MARGIN;
        var maxY   = window.innerHeight - startBtn.offsetHeight - MARGIN;
        var randX  = Math.floor(Math.random() * maxX) + MARGIN / 2;
        var randY  = Math.floor(Math.random() * maxY) + MARGIN / 2;

        startBtn.style.left = randX + 'px';
        startBtn.style.top  = randY + 'px';
      });
    }

    // ── Apology input listener ──────────────────────────────────
    if (apologyInput) {
      apologyInput.addEventListener('input', function () {
        if (TG.isGameOver) return;

        var raw        = apologyInput.value.trim();
        var words      = raw.length ? raw.split(/\s+/) : [];
        var count      = words.length;
        var hasKeyword = raw.toLowerCase().includes('sorry')     ||
                         raw.toLowerCase().includes('apologize') ||
                         raw.toLowerCase().includes('mistake');

        if (count < 15) {
          TG.setRoast(
            'Keep typing. I need at least 15 words. You only have ' + count + '.',
            true
          );
          return;
        }

        if (!hasKeyword) {
          TG.setRoast('Are you even sorry? I don\'t see "sorry" or "apologize".', true);
          return;
        }

        // Apology accepted — release ransomware mode
        TG.isHostageMode = false;

        clearInterval(TG.vibrationInterval);
        TG.vibrationInterval = null;
        if ('vibrate' in navigator) navigator.vibrate(0);

        startBtn.classList.remove('runaway-btn');
        startBtn.style.position = 'static';
        startBtn.style.left     = '';
        startBtn.style.top      = '';

        apologyInput.style.display = 'none';
        apologyInput.value         = '';
        document.body.classList.remove('shake-screen');

        var petImage = document.getElementById('pet-image');
        if (petImage) {
          petImage.innerText = '🐕';
          petImage.className = '';
        }

        TG.isBreakTime = false;
        TG.timeLeft    = TG.focusDuration;
        var timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) timerDisplay.textContent = TG.formatTime(TG.timeLeft);

        TG.updateTracker();
        TG.setRoast('Fine. Apology accepted. Get back to work.');
        TG.setStatus('IDLE');
      });
    }
  });

  // ── Fail state ─────────────────────────────────────────────────
  TG.triggerFailState = function () {
    var timerDisplay = document.getElementById('timer-display');
    var petImage     = document.getElementById('pet-image');
    var startBtn     = document.getElementById('start-btn');
    var giveUpBtn    = document.getElementById('give-up-btn');
    var goalInput    = document.getElementById('goal-input');
    var streakCounter = document.getElementById('streak-counter');

    clearInterval(TG.timerInterval);
    TG.isTimerRunning = false;

    TG.petHealth = Math.max(0, TG.petHealth - 25);
    TG.updateHealthUI();

    // ── Game Over ──────────────────────────────────────────────
    if (TG.petHealth === 0) {
      TG.isGameOver = true;

      clearInterval(TG.vibrationInterval);
      TG.vibrationInterval = null;
      if ('vibrate' in navigator) navigator.vibrate(0);

      document.body.classList.remove('shake-screen');
      var apologyInput = document.getElementById('apology-input');
      if (apologyInput) {
        apologyInput.style.display = 'none';
        apologyInput.value         = '';
      }
      if (startBtn) {
        startBtn.classList.remove('runaway-btn');
        startBtn.style.position = 'static';
      }
      TG.isHostageMode = false;

      if (petImage)      { petImage.innerText = '🦴'; petImage.className = ''; }
      if (streakCounter) streakCounter.innerHTML = '<span class="fire">🔥</span> 0 Day Streak';

      TG.setRoast('You killed it. Game Over.', true);
      TG.setStatus('GAME OVER');
      if (startBtn) {
        startBtn.textContent = '💀 Restart from Scratch';
        startBtn.disabled    = false;
      }
      if (giveUpBtn) giveUpBtn.disabled = true;
      if (timerDisplay) {
        timerDisplay.classList.remove('danger');
        timerDisplay.textContent = TG.formatTime(TG.timeLeft);
      }
      return;
    }

    // ── Non-fatal fail ─────────────────────────────────────────
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
      TG.vibrationInterval = setInterval(function () {
        navigator.vibrate([300, 100, 300, 100, 500]);
      }, 1300);
    }

    document.body.classList.add('shake-screen');
    if (petImage) { petImage.innerText = '🐺'; petImage.className = 'angry'; }

    var goal = goalInput ? goalInput.value.trim() : '';
    var roastMsg = goal
      ? 'Wow. You couldn\'t even focus enough to "' + goal + '"? Pathetic.'
      : 'Wow. A goldfish has better focus. Type an apology.';
    TG.setRoast(roastMsg, true);
    TG.setStatus('FAILURE');

    if (giveUpBtn)    giveUpBtn.disabled    = true;
    if (startBtn)     startBtn.disabled     = false;
    if (timerDisplay) {
      timerDisplay.classList.remove('danger');
      timerDisplay.textContent = TG.formatTime(TG.timeLeft);
    }

    TG.enableRansomwareMode();
    TG.trackDistraction();
  };

  // ── Ransomware mode ────────────────────────────────────────────
  TG.enableRansomwareMode = function () {
    var apologyInput = document.getElementById('apology-input');
    var startBtn     = document.getElementById('start-btn');

    TG.isHostageMode = true;

    if (apologyInput) {
      apologyInput.style.display = 'block';
      apologyInput.value         = '';
      apologyInput.focus();
    }
    if (startBtn) {
      startBtn.classList.add('runaway-btn');
      startBtn.style.position = 'absolute';
    }
  };

}());
