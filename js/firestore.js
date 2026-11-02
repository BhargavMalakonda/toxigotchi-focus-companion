/**
 * firestore.js
 * ------------
 * All Firestore reads, writes, and data synchronization.
 * Handles user creation, streak management, distraction tracking,
 * focus-completion tracking, and leaderboard loading.
 *
 * Depends on (must be loaded before this file):
 *   - Firebase compat CDN scripts (firebase-app, firebase-auth,
 *                                  firebase-firestore)
 *   - js/config/firebase-config.js
 *
 * Exposes on window.ToxiGotchi:
 *   - db                  Firestore instance
 *   - userData            Current user's Firestore document data
 *   - initializeUser(user)
 *   - trackDistraction()
 *   - trackFocusCompletion()
 *   - loadLeaderboards()
 */

(function () {
  'use strict';

  const TG = window.ToxiGotchi;

  // Firestore instance
  TG.db = firebase.firestore();

  // ── User initialization ────────────────────────────────────────
  TG.initializeUser = async function (user) {
    const userRef = TG.db.collection('users').doc(user.uid);
    const doc     = await userRef.get();

    if (!doc.exists) {
      // First-time user — create their document
      TG.userData = {
        name:              user.displayName,
        email:             user.email,
        xp:                0,
        distractions:      0,
        sessionsCompleted: 0,
        streak:            0,
        lastActive:        null,
        createdAt:         new Date().toISOString()
      };
      await userRef.set(TG.userData);
    } else {
      TG.userData = doc.data();
      await TG.checkAndResetStreak(user);
    }

    TG.updateUI();
  };

  // ── Streak staleness check ─────────────────────────────────────
  TG.checkAndResetStreak = async function (user) {
    if (!TG.userData.lastActive) return;

    const lastActiveDate = new Date(TG.userData.lastActive);
    const today          = new Date();

    lastActiveDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = (today - lastActiveDate) / (1000 * 60 * 60 * 24);

    if (diffDays > 1) {
      const userRef = TG.db.collection('users').doc(user.uid);
      await userRef.update({ streak: 0 });
      TG.userData.streak = 0;
    }
  };

  // ── Distraction tracking ───────────────────────────────────────
  TG.trackDistraction = async function () {
    if (!TG.currentUser || !TG.userData) return;

    try {
      const userRef = TG.db.collection('users').doc(TG.currentUser.uid);
      await userRef.update({
        distractions: firebase.firestore.FieldValue.increment(1),
        xp:           firebase.firestore.FieldValue.increment(-50)
      });

      TG.userData.distractions = (TG.userData.distractions || 0) + 1;
      TG.userData.xp           = Math.max(0, (TG.userData.xp || 0) - 50);

      const userXpSpan = document.getElementById('user-xp');
      if (userXpSpan) userXpSpan.textContent = TG.userData.xp;

      TG.loadLeaderboards();
    } catch (error) {
      console.error('Error tracking distraction:', error);
    }
  };

  // ── Focus-session completion ───────────────────────────────────
  TG.trackFocusCompletion = async function () {
    if (!TG.currentUser || !TG.userData) return;

    try {
      const userRef = TG.db.collection('users').doc(TG.currentUser.uid);
      const today   = new Date();
      today.setHours(0, 0, 0, 0);

      let streakUpdate = 1;

      if (TG.userData.lastActive) {
        const lastActive  = new Date(TG.userData.lastActive);
        lastActive.setHours(0, 0, 0, 0);

        if (lastActive.getTime() === today.getTime()) {
          streakUpdate = 0; // Already active today
        } else {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastActive.getTime() !== yesterday.getTime()) {
            // Not consecutive — reset to 1
            streakUpdate     = 1;
            TG.userData.streak = 0;
          }
        }
      }

      const newStreak = streakUpdate === 1
        ? (TG.userData.streak || 0) + 1
        : TG.userData.streak;

      await userRef.update({
        xp:                firebase.firestore.FieldValue.increment(100),
        sessionsCompleted: firebase.firestore.FieldValue.increment(1),
        streak:            newStreak,
        lastActive:        new Date().toISOString()
      });

      TG.userData.xp                = (TG.userData.xp || 0) + 100;
      TG.userData.sessionsCompleted = (TG.userData.sessionsCompleted || 0) + 1;
      TG.userData.streak            = newStreak;
      TG.userData.lastActive        = new Date().toISOString();

      // Refresh streak UI
      const userXpSpan     = document.getElementById('user-xp');
      const userStreakSpan  = document.getElementById('user-streak');
      const streakCounter   = document.getElementById('streak-counter');
      const streakWidgetBody = document.getElementById('streak-widget-body');

      if (userXpSpan)    userXpSpan.textContent    = TG.userData.xp;
      if (userStreakSpan) userStreakSpan.textContent = TG.userData.streak;
      if (streakCounter)  streakCounter.innerHTML   =
        `<span class="fire">🔥</span> ${TG.userData.streak} Day Streak`;
      if (streakWidgetBody) streakWidgetBody.innerHTML =
        `You're on a <strong>${TG.userData.streak}-day streak</strong>. Complete a focus session today to keep it alive.`;

      TG.loadLeaderboards();
    } catch (error) {
      console.error('Error tracking focus completion:', error);
    }
  };

  // ── Leaderboard loading ────────────────────────────────────────
  TG.loadLeaderboards = async function () {
    try {
      // Global Shame board — sorted by most distractions
      const shameSnapshot = await TG.db.collection('users')
        .orderBy('distractions', 'desc')
        .limit(10)
        .get();

      let shameHTML = '';
      let rank      = 1;

      shameSnapshot.forEach(function (doc) {
        const data          = doc.data();
        const isCurrentUser = TG.currentUser && doc.id === TG.currentUser.uid;
        const rowClass      = isCurrentUser ? 'shame-table__row--top' : '';

        let sentence = '✓ Acceptable';
        if      (data.distractions >= 50) sentence = '☠ Chronically Distracted';
        else if (data.distractions >= 30) sentence = '☠ Weakest Link';
        else if (data.distractions >= 10) sentence = '⚠️ Needs Improvement';
        else if (data.distractions >= 5)  sentence = '🤔 Getting Distracted';

        shameHTML +=
          `<tr class="shame-table__row ${rowClass}">` +
            `<td class="shame-table__rank">${String(rank).padStart(2, '0')}</td>` +
            `<td class="shame-table__name">${data.name} ${isCurrentUser ? '(You)' : ''}</td>` +
            `<td class="shame-table__count">${data.distractions || 0}</td>` +
            `<td class="shame-table__badge shame-table__badge--bad">${sentence}</td>` +
          `</tr>`;
        rank++;
      });

      const globalBody = document.getElementById('global-leaderboard-body');
      if (globalBody) globalBody.innerHTML = shameHTML;

      // Friends Weekly board — sorted by XP
      const xpSnapshot = await TG.db.collection('users')
        .orderBy('xp', 'desc')
        .limit(10)
        .get();

      let xpHTML = '';
      rank       = 1;

      xpSnapshot.forEach(function (doc) {
        const data          = doc.data();
        const isCurrentUser = TG.currentUser && doc.id === TG.currentUser.uid;
        const rowClass      = (isCurrentUser || rank === 1)
          ? 'friends-table__row--gold'
          : '';

        let title = '— Trying';
        if      (data.xp >= 10000) title = '⚡ Focus God';
        else if (data.xp >= 5000)  title = '🔥 Focus Master';
        else if (data.xp >= 1000)  title = '✨ Focus Apprentice';
        else if (data.xp >= 100)   title = '🌱 Getting Started';

        const badgeClass = data.xp >= 1000
          ? 'friends-table__badge--god'
          : 'friends-table__badge--neutral';

        xpHTML +=
          `<tr class="friends-table__row ${rowClass}">` +
            `<td class="friends-table__rank">${String(rank).padStart(2, '0')}</td>` +
            `<td class="friends-table__name">${data.name} ${isCurrentUser ? '(You)' : ''}</td>` +
            `<td class="friends-table__score friends-table__score--pos">${(data.xp || 0).toLocaleString()} XP</td>` +
            `<td class="friends-table__badge ${badgeClass}">${title}</td>` +
          `</tr>`;
        rank++;
      });

      const friendsBody = document.getElementById('friends-leaderboard-body');
      if (friendsBody) friendsBody.innerHTML = xpHTML;

    } catch (error) {
      console.error('Error loading leaderboards:', error);
    }
  };

}());
