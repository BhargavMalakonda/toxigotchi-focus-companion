/**
 * pet.js
 * ------
 * Virtual pet state, health tracking, and health-bar UI updates.
 *
 * Exposes on window.ToxiGotchi:
 *   - petHealth            Current HP (0–100)
 *   - updateHealthUI()     Sync health bar to petHealth value
 */

(function () {
  'use strict';

  const TG = window.ToxiGotchi;

  // Initial pet health
  TG.petHealth = 100;

  // DOM references (resolved lazily on first call so this file is
  // safe to load before DOMContentLoaded)
  var _healthBar;
  var _healthText;
  var _healthLabelPct;

  function resolveDOM() {
    if (!_healthBar) {
      _healthBar      = document.getElementById('health-bar');
      _healthText     = document.getElementById('health-text');
      _healthLabelPct = document.getElementById('health-label-pct');
    }
  }

  /**
   * Sync the health bar width, text, and colour to TG.petHealth.
   */
  TG.updateHealthUI = function () {
    resolveDOM();

    _healthBar.style.width       = TG.petHealth + '%';
    _healthText.textContent      = TG.petHealth + ' / 100 HP';
    _healthLabelPct.textContent  = TG.petHealth + '%';

    if (TG.petHealth > 50) {
      _healthBar.style.backgroundColor = '#00ff00';
    } else if (TG.petHealth > 20) {
      _healthBar.style.backgroundColor = '#ffff00';
    } else {
      _healthBar.style.backgroundColor = '#ff0000';
    }
  };

}());
