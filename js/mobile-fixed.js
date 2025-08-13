// Fixed Mobile JavaScript - Clean burger menu implementation
(function() {
  'use strict';

  // Clean mobile navigation
  function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    const body = document.body;
    
    if (!navToggle || !nav) return;

    // Create clean burger lines
    navToggle.innerHTML = `
      <span class="burger-line"></span>
      <span class="burger-line"></span>
      <span class="burger-line"></span>
    `;

    // Ensure menu is closed by default
    body.classList.remove('nav-open');
    nav.classList.remove('nav-open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    
    // Reset body overflow
    body.style.overflow = '';

    // Toggle function
    function toggleMenu() {
      const isOpen = body.classList.contains('nav-open');
      
      if (isOpen) {
        // Close menu
        body.classList.remove('nav-open');
        nav.classList.remove('nav-open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
      } else {
        // Open menu
        body.classList.add('nav-open');
        nav.classList.add('nav-open');
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden';
      }
    }

    // Click handler
    navToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // Close on nav link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        body.classList.remove('nav-open');
        nav.classList.remove('nav-open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
      });
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && body.classList.contains('nav-open')) {
        body.classList.remove('nav-open');
        nav.classList.remove('nav-open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
      }
    });

    // Close on outside click
    nav.addEventListener('click', function(e) {
      if (e.target === nav) {
        body.classList.remove('nav-open');
        nav.classList.remove('nav-open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
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

  // Cursor glow for desktop only
  let glowTicking = false;
  const onPointerMove = (e) => {
    if (window.innerWidth <= 980) return;
    
    if (!glowTicking) {
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mx', e.clientX + 'px');
        document.documentElement.style.setProperty('--my', e.clientY + 'px');
        glowTicking = false;
      });
      glowTicking = true;
    }
  };

  // Parallax for desktop only
  function initParallax() {
    if (window.innerWidth <= 980) return;
    
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

  // Fix viewport
  function fixViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

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
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    if (window.innerWidth > 980) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      initParallax();
    }

    window.addEventListener('resize', () => {
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