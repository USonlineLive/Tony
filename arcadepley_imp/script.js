(function() {
  'use strict';

  const state = {
    hasAnimatedCounters: false,
    currentFilter: 'all'
  };

  function init() {
    setupNavigation();
    setupScrollEffects();
    setupCounterAnimations();
    setupGalleryFilters();
    setupVoting();
    setupFormHandler();
    setupSmoothScroll();
  }

  function setupNavigation() {
    const nav = document.getElementById('main-nav');
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
      });

      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    if (nav) {
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
      });
    }
  }

  function setupScrollEffects() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.resource-card, .journey-step, .gallery-item');
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  function setupCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');

    if (counters.length === 0) return;

    const animateCounter = (element) => {
      const target = parseInt(element.getAttribute('data-counter'));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current).toLocaleString();
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target.toLocaleString();
        }
      };

      updateCounter();
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !state.hasAnimatedCounters) {
          state.hasAnimatedCounters = true;
          counters.forEach(counter => {
            animateCounter(counter);
          });
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  function setupGalleryFilters() {
    const filterButtons = document.querySelectorAll('.gallery__filter');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterButtons.length === 0 || galleryItems.length === 0) return;

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');

        filterButtons.forEach(btn => btn.classList.remove('gallery__filter--active'));
        button.classList.add('gallery__filter--active');

        state.currentFilter = filter;

        galleryItems.forEach(item => {
          const category = item.getAttribute('data-category');

          if (filter === 'all' || category === filter) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 10);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  function setupVoting() {
    const voteButtons = document.querySelectorAll('.gallery-item__vote');

    voteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();

        const currentVotes = parseInt(this.getAttribute('data-votes'));
        const newVotes = currentVotes + 1;

        this.setAttribute('data-votes', newVotes);

        const voteCount = this.querySelector('.gallery-item__vote-count');
        if (voteCount) {
          voteCount.textContent = newVotes;
        }

        this.style.transform = 'scale(1.2)';
        setTimeout(() => {
          this.style.transform = 'scale(1)';
        }, 200);

        const existingVote = localStorage.getItem('voted_' + this.closest('.gallery-item').querySelector('.gallery-item__title').textContent);
        if (!existingVote) {
          localStorage.setItem('voted_' + this.closest('.gallery-item').querySelector('.gallery-item__title').textContent, 'true');
        }
      });
    });

    voteButtons.forEach(button => {
      const itemTitle = button.closest('.gallery-item').querySelector('.gallery-item__title').textContent;
      const hasVoted = localStorage.getItem('voted_' + itemTitle);
      if (hasVoted) {
        button.style.opacity = '0.6';
        button.style.cursor = 'default';
      }
    });
  }

  function setupFormHandler() {
    const form = document.getElementById('signup-form');

    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = this.querySelector('#email').value;
      const button = this.querySelector('button[type="submit"]');
      const originalText = button.querySelector('.btn__text').textContent;

      button.disabled = true;
      button.querySelector('.btn__text').textContent = 'Downloading...';

      setTimeout(() => {
        button.querySelector('.btn__text').textContent = 'Download Started!';
        button.style.background = 'linear-gradient(135deg, #00ff41, #00ffff)';

        if (email) {
          console.log('Email captured:', email);
        }

        setTimeout(() => {
          button.disabled = false;
          button.querySelector('.btn__text').textContent = originalText;
          button.style.background = '';
          this.reset();
        }, 3000);
      }, 1500);
    });
  }

  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        if (href === '#' || href === '') return;

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          const navHeight = document.getElementById('main-nav')?.offsetHeight || 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const particleCount = 50;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = Math.random() * 3 + 1 + 'px';
      particle.style.height = particle.style.width;
      particle.style.background = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.1})`;
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';

      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;

      particle.style.left = x + '%';
      particle.style.top = y + '%';
      particle.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`;

      hero.appendChild(particle);
      particles.push(particle);
    }
  }

  function handleKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    );

    focusableElements.forEach(element => {
      element.addEventListener('focus', function() {
        this.style.outline = '2px solid var(--color-cyan)';
        this.style.outlineOffset = '2px';
      });

      element.addEventListener('blur', function() {
        this.style.outline = '';
        this.style.outlineOffset = '';
      });
    });
  }

  function handlePreferredMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--transition-fast', '0ms');
      document.documentElement.style.setProperty('--transition-base', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');

      const style = document.createElement('style');
      style.textContent = '* { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }';
      document.head.appendChild(style);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  createParticles();
  handleKeyboardNavigation();
  handlePreferredMotion();

})();