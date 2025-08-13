// Accessibility and theme utilities
(function() {
  'use strict';

  class AccessibilityManager {
    constructor() {
      this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = localStorage.getItem('theme') || (this.prefersDark ? 'dark' : 'light');
      this.highContrast = localStorage.getItem('highContrast') === 'true';
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      this.init();
    }

    init() {
      this.createAccessibilityPanel();
      this.applyTheme();
      this.setupKeyboardNavigation();
      this.setupFocusManagement();
      this.setupReducedMotion();
      this.bindEvents();
    }

    createAccessibilityPanel() {
      const panel = document.createElement('div');
      panel.className = 'accessibility-panel';
      panel.innerHTML = `
        <button class="accessibility-toggle" aria-label="Accessibility options">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
        <div class="accessibility-menu">
          <h3>Accessibility Options</h3>
          
          <div class="option-group">
            <label>Theme</label>
            <div class="theme-selector">
              <button class="theme-btn" data-theme="light">☀️ Light</button>
              <button class="theme-btn" data-theme="dark">🌙 Dark</button>
              <button class="theme-btn" data-theme="auto">🔄 Auto</button>
            </div>
          </div>
          
          <div class="option-group">
            <label class="option-label">
              <input type="checkbox" class="high-contrast-toggle">
              <span>High Contrast</span>
            </label>
          </div>
          
          <div class="option-group">
            <label class="option-label">
              <input type="checkbox" class="large-text-toggle">
              <span>Larger Text</span>
            </label>
          </div>
          
          <div class="option-group">
            <label class="option-label">
              <input type="checkbox" class="reduced-motion-toggle">
              <span>Reduce Motion</span>
            </label>
          </div>
          
          <div class="option-group">
            <button class="btn ghost reset-preferences">Reset to Defaults</button>
          </div>
        </div>
      `;

      document.body.appendChild(panel);
    }

    bindEvents() {
      const toggle = document.querySelector('.accessibility-toggle');
      const menu = document.querySelector('.accessibility-menu');
      const themeButtons = document.querySelectorAll('.theme-btn');
      const highContrastToggle = document.querySelector('.high-contrast-toggle');
      const largeTextToggle = document.querySelector('.large-text-toggle');
      const reducedMotionToggle = document.querySelector('.reduced-motion-toggle');
      const resetButton = document.querySelector('.reset-preferences');

      // Toggle accessibility menu
      toggle?.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.accessibility-panel')) {
          menu.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });

      // Theme selection
      themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const theme = btn.dataset.theme;
          this.setTheme(theme);
          this.updateThemeButtons();
        });
      });

      // High contrast toggle
      highContrastToggle?.addEventListener('change', (e) => {
        this.setHighContrast(e.target.checked);
      });

      // Large text toggle
      largeTextToggle?.addEventListener('change', (e) => {
        this.setLargeText(e.target.checked);
      });

      // Reduced motion toggle
      reducedMotionToggle?.addEventListener('change', (e) => {
        this.setReducedMotion(e.target.checked);
      });

      // Reset preferences
      resetButton?.addEventListener('click', () => {
        this.resetPreferences();
      });

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentTheme === 'auto') {
          this.applyTheme();
        }
      });

      // Update UI state
      this.updateUI();
    }

    setTheme(theme) {
      this.currentTheme = theme;
      localStorage.setItem('theme', theme);
      this.applyTheme();
    }

    applyTheme() {
      const body = document.body;
      let actualTheme = this.currentTheme;

      if (actualTheme === 'auto') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      body.className = body.className.replace(/theme-\w+/g, '');
      body.classList.add(`theme-${actualTheme}`);
    }

    setHighContrast(enabled) {
      this.highContrast = enabled;
      localStorage.setItem('highContrast', enabled);
      document.body.classList.toggle('high-contrast', enabled);
    }

    setLargeText(enabled) {
      localStorage.setItem('largeText', enabled);
      document.body.classList.toggle('large-text', enabled);
    }

    setReducedMotion(enabled) {
      localStorage.setItem('reducedMotion', enabled);
      document.body.classList.toggle('reduced-motion', enabled);
    }

    setupKeyboardNavigation() {
      // Skip to main content link
      const skipLink = document.createElement('a');
      skipLink.href = '#main';
      skipLink.className = 'skip-to-main';
      skipLink.textContent = 'Skip to main content';
      document.body.insertBefore(skipLink, document.body.firstChild);

      // Add main landmark if not present
      const main = document.querySelector('main');
      if (main && !main.id) {
        main.id = 'main';
      }

      // Enhance keyboard navigation for interactive elements
      document.addEventListener('keydown', (e) => {
        // Escape key handling
        if (e.key === 'Escape') {
          // Close any open modals or menus
          document.querySelectorAll('.accessibility-menu.open').forEach(menu => {
            menu.classList.remove('open');
          });
          
          // Remove focus from search inputs
          if (document.activeElement?.tagName === 'INPUT') {
            document.activeElement.blur();
          }
        }

        // Arrow key navigation for card grids
        if (e.target.closest('.cards') && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          this.handleCardNavigation(e);
        }
      });
    }

    handleCardNavigation(e) {
      const cards = Array.from(document.querySelectorAll('.card a, .card button'));
      const currentIndex = cards.indexOf(document.activeElement);
      
      if (currentIndex === -1) return;

      let nextIndex;
      const cardsPerRow = Math.floor(window.innerWidth / 300); // Approximate cards per row

      switch (e.key) {
        case 'ArrowRight':
          nextIndex = Math.min(currentIndex + 1, cards.length - 1);
          break;
        case 'ArrowLeft':
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'ArrowDown':
          nextIndex = Math.min(currentIndex + cardsPerRow, cards.length - 1);
          break;
        case 'ArrowUp':
          nextIndex = Math.max(currentIndex - cardsPerRow, 0);
          break;
      }

      if (nextIndex !== undefined && cards[nextIndex]) {
        e.preventDefault();
        cards[nextIndex].focus();
      }
    }

    setupFocusManagement() {
      // Focus indicators
      document.addEventListener('keydown', () => {
        document.body.classList.add('keyboard-navigation');
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
      });

      // Focus trap for modals
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          const modal = document.querySelector('.comparison-modal');
          if (modal) {
            this.trapFocus(e, modal);
          }
        }
      });
    }

    trapFocus(e, container) {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }

    setupReducedMotion() {
      if (this.reducedMotion || localStorage.getItem('reducedMotion') === 'true') {
        document.body.classList.add('reduced-motion');
      }
    }

    updateUI() {
      // Update theme buttons
      this.updateThemeButtons();
      
      // Update checkboxes
      const highContrastToggle = document.querySelector('.high-contrast-toggle');
      const largeTextToggle = document.querySelector('.large-text-toggle');
      const reducedMotionToggle = document.querySelector('.reduced-motion-toggle');
      
      if (highContrastToggle) {
        highContrastToggle.checked = this.highContrast;
      }
      
      if (largeTextToggle) {
        largeTextToggle.checked = localStorage.getItem('largeText') === 'true';
      }
      
      if (reducedMotionToggle) {
        reducedMotionToggle.checked = localStorage.getItem('reducedMotion') === 'true';
      }
    }

    updateThemeButtons() {
      document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
      });
    }

    resetPreferences() {
      // Clear localStorage
      localStorage.removeItem('theme');
      localStorage.removeItem('highContrast');
      localStorage.removeItem('largeText');
      localStorage.removeItem('reducedMotion');

      // Reset to defaults
      this.currentTheme = this.prefersDark ? 'dark' : 'light';
      this.highContrast = false;

      // Remove classes
      document.body.classList.remove('high-contrast', 'large-text', 'reduced-motion');
      
      // Reapply theme
      this.applyTheme();
      
      // Update UI
      this.updateUI();
    }
  }

  // Initialize accessibility manager
  function init() {
    new AccessibilityManager();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();