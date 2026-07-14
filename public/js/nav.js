/**
 * nav.js — Navigation Menu Module
 *
 * Manages hamburger menu open/close behaviour, including:
 *   - Click handlers for .hamburger, .nav-close, and .nav-overlay
 *   - Aria attribute management (aria-expanded, aria-hidden)
 *   - Keyboard: Escape key closes the nav when open
 *   - Focus trapping within the nav menu when open
 */

'use strict';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns all focusable elements within the given container.
 * @param {HTMLElement} container
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

// Keeps a reference to the element that was focused before the nav opened,
// so focus can be restored when the nav closes.
var _previouslyFocused = null;

// Bound event handler references so they can be removed cleanly.
var _keydownHandler = null;

// ---------------------------------------------------------------------------
// Open / Close
// ---------------------------------------------------------------------------

/**
 * Opens the nav menu.
 * - Sets aria-hidden="false" on .nav-menu and .nav-overlay
 * - Sets aria-expanded="true" on .hamburger
 * - Traps focus inside .nav-menu
 * - Closes when Escape is pressed
 */
function openNav() {
  var navMenu    = document.querySelector('.nav-menu');
  var navOverlay = document.querySelector('.nav-overlay');
  var hamburger  = document.querySelector('.hamburger');

  if (!navMenu || !navOverlay || !hamburger) { return; }

  // Update aria attributes
  navMenu.setAttribute('aria-hidden', 'false');
  navOverlay.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');

  // Remember what had focus before opening
  _previouslyFocused = document.activeElement;

  // Move focus into the nav (to the close button or first focusable element)
  var focusable = getFocusableElements(navMenu);
  if (focusable.length > 0) {
    focusable[0].focus();
  }

  // Attach keyboard handler for Escape key and focus trap
  _keydownHandler = function (event) {
    if (event.key === 'Escape') {
      closeNav();
      return;
    }

    // Focus trap: keep Tab / Shift+Tab cycling within the nav
    if (event.key === 'Tab') {
      var focusableNow = getFocusableElements(navMenu);
      if (focusableNow.length === 0) {
        event.preventDefault();
        return;
      }

      var first = focusableNow[0];
      var last  = focusableNow[focusableNow.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: if focus is on the first element, wrap to last
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if focus is on the last element, wrap to first
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  };

  document.addEventListener('keydown', _keydownHandler);
}

/**
 * Closes the nav menu.
 * - Sets aria-hidden="true" on .nav-menu and .nav-overlay
 * - Sets aria-expanded="false" on .hamburger
 * - Restores focus to the element that was active before the nav opened
 */
function closeNav() {
  var navMenu    = document.querySelector('.nav-menu');
  var navOverlay = document.querySelector('.nav-overlay');
  var hamburger  = document.querySelector('.hamburger');

  if (!navMenu || !navOverlay || !hamburger) { return; }

  // Update aria attributes
  navMenu.setAttribute('aria-hidden', 'true');
  navOverlay.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');

  // Remove keyboard handler
  if (_keydownHandler) {
    document.removeEventListener('keydown', _keydownHandler);
    _keydownHandler = null;
  }

  // Restore focus to the element that was focused before the nav opened
  if (_previouslyFocused && typeof _previouslyFocused.focus === 'function') {
    _previouslyFocused.focus();
  }
  _previouslyFocused = null;
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Attaches event listeners for the hamburger nav menu.
 * Should be called once on DOMContentLoaded.
 *
 * - Clicking .hamburger  → openNav()
 * - Clicking .nav-close  → closeNav()
 * - Clicking .nav-overlay → closeNav()
 */
function initNav() {
  var hamburger  = document.querySelector('.hamburger');
  var navClose   = document.querySelector('.nav-close');
  var navOverlay = document.querySelector('.nav-overlay');

  if (hamburger) {
    hamburger.addEventListener('click', openNav);
  }

  if (navClose) {
    navClose.addEventListener('click', closeNav);
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }
}

// ---------------------------------------------------------------------------
// Expose on window (for plain <script> tags in HTML pages)
// ---------------------------------------------------------------------------

window.initNav  = initNav;
window.openNav  = openNav;
window.closeNav = closeNav;
