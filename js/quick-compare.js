// Quick comparison tool
(function() {
  'use strict';

  class QuickCompare {
    constructor() {
      this.selectedApps = [];
      this.maxApps = 2;
      this.init();
    }

    init() {
      this.createCompareInterface();
      this.bindEvents();
    }

    createCompareInterface() {
      const hero = document.querySelector('.hero');
      if (!hero) return;

      const compareHTML = `
        <div class="quick-compare">
          <h3>Quick Compare</h3>
          <div class="compare-slots">
            <div class="compare-slot" data-slot="0">
              <span class="slot-label">Select App 1</span>
              <button class="slot-clear" style="display: none;">&times;</button>
            </div>
            <div class="compare-vs">VS</div>
            <div class="compare-slot" data-slot="1">
              <span class="slot-label">Select App 2</span>
              <button class="slot-clear" style="display: none;">&times;</button>
            </div>
          </div>
          <button class="btn primary compare-btn" disabled>Compare Now</button>
        </div>
      `;

      const compareElement = document.createElement('div');
      compareElement.innerHTML = compareHTML;
      hero.parentNode.insertBefore(compareElement.firstElementChild, hero.nextSibling);
    }

    bindEvents() {
      // Add compare buttons to cards
      document.querySelectorAll('.card').forEach(card => {
        const titleElement = card.querySelector('h3 a');
        if (!titleElement) return;

        const compareBtn = document.createElement('button');
        compareBtn.className = 'card-compare-btn';
        compareBtn.textContent = '+';
        compareBtn.title = 'Add to comparison';
        
        compareBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleApp(titleElement.textContent.trim(), titleElement.href);
        });

        card.appendChild(compareBtn);
      });

      // Clear slot buttons
      document.querySelectorAll('.slot-clear').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const slot = parseInt(e.target.closest('.compare-slot').dataset.slot);
          this.removeApp(slot);
        });
      });

      // Compare button
      document.querySelector('.compare-btn')?.addEventListener('click', () => {
        this.performComparison();
      });
    }

    toggleApp(name, url) {
      const existingIndex = this.selectedApps.findIndex(app => app.name === name);
      
      if (existingIndex !== -1) {
        this.removeApp(existingIndex);
      } else if (this.selectedApps.length < this.maxApps) {
        this.addApp(name, url);
      } else {
        // Replace oldest app
        this.removeApp(0);
        this.addApp(name, url);
      }
    }

    addApp(name, url) {
      this.selectedApps.push({ name, url });
      this.updateUI();
    }

    removeApp(index) {
      this.selectedApps.splice(index, 1);
      this.updateUI();
    }

    updateUI() {
      const slots = document.querySelectorAll('.compare-slot');
      const compareBtn = document.querySelector('.compare-btn');
      
      slots.forEach((slot, index) => {
        const label = slot.querySelector('.slot-label');
        const clearBtn = slot.querySelector('.slot-clear');
        
        if (this.selectedApps[index]) {
          label.textContent = this.selectedApps[index].name;
          clearBtn.style.display = 'block';
          slot.classList.add('filled');
        } else {
          label.textContent = `Select App ${index + 1}`;
          clearBtn.style.display = 'none';
          slot.classList.remove('filled');
        }
      });

      // Update compare button
      compareBtn.disabled = this.selectedApps.length !== 2;
      
      // Update card buttons
      document.querySelectorAll('.card-compare-btn').forEach(btn => {
        const card = btn.closest('.card');
        const titleElement = card.querySelector('h3 a');
        const appName = titleElement.textContent.trim();
        const isSelected = this.selectedApps.some(app => app.name === appName);
        
        btn.classList.toggle('active', isSelected);
        btn.textContent = isSelected ? '✓' : '+';
        btn.title = isSelected ? 'Remove from comparison' : 'Add to comparison';
      });
    }

    performComparison() {
      if (this.selectedApps.length !== 2) return;

      // Create comparison URL
      const app1Slug = this.getSlugFromUrl(this.selectedApps[0].url);
      const app2Slug = this.getSlugFromUrl(this.selectedApps[1].url);
      
      const comparisonUrl = `/comparisons/${app1Slug}-vs-${app2Slug}/`;
      
      // Check if comparison exists, otherwise show modal
      this.checkComparisonExists(comparisonUrl);
    }

    getSlugFromUrl(url) {
      const match = url.match(/\/reviews\/(.+)-review\//);
      return match ? match[1] : '';
    }

    checkComparisonExists(url) {
      fetch(url, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            window.location.href = url;
          } else {
            this.showComparisonPreview();
          }
        })
        .catch(() => {
          this.showComparisonPreview();
        });
    }

    showComparisonPreview() {
      const modal = document.createElement('div');
      modal.className = 'comparison-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <h3>Quick Comparison</h3>
          <div class="comparison-preview">
            <div class="app-preview">
              <h4>${this.selectedApps[0].name}</h4>
              <a href="${this.selectedApps[0].url}" class="btn ghost">View Review</a>
            </div>
            <div class="vs-divider">VS</div>
            <div class="app-preview">
              <h4>${this.selectedApps[1].name}</h4>
              <a href="${this.selectedApps[1].url}" class="btn ghost">View Review</a>
            </div>
          </div>
          <p>Detailed comparison coming soon. For now, check individual reviews.</p>
          <button class="btn primary modal-close">Close</button>
        </div>
      `;

      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';

      // Close modal
      modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          document.body.style.overflow = '';
        }
      });
    }
  }

  // Initialize when DOM is ready
  function init() {
    if (document.querySelector('.cards')) {
      new QuickCompare();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();