/**
 * Portfolio Enhancements - Comprehensive Feature Set
 * Includes: GitHub integration, analytics, micro-interactions, PWA registration
 */

(function() {
  'use strict';

  // ==========================================
  // CONFIGURATION
  // ==========================================
  const CONFIG = {
    // GitHub username for API calls
    githubUsername: 'vineetkishore',
    
    // Analytics - using Plausible (privacy-friendly, GDPR compliant)
    // Replace with your actual domain when you set up Plausible
    plausibleDomain: 'vineetkishore.dev',
    
    // Contact email for copy functionality
    contactEmail: 'vineetkishore01@gmail.com',
    
    // GitHub repository names to fetch stats for
    githubRepos: ['Droppy'],
    
    // Enable debug mode
    debug: false
  };

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  const utils = {
    log: (msg, type = 'info') => {
      if (!CONFIG.debug) return;
      console[type](`[Portfolio] ${msg}`);
    },
    
    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
    
    debounce: (func, wait) => {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },
    
    // Copy text to clipboard
    copyToClipboard: async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          document.body.removeChild(textarea);
          return true;
        } catch (e) {
          document.body.removeChild(textarea);
          return false;
        }
      }
    },
    
    // Show toast notification
    showToast: (message, type = 'success') => {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 99999;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      // Animate in
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
      
      // Remove after 3 seconds
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  };

  // ==========================================
  // PWA REGISTRATION
  // ==========================================
  const PWA = {
    init() {
      if (!('serviceWorker' in navigator)) {
        utils.log('Service Worker not supported', 'warn');
        return;
      }
      
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            utils.log(`SW registered: ${registration.scope}`);
          })
          .catch((error) => {
            utils.log(`SW registration failed: ${error}`, 'error');
          });
      });
      
      // Handle "Add to Home Screen" prompt
      let deferredPrompt;
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        this.showInstallPrompt();
      });
      
      this.deferredPrompt = deferredPrompt;
    },
    
    showInstallPrompt() {
      // Create subtle install button
      const installBtn = document.createElement('button');
      installBtn.textContent = 'Install App';
      installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 24px;
        font-weight: 600;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0,122,255,0.3);
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
      `;
      
      installBtn.addEventListener('click', () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              utils.log('User installed PWA');
              utils.showToast('App installed successfully!');
            }
            installBtn.remove();
          });
        }
      });
      
      document.body.appendChild(installBtn);
      
      // Animate in
      setTimeout(() => {
        installBtn.style.opacity = '1';
        installBtn.style.transform = 'translateY(0)';
      }, 100);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (installBtn.parentNode) {
          installBtn.style.opacity = '0';
          installBtn.style.transform = 'translateY(20px)';
          setTimeout(() => installBtn.remove(), 300);
        }
      }, 10000);
    }
  };

  // ==========================================
  // PRIVACY-FRIENDLY ANALYTICS (Plausible)
  // ==========================================
  const Analytics = {
    init() {
      // Load Plausible script
      const script = document.createElement('script');
      script.defer = true;
      script.setAttribute('data-domain', CONFIG.plausibleDomain);
      script.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
      
      // Track custom events
      this.trackPageSections();
      this.trackInteractions();
    },
    
    trackPageSections() {
      // Track when users view different sections
      const sections = ['about', 'experience', 'projects', 'skills', 'education', 'terminal', 'contact'];
      const viewedSections = new Set();
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !viewedSections.has(entry.target.id)) {
            viewedSections.add(entry.target.id);
            this.trackEvent('Section Viewed', { section: entry.target.id });
          }
        });
      }, { threshold: 0.5 });
      
      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
      });
    },
    
    trackInteractions() {
      // Track project card clicks
      document.querySelectorAll('.project-cinema-card').forEach((card) => {
        card.addEventListener('click', () => {
          const projectId = card.getAttribute('data-id') || card.querySelector('h3')?.textContent;
          this.trackEvent('Project Clicked', { project: projectId });
        });
      });
      
      // Track contact method clicks
      document.querySelectorAll('.contact-card').forEach((card) => {
        card.addEventListener('click', () => {
          const type = card.querySelector('.contact-label')?.textContent || 'contact';
          this.trackEvent('Contact Clicked', { type });
        });
      });
      
      // Track resume download
      const resumeBtn = document.querySelector('a[href*="resume"]');
      if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
          this.trackEvent('Resume Downloaded');
        });
      }
      
      // Track terminal usage
      const terminalInput = document.getElementById('terminal-input');
      if (terminalInput) {
        let terminalUsed = false;
        terminalInput.addEventListener('keydown', () => {
          if (!terminalUsed) {
            terminalUsed = true;
            this.trackEvent('Terminal Used');
          }
        });
      }
    },
    
    trackEvent(eventName, props = {}) {
      if (window.plausible) {
        window.plausible(eventName, { props });
      }
      utils.log(`Event: ${eventName}`, 'info');
    }
  };

  // ==========================================
  // GITHUB INTEGRATION
  // ==========================================
  const GitHubIntegration = {
    cache: new Map(),
    
    async init() {
      // Fetch GitHub stats for specified repos
      for (const repo of CONFIG.githubRepos) {
        await this.fetchRepoStats(repo);
      }
      
      // Fetch user profile
      await this.fetchUserProfile();
      
      // Update UI with GitHub data
      this.updateProjectCards();
    },
    
    async fetchRepoStats(repoName) {
      const cacheKey = `github-repo-${repoName}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 300000) { // 5 min cache
        return cached.data;
      }
      
      try {
        const response = await fetch(`https://api.github.com/repos/${CONFIG.githubUsername}/${repoName}`);
        if (!response.ok) throw new Error('GitHub API error');
        
        const data = await response.json();
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        
        utils.log(`Fetched GitHub stats for ${repoName}`);
        return data;
      } catch (error) {
        utils.log(`Failed to fetch GitHub stats: ${error}`, 'error');
        return null;
      }
    },
    
    async fetchUserProfile() {
      const cacheKey = 'github-user';
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 600000) { // 10 min cache
        return cached.data;
      }
      
      try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}`);
        if (!response.ok) throw new Error('GitHub API error');
        
        const data = await response.json();
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        
        // Update stats display
        this.updateGitHubStats(data);
        
        return data;
      } catch (error) {
        utils.log(`Failed to fetch GitHub profile: ${error}`, 'error');
        return null;
      }
    },
    
    updateGitHubStats(data) {
      // Add GitHub stats to hero section if it exists
      const heroStats = document.querySelector('.hero-stats');
      if (heroStats && data) {
        const githubStat = document.createElement('div');
        githubStat.className = 'hero-stat';
        githubStat.innerHTML = `
          <div class="hero-stat-value" style="color: #6e5494;">${data.public_repos}</div>
          <div class="hero-stat-label">GitHub Repos</div>
        `;
        heroStats.appendChild(githubStat);
      }
    },
    
    updateProjectCards() {
      // Add live GitHub stats to project cards
      document.querySelectorAll('.project-cinema-card').forEach(async (card) => {
        const projectId = card.getAttribute('data-id');
        if (!projectId || !CONFIG.githubRepos.includes(projectId)) return;
        
        const stats = await this.fetchRepoStats(projectId);
        if (!stats) return;
        
        // Add GitHub stats badge
        const meta = card.querySelector('.project-cinema-meta');
        if (meta) {
          const githubBadge = document.createElement('span');
          githubBadge.className = 'project-github-stats';
          githubBadge.innerHTML = `
            <span style="color: #6e5494;">⭐ ${stats.stargazers_count}</span>
            <span style="color: #f1e05a; margin-left: 8px;">🍴 ${stats.forks_count}</span>
          `;
          meta.appendChild(githubBadge);
        }
      });
    }
  };

  // ==========================================
  // COPY EMAIL FUNCTIONALITY
  // ==========================================
  const CopyEmail = {
    init() {
      // Find all email links and make them copyable
      document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
        link.addEventListener('click', async (e) => {
          e.preventDefault();
          const email = link.getAttribute('href').replace('mailto:', '');
          const success = await utils.copyToClipboard(email);
          
          if (success) {
            utils.showToast('Email copied to clipboard!');
          } else {
            utils.showToast('Failed to copy email', 'error');
          }
        });
      });
      
      // Add copy button to contact section
      this.addCopyButton();
    },
    
    addCopyButton() {
      const contactSection = document.getElementById('contact');
      if (!contactSection) return;
      
      const emailCard = contactSection.querySelector('.contact-card[href*="mailto"]');
      if (!emailCard) return;
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-email-btn';
      copyBtn.innerHTML = '📋 Copy';
      copyBtn.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: var(--text-secondary);
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-left: 10px;
      `;
      
      copyBtn.addEventListener('mouseenter', () => {
        copyBtn.style.background = 'rgba(0,122,255,0.2)';
        copyBtn.style.borderColor = 'var(--accent-blue)';
      });
      
      copyBtn.addEventListener('mouseleave', () => {
        copyBtn.style.background = 'rgba(255,255,255,0.1)';
        copyBtn.style.borderColor = 'rgba(255,255,255,0.2)';
      });
      
      copyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const success = await utils.copyToClipboard(CONFIG.contactEmail);
        
        if (success) {
          copyBtn.textContent = '✅ Copied!';
          utils.showToast('Email copied to clipboard!');
          setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
          }, 2000);
        }
      });
      
      // Insert after the email card or inside it
      const label = emailCard.querySelector('.contact-label');
      if (label) {
        label.parentNode.insertBefore(copyBtn, label.nextSibling);
      }
    }
  };

  // ==========================================
  // MICRO-INTERACTIONS
  // ==========================================
  const MicroInteractions = {
    init() {
      this.addSkillHoverEffects();
      this.addTimelineHoverEffects();
      this.addProjectCardEnhancements();
      this.addScrollProgressIndicator();
    },
    
    addSkillHoverEffects() {
      document.querySelectorAll('.skill-tag').forEach((tag) => {
        const proficiency = tag.getAttribute('data-proficiency');
        const years = tag.getAttribute('data-years');
        
        if (!proficiency && !years) return;
        
        tag.addEventListener('mouseenter', () => {
          const tooltip = document.createElement('div');
          tooltip.className = 'skill-tooltip';
          tooltip.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(-8px);
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.8rem;
            white-space: nowrap;
            z-index: 100;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            opacity: 0;
            transition: opacity 0.2s ease;
          `;
          
          let content = '';
          if (proficiency) content += `<div>Proficiency: ${proficiency}%</div>`;
          if (years) content += `<div>Experience: ${years} years</div>`;
          tooltip.innerHTML = content;
          
          tag.style.position = 'relative';
          tag.appendChild(tooltip);
          
          requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
          });
        });
        
        tag.addEventListener('mouseleave', () => {
          const tooltip = tag.querySelector('.skill-tooltip');
          if (tooltip) tooltip.remove();
        });
      });
    },
    
    addTimelineHoverEffects() {
      document.querySelectorAll('.timeline-card').forEach((card) => {
        const date = card.querySelector('.timeline-date');
        if (!date) return;
        
        card.addEventListener('mouseenter', () => {
          const fullDate = card.getAttribute('data-full-date');
          if (fullDate) {
            date.setAttribute('data-original', date.textContent);
            date.textContent = fullDate;
          }
        });
        
        card.addEventListener('mouseleave', () => {
          const original = date.getAttribute('data-original');
          if (original) {
            date.textContent = original;
          }
        });
      });
    },
    
    addProjectCardEnhancements() {
      document.querySelectorAll('.project-cinema-card').forEach((card) => {
        // Add "View on GitHub" hint on hover
        const link = card.querySelector('a');
        if (link && link.href.includes('github.com')) {
          const hint = document.createElement('div');
          hint.className = 'project-hint';
          hint.textContent = 'View on GitHub →';
          hint.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            color: var(--accent-blue);
            font-size: 0.85rem;
            font-weight: 500;
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s ease;
            pointer-events: none;
          `;
          
          card.style.position = 'relative';
          card.appendChild(hint);
          
          card.addEventListener('mouseenter', () => {
            hint.style.opacity = '1';
            hint.style.transform = 'translateX(0)';
          });
          
          card.addEventListener('mouseleave', () => {
            hint.style.opacity = '0';
            hint.style.transform = 'translateX(-10px)';
          });
        }
      });
    },
    
    addScrollProgressIndicator() {
      // Create scroll progress bar
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress-indicator';
      progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--accent-blue), var(--accent-blue-light));
        z-index: 10000;
        transition: width 0.1s ease;
      `;
      document.body.appendChild(progressBar);
      
      // Update on scroll
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  };

  // ==========================================
  // CONTENT FRESHNESS INDICATORS
  // ==========================================
  const FreshnessIndicators = {
    init() {
      this.addLastUpdatedDate();
      this.addGitHubActivityIndicator();
    },
    
    addLastUpdatedDate() {
      // Add "Last updated" to footer or hero
      const date = new Date();
      const formatted = date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      const heroSubtitle = document.querySelector('.hero-subtitle');
      if (heroSubtitle) {
        const updated = document.createElement('div');
        updated.style.cssText = `
          font-size: 0.85rem;
          color: var(--text-tertiary);
          margin-top: 8px;
        `;
        updated.innerHTML = `Portfolio updated: <span style="color: var(--accent-blue);">${formatted}</span>`;
        heroSubtitle.appendChild(updated);
      }
    },
    
    addGitHubActivityIndicator() {
      // Show if user is currently working
      const hour = new Date().getHours();
      const isWorkingHours = hour >= 9 && hour <= 18;
      
      const statusIndicator = document.createElement('div');
      statusIndicator.className = 'status-indicator';
      statusIndicator.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,0.05);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 16px;
      `;
      
      const dot = document.createElement('span');
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        background: ${isWorkingHours ? '#10B981' : '#F59E0B'};
        border-radius: 50%;
        animation: ${isWorkingHours ? 'pulse 2s ease-in-out infinite' : 'none'};
      `;
      
      statusIndicator.appendChild(dot);
      statusIndicator.appendChild(document.createTextNode(
        isWorkingHours ? 'Available for opportunities' : 'Coding after hours'
      ));
      
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        heroContent.appendChild(statusIndicator);
      }
    }
  };

  // ==========================================
  // MOBILE ENHANCEMENTS
  // ==========================================
  const MobileEnhancements = {
    init() {
      if (!this.isTouchDevice()) return;
      
      this.addSwipeGestures();
      this.addPullToRefresh();
      this.addHapticFeedback();
    },
    
    isTouchDevice() {
      return window.matchMedia('(pointer: coarse)').matches;
    },
    
    addSwipeGestures() {
      let touchStartX = 0;
      let touchEndX = 0;
      
      document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX);
      }, { passive: true });
    },
    
    handleSwipe(startX, endX) {
      const threshold = 100;
      const diff = endX - startX;
      
      if (Math.abs(diff) < threshold) return;
      
      // Get current section
      const sections = ['hero', 'about', 'experience', 'projects', 'skills', 'education', 'terminal', 'contact'];
      let currentSection = 0;
      
      for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSection = i;
            break;
          }
        }
      }
      
      // Swipe left = next section, swipe right = previous
      if (diff < 0 && currentSection < sections.length - 1) {
        // Swipe left - go next
        const next = document.getElementById(sections[currentSection + 1]);
        if (next) next.scrollIntoView({ behavior: 'smooth' });
      } else if (diff > 0 && currentSection > 0) {
        // Swipe right - go previous
        const prev = document.getElementById(sections[currentSection - 1]);
        if (prev) prev.scrollIntoView({ behavior: 'smooth' });
      }
    },
    
    addPullToRefresh() {
      // Only for blog/news section if you add one
      // For now, just log that it would work
      utils.log('Pull to refresh ready for blog section');
    },
    
    addHapticFeedback() {
      document.querySelectorAll('button, a, .project-cinema-card, .contact-card').forEach((el) => {
        el.addEventListener('touchstart', () => {
          if (navigator.vibrate) {
            navigator.vibrate(10); // Subtle 10ms vibration
          }
        }, { passive: true });
      });
    }
  };

  // ==========================================
  // ACCESSIBILITY ENHANCEMENTS
  // ==========================================
  const AccessibilityEnhancements = {
    init() {
      this.enhanceFocusManagement();
      this.addSkipLinks();
      this.enhanceReducedMotion();
      this.addScreenReaderAnnouncements();
    },
    
    enhanceFocusManagement() {
      // Ensure all interactive elements have visible focus
      const style = document.createElement('style');
      style.textContent = `
        *:focus-visible {
          outline: 2px solid var(--accent-blue);
          outline-offset: 2px;
        }
        
        .no-focus-outline *:focus {
          outline: none;
        }
      `;
      document.head.appendChild(style);
    },
    
    addSkipLinks() {
      // Add skip to main content link
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'skip-link';
      skipLink.style.cssText = `
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent-blue);
        color: white;
        padding: 12px 20px;
        border-radius: 0 0 8px 8px;
        z-index: 100000;
        transition: top 0.3s ease;
        font-weight: 500;
      `;
      
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-100px';
      });
      
      document.body.insertBefore(skipLink, document.body.firstChild);
    },
    
    enhanceReducedMotion() {
      // Respect prefers-reduced-motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      const handleMotionPreference = () => {
        if (mediaQuery.matches) {
          document.documentElement.style.setProperty('--duration-fast', '0.01s');
          document.documentElement.style.setProperty('--duration-normal', '0.01s');
          document.documentElement.style.setProperty('--duration-slow', '0.01s');
          document.body.classList.add('reduce-motion');
        }
      };
      
      mediaQuery.addEventListener('change', handleMotionPreference);
      handleMotionPreference();
    },
    
    addScreenReaderAnnouncements() {
      // Create live region for dynamic content
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);
      
      // Announce section changes
      const sections = document.querySelectorAll('section[id]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const title = entry.target.querySelector('h2');
            if (title) {
              liveRegion.textContent = `Navigated to ${title.textContent}`;
            }
          }
        });
      }, { threshold: 0.5 });
      
      sections.forEach((section) => observer.observe(section));
    }
  };

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runInit);
    } else {
      runInit();
    }
  }
  
  function runInit() {
    utils.log('Initializing Portfolio Enhancements...');
    
    // Core features
    PWA.init();
    Analytics.init();
    GitHubIntegration.init();
    CopyEmail.init();
    
    // UI enhancements
    MicroInteractions.init();
    FreshnessIndicators.init();
    MobileEnhancements.init();
    AccessibilityEnhancements.init();
    
    utils.log('Portfolio Enhancements initialized successfully!');
    console.log('%c✨ Portfolio Enhancements Loaded', 'color: #007AFF; font-size: 14px; font-weight: bold;');
  }
  
  // Start initialization
  init();
  
})();
