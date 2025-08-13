// Advanced search and filtering system
(function() {
  'use strict';

  class SearchSystem {
    constructor() {
      this.data = [];
      this.filters = {
        category: 'all',
        price: 'all',
        rating: 'all',
        features: []
      };
      this.searchTerm = '';
      this.init();
    }

    init() {
      this.collectData();
      this.createSearchInterface();
      this.bindEvents();
    }

    collectData() {
      // Collect all review data from page
      const cards = document.querySelectorAll('.card');
      
      cards.forEach(card => {
        const titleElement = card.querySelector('h3 a');
        const ratingElement = card.querySelector('.meta span:nth-child(2)');
        const priceElement = card.querySelector('.meta span:nth-child(3)');
        const descElement = card.querySelector('.lead');
        
        if (titleElement) {
          this.data.push({
            element: card,
            title: titleElement.textContent.trim(),
            url: titleElement.href,
            rating: ratingElement ? parseInt(ratingElement.textContent) : 0,
            price: priceElement ? priceElement.textContent.trim() : '',
            description: descElement ? descElement.textContent.trim() : '',
            category: this.extractCategory(card),
            features: this.extractFeatures(card)
          });
        }
      });
    }

    extractCategory(card) {
      const text = card.textContent.toLowerCase();
      if (text.includes('nsfw') || text.includes('adult')) return 'nsfw';
      if (text.includes('sfw') || text.includes('safe')) return 'sfw';
      if (text.includes('voice') || text.includes('chat')) return 'voice';
      if (text.includes('mobile') || text.includes('app')) return 'mobile';
      return 'general';
    }

    extractFeatures(card) {
      const features = [];
      const text = card.textContent.toLowerCase();
      
      if (text.includes('free')) features.push('free');
      if (text.includes('voice')) features.push('voice');
      if (text.includes('nsfw')) features.push('nsfw');
      if (text.includes('roleplay')) features.push('roleplay');
      if (text.includes('memory')) features.push('memory');
      
      return features;
    }

    createSearchInterface() {
      const container = document.querySelector('.hero') || document.querySelector('main');
      if (!container) return;

      const searchHTML = `
        <div class="search-system">
          <div class="search-container">
            <div class="search-input-wrapper">
              <input type="text" 
                     id="ai-search" 
                     placeholder="Search AI apps..." 
                     class="search-input"
                     autocomplete="off">
              <button class="search-clear" id="search-clear" aria-label="Clear search">×</button>
            </div>
            <button class="filter-toggle" id="filter-toggle" aria-label="Toggle filters">
              <span>Filters</span>
              <svg width="12" height="8" viewBox="0 0 12 8">
                <path d="m1 1 5 5 5-5" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      const searchElement = document.createElement('div');
      searchElement.innerHTML = searchHTML;
      container.insertBefore(searchElement.firstElementChild, container.firstElementChild.nextSibling);
    }

    bindEvents() {
      const searchInput = document.getElementById('ai-search');
      const clearButton = document.getElementById('search-clear');
      
      // Search input with debounce
      let searchTimeout;
      searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchTerm = e.target.value.toLowerCase();
          this.applyFilters();
        }, 300);
      });

      // Clear search
      clearButton?.addEventListener('click', () => {
        searchInput.value = '';
        this.searchTerm = '';
        this.applyFilters();
      });
    }

    applyFilters() {
      let filteredData = [...this.data];

      // Text search
      if (this.searchTerm) {
        filteredData = filteredData.filter(item => 
          item.title.toLowerCase().includes(this.searchTerm) ||
          item.description.toLowerCase().includes(this.searchTerm)
        );
      }

      this.displayResults(filteredData);
    }

    displayResults(results) {
      // Hide all cards first
      this.data.forEach(item => {
        item.element.style.display = 'none';
        item.element.classList.remove('search-highlight');
      });

      // Show filtered results
      results.forEach(item => {
        item.element.style.display = 'block';
        
        // Highlight search terms
        if (this.searchTerm) {
          item.element.classList.add('search-highlight');
        }
      });

      // Show no results message
      this.toggleNoResults(results.length === 0);
    }

    toggleNoResults(show) {
      let noResultsEl = document.querySelector('.no-results-message');
      
      if (show && !noResultsEl) {
        noResultsEl = document.createElement('div');
        noResultsEl.className = 'no-results-message card';
        noResultsEl.innerHTML = `
          <div style="text-align: center; padding: 2rem;">
            <h3>No results found</h3>
            <p class="lead">Try adjusting your search terms</p>
          </div>
        `;
        
        const cardsContainer = document.querySelector('.cards');
        if (cardsContainer) {
          cardsContainer.appendChild(noResultsEl);
        }
      } else if (!show && noResultsEl) {
        noResultsEl.remove();
      }
    }

    resetFilters() {
      this.searchTerm = '';
      document.getElementById('ai-search').value = '';
      this.applyFilters();
    }
  }

  // Initialize search system when DOM is ready
  function initSearchSystem() {
    if (document.querySelector('.cards')) {
      window.SearchSystem = new SearchSystem();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchSystem);
  } else {
    initSearchSystem();
  }
})();