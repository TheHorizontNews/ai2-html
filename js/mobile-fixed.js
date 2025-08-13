// Fixed Mobile JavaScript - No extra features
(function() {
  'use strict';

  // Simple mobile navigation
  function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    
    if (!navToggle || !nav) return;

    // Add enhanced burger structure  
    const line = document.createElement('span');
    line.className = 'nav-toggle__line';
    navToggle.innerHTML = '';
    navToggle.appendChild(line);

    navToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      
      // Prevent scrolling when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (document.body.classList.contains('nav-open') &&
          !nav.contains(e.target) && 
          !navToggle.contains(e.target)) {
        document.body.classList.remove('nav-open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // Simple scroll handler for header
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const hdr = document.querySelector('#hdr');
        if (hdr) {
          hdr.classList.toggle('fixed', window.scrollY > 8);
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  // Throttled pointer move for cursor glow (desktop only)
  let glowTicking = false;
  const onPointerMove = (e) => {
    if (window.innerWidth <= 980) return; // Skip on mobile
    
    if (!glowTicking) {
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mx', e.clientX + 'px');
        document.documentElement.style.setProperty('--my', e.clientY + 'px');
        glowTicking = false;
      });
      glowTicking = true;
    }
  };

  // Simple parallax for desktop only
  function initParallax() {
    if (window.innerWidth <= 980) return; // Skip on mobile
    
    const parallaxElements = document.querySelectorAll('.hero-art[data-parallax]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const parallaxValue = Number(el.dataset.parallax || 0.2);
          
          const updateParallax = () => {
            const rect = el.getBoundingClientRect();
            const t = (rect.top - window.innerHeight * 0.5) / window.innerHeight;
            const y = t * (50 * parallaxValue);
            el.style.transform = `translate3d(0, ${y}px, 0)`;
          };
          
          const scrollHandler = () => requestAnimationFrame(updateParallax);
          window.addEventListener('scroll', scrollHandler, { passive: true });
          updateParallax();
        }
      });
    });
    
    parallaxElements.forEach(el => observer.observe(el));
  }

  // Fix viewport issues on mobile
  function fixViewport() {
    // Set viewport meta tag properly
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (window.innerWidth <= 980) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      });
    });

    // Fix height issues on mobile browsers
    function setVH() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);
  }

  // Initialize everything
  function init() {
    initMobileNav();
    fixViewport();
    
    // Add event listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Only add pointer move on desktop
    if (window.innerWidth > 980) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      initParallax();
    }

    // Re-init on resize
    window.addEventListener('resize', () => {
      // Remove/add pointer move based on screen size
      if (window.innerWidth <= 980) {
        window.removeEventListener('pointermove', onPointerMove);
      } else {
        window.addEventListener('pointermove', onPointerMove, { passive: true });
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();