// ==========================================
// PRELOADER CONTROLLER - ESSENTIAL FOR SITE ENTRY
// ==========================================
/**
 * Handles the removal of the preloader once the site has loaded.
 * Implements a simulated progress bar for better UX and fallback timeout.
 */
// ==========================================
// SITE INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Initializing Systems...');

    // Skip preloader and go straight to Hero
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'none';
    document.body.classList.remove('unselectable');

    // Initialize core systems
    initHeroEntrance();

    // Initialize other controllers
    ModernNavigation.init();
    GlobalScrollEffects.init();
    ProjectFilterSystem.init();
    TerminalTeaser.init();
    EducationController.init();
    ContactSystem.init();

    // Refresh ScrollTrigger
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 100);
});

// Number count-up animation helper
function animateNumber(element, target, suffix = '') {
    let current = 0;
    const duration = 1500; // 1.5s
    const start = performance.now();

    function step(timestamp) {
        const progress = Math.min((timestamp - start) / duration, 1);
        const value = Math.floor(progress * target);

        // Handle decimals if target is float
        if (target % 1 !== 0) {
            element.textContent = (progress * target).toFixed(1) + suffix;
        } else {
            element.textContent = value + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            // Ensure exact target value is set
            element.textContent = target + suffix;
        }
    }
    requestAnimationFrame(step);
}

// Phase 2A: Hero Entrance Sequence
function initHeroEntrance() {
    if (typeof gsap === 'undefined') return;

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Step 1: Background Orbs
    heroTl.from('.hero-orb', {
        scale: 0,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power2.out'
    }, 0);

    // Step 2: Hero Title / Glitch Name
    heroTl.from('.hero-title .glitch-name', {
        y: 60,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1.2,
        ease: 'power4.out',
        clearProps: 'all'
    }, 0.4);

    // Step 4: Subtitle
    heroTl.from('.hero-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.8
    }, 0.7);

    // Step 5: CTA Group
    heroTl.from('.hero-cta-group', {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
    }, 0.9);

    // Step 6: Stats with Count-up
    heroTl.from('.hero-stat', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        onComplete: () => {
            document.querySelectorAll('.hero-stat-value').forEach(el => {
                const text = el.textContent.trim();
                const value = parseFloat(text.replace(/[^\d.]/g, ''));
                const suffix = text.replace(/[\d.]/g, '');
                animateNumber(el, value, suffix);
            });
        }
    }, 1.1);

    // Step 7: Profile Card
    heroTl.from('.hero-profile-card', {
        x: 60,
        opacity: 0,
        rotateY: 15,
        duration: 1.2,
        clearProps: 'all'
    }, 0.5);

    // Mobile badge
    heroTl.from('.mobile-badge', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
    }, 0.8);
}


// Initialize Preloader immediately
PreloaderController.init();

// ==========================================
// LENIS SMOOTH SCROLL - SAFE INIT
// ==========================================
let lenis;
try {
    // Check for mobile device (simple user agent check or screen width)
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (typeof Lenis !== 'undefined' && !isMobile) {
        lenis = new Lenis({
            duration: 0.7, // Snappier
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            lerp: 0.1, // Hyper-responsive
            wheelMultiplier: 1.2,
            touchMultiplier: 1.5,
            smooth: true
        });

        // Handle navigation links with Lenis scrollTo for instantaneous feel
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                lenis.scrollTo(targetId, {
                    duration: 0.8,
                    offset: -60, // Adjust for sticky nav
                    onComplete: () => {
                        // Refresh ScrollTrigger to catch all reveals immediately
                        ScrollTrigger.refresh();
                    }
                });
            });
        });

        // Sync Lenis with ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        // Revert to 0 as recommended for Lenis sync
        gsap.ticker.lagSmoothing(0);
        console.log("✓ Lenis Smooth Scroll initialized (Desktop Mode)");
    } else {
        console.warn("Lenis disabled on mobile/touch - fallback to native high-performance scroll");
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.classList.add('ios-native-scroll'); // Hook for CSS optimizations
    }
} catch (e) {
    console.error("Lenis init failed:", e);
    document.documentElement.style.scrollBehavior = 'smooth';
}



// ==========================================
// SCROLL PROGRESS
// ==========================================

const scrollProgress = document.getElementById('scroll-progress');

if (scrollProgress) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = `${progress}%`;
    }, { passive: true });
}

// ==========================================
// NAVIGATION SCROLL EFFECT - ENHANCED
// ==========================================
const NavigationScrollEffect = {
    init() {
        this.nav = document.getElementById('nav');
        if (!this.nav) {
            console.warn('NavigationScrollEffect: Nav element not found');
            return;
        }

        this.threshold = 50;
        this.isScrolled = false;
        this.rafId = null;

        this.setupEventListeners();
        this.checkScroll(); // Initial check

        console.log('NavigationScrollEffect: Initialized successfully');
    },

    setupEventListeners() {
        // Use requestAnimationFrame for smooth performance
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                this.rafId = requestAnimationFrame(() => {
                    this.checkScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    },

    checkScroll() {
        const shouldBeScrolled = window.scrollY > this.threshold;

        if (shouldBeScrolled !== this.isScrolled) {
            this.isScrolled = shouldBeScrolled;
            this.nav.classList.toggle('scrolled', this.isScrolled);

            // Add data attribute for debugging/testing
            this.nav.setAttribute('data-scrolled', this.isScrolled);

            console.log(`NavigationScrollEffect: Scrolled state changed to ${this.isScrolled}`);
        }
    },

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }
};

// Initialize navigation scroll effect
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NavigationScrollEffect.init());
} else {
    NavigationScrollEffect.init();
}

// ==========================================
// MOBILE MENU - ENTERPRISE GRADE
// ==========================================
// ==========================================
// MOBILE MENU - ENTERPRISE GRADE
// ==========================================
const MobileMenu = {
    init(retries = 3) {
        this.toggle = document.getElementById('menu-toggle');
        this.navLinks = document.getElementById('nav-links');
        this.body = document.body;

        if (!this.toggle || !this.navLinks) {
            if (retries > 0) {
                console.warn(`MobileMenu: Elements unseen, retrying... (${retries})`);
                setTimeout(() => this.init(retries - 1), 100);
            } else {
                console.error('MobileMenu: Failed to find required elements');
            }
            return;
        }

        this.isOpen = false;

        // Force touch action
        this.toggle.style.touchAction = 'manipulation';

        // Remove old listeners to prevent duplicates
        const newToggle = this.toggle.cloneNode(true);
        this.toggle.parentNode.replaceChild(newToggle, this.toggle);
        this.toggle = newToggle;

        this.setupEventListeners();

        // Add accessibility attributes
        this.toggle.setAttribute('aria-label', 'Toggle navigation menu');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.setAttribute('aria-controls', 'nav-links');
        this.navLinks.setAttribute('role', 'navigation');

        console.log('MobileMenu: Initialized successfully 🚀');
    },

    setupEventListeners() {
        // Primary interaction handler
        const handleInteraction = (e) => {
            // Prevent default only for touch to avoid ghost clicks, allow standard click prop
            if (e.type === 'click') {
                e.preventDefault();
                e.stopPropagation();
            }
            this.toggleMenu();
        };

        // Use both click and touchend for maximum compatibility
        // (Using 'click' alone is usually fine, but 'touchend' can feel snappier on some older WebViews)
        this.toggle.addEventListener('click', handleInteraction);

        // Close on link click
        this.navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            // Check if click is outside both toggle and menu
            if (this.isOpen &&
                !this.navLinks.contains(e.target) &&
                !this.toggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && this.isOpen) {
                this.closeMenu();
            }
        }, { passive: true });
    },

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    },

    openMenu() {
        this.isOpen = true;
        this.navLinks.classList.add('active');
        this.toggle.classList.add('active');
        this.toggle.setAttribute('aria-expanded', 'true');
        this.body.style.overflow = 'hidden';

        // Animate hamburger to X
        this.toggle.style.transform = 'rotate(90deg)';

        console.log('MobileMenu: Opened');
    },

    closeMenu() {
        this.isOpen = false;
        this.navLinks.classList.remove('active');
        this.toggle.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.body.style.overflow = '';

        // Reset hamburger
        this.toggle.style.transform = '';

        console.log('MobileMenu: Closed');
    }
};

// Initialize mobile menu
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileMenu.init());
} else {
    MobileMenu.init();
}

// ==========================================
// HERO ANIMATIONS - ENHANCED
// ==========================================

gsap.registerPlugin(ScrollTrigger);

// Typing cursor effect for hero label
function typeWriterEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    element.classList.add('typing');

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            element.classList.remove('typing');
        }
    }
    type();
}

// Initialize typing effect
const heroLabel = document.querySelector('.hero-label');
if (heroLabel) {
    const originalText = heroLabel.textContent;
    setTimeout(() => {
        typeWriterEffect(heroLabel, originalText, 40);
    }, 500);
}

// ==========================================
// SECTION CHOREOGRAPHY & AMBIENT EFFECTS
// ==========================================

const SectionChoreography = {
    init() {
        if (typeof gsap === 'undefined') return;

        this.setupAbout();
        this.setupExperience();
        this.setupProjects();
        this.setupSkills();
        this.setupEducation();
        this.setupAmbientEffects();
    },

    setupAbout() {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.about',
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });

        tl.from('.about .section-header > *', {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out'
        })
            .from('.about-card', {
                opacity: 0,
                y: 50,
                clipPath: 'inset(100% 0 0 0)',
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out'
            }, '-=0.4');
    },

    setupExperience() {
        // Timeline line drawing - Enhanced highlight
        gsap.to('.timeline-progress', {
            height: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: '.timeline-container',
                start: 'top 70%',
                end: 'bottom 70%',
                scrub: true // Immediate feedback
            }
        });

        // Staggered items
        document.querySelectorAll('.timeline-item').forEach((item, i) => {
            gsap.from(item, {
                opacity: 0,
                x: i % 2 === 0 ? -50 : 50,
                duration: 0.8,
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });

            // Dot pulse on activation
            ScrollTrigger.create({
                trigger: item,
                start: 'top 70%',
                onEnter: () => item.classList.add('active'),
                onEnterBack: () => item.classList.add('active'),
                onLeave: () => item.classList.remove('active'),
                onLeaveBack: () => item.classList.remove('active')
            });
        });
    },

    setupProjects() {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.projects',
                start: 'top 80%',
            }
        });

        tl.from('.projects .section-header > *', { opacity: 0, y: 30, stagger: 0.1 })
            .from('.project-filters > *', { opacity: 0, y: 10, stagger: 0.05 }, '-=0.3')
            .from('.project-cinema-card', {
                opacity: 0,
                y: 40,
                rotateY: (i) => i % 2 === 0 ? 15 : -15,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out',
                onComplete: () => {
                    gsap.set('.project-cinema-card', { clearProps: 'opacity,transform,rotateY' });
                }
            }, '-=0.5');
    },

    setupSkills() {
        gsap.from('.skill-category', {
            opacity: 0,
            x: -40,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.skills-grid',
                start: 'top 90%',
                once: true
            },
            onComplete: () => {
                gsap.set('.skill-category', { clearProps: 'all' });
            }
        });

        document.querySelectorAll('.skill-category').forEach(cat => {
            gsap.from(cat.querySelectorAll('.skill-tag'), {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                stagger: 0.03,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: cat,
                    start: 'top 90%'
                }
            });
        });
    },

    setupEducation() {
        gsap.from('.education-card', {
            opacity: 0,
            y: 40,
            rotation: (i) => (i - 1) * 3, // Slight fan effect
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.education-grid',
                start: 'top 85%'
            }
        });
    },

    setupAmbientEffects() {
        // Re-enable and improve HeroWaterBubble
        if (typeof HeroWaterBubble !== 'undefined' && window.innerWidth > 1024) {
            HeroWaterBubble.init();
        }

        // Section Title Highlights (requested scroll animations)
        document.querySelectorAll('.section-title').forEach(title => {
            ScrollTrigger.create({
                trigger: title,
                start: 'top 80%',
                onEnter: () => title.classList.add('highlight-active'),
                onLeaveBack: () => title.classList.remove('highlight-active')
            });
        });
    }
};

// Initialize choreography
SectionChoreography.init();


// Terminal is now in its own standalone <script> tag above
// (isolated from this script block for reliability)





// ==========================================
// HERO COLOR REVEAL BLOB - ENTERPRISE GRADE
// ==========================================
// ==========================================
// HERO WATER BUBBLE EFFECT - ENHANCED
// ==========================================
const HeroWaterBubble = {
    init() {
        this.container = document.getElementById('hero-image-container');
        if (!this.container) {
            console.warn('HeroWaterBubble: Container not found');
            return;
        }

        this.colorImage = document.getElementById('hero-color-image');
        this.bubble = document.getElementById('hero-bubble');
        this.particlesContainer = document.getElementById('hero-particles');

        this.edgesImage = this.container.querySelector('.hero-image-edges');
        this.glitchImage = this.container.querySelector('.hero-image-glitch');

        // Create micro-bubbles container
        try {
            this.createMicroBubbles();
        } catch (e) {
            console.error('HeroWaterBubble: Error creating micro-bubbles', e);
        }

        console.log('HeroWaterBubble: Elements ->', {
            c: !!this.container,
            img: !!this.colorImage,
            bub: !!this.bubble,
            e: !!this.edgesImage,
            g: !!this.glitchImage
        });

        if (!this.colorImage || !this.bubble) {
            console.warn('HeroWaterBubble: Elements not found');
            return;
        }

        this.isTouchDevice = (
            (false) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (window.matchMedia('(any-pointer: coarse)').matches) ||
            (window.matchMedia('(hover: none)').matches)
        );

        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isHovering = false;
        this.rafId = null;
        this.bubbleSize = 220; // Base size

        // Check if performance manager exists
        const lowPowerMode = (typeof PerformanceManager !== 'undefined' && PerformanceManager.isLowPowerMode);

        if (this.isTouchDevice || lowPowerMode) {
            this.bubble.style.display = 'none';
            // On touch or low power, show full color image or handle gracefully
            // For now, let's just show the color image fully revealed or maybe just keep it B&W
            // User preference might vary, but usually showing color is safer.
            this.colorImage.style.clipPath = 'circle(100% at 50% 50%)';
            this.colorImage.style.opacity = '1';
            this.colorImage.style.transition = 'opacity 0.5s ease';
            return;
        }

        this.setupEventListeners();
        console.log('HeroWaterBubble: Initialized');
    },

    createMicroBubbles() {
        // Remove existing if any
        const existing = document.querySelector('.hero-micro-bubbles');
        if (existing) existing.remove();

        // Create container
        const microBubbles = document.createElement('div');
        microBubbles.className = 'hero-micro-bubbles';

        // Create 8 micro-bubbles
        for (let i = 0; i < 8; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'micro-bubble';

            // Random positions around the image
            const angle = (i / 8) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            const x = 50 + Math.cos(angle) * 30;
            const y = 50 + Math.sin(angle) * 30;

            bubble.style.left = `${x}%`;
            bubble.style.top = `${y}%`;
            bubble.style.animationDelay = `${i * 0.3}s`;

            microBubbles.appendChild(bubble);
        }

        this.container.appendChild(microBubbles);
    },

    setupEventListeners() {
        // Mouse move - update bubble position and color reveal
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.targetX = e.clientX - rect.left;
            this.targetY = e.clientY - rect.top;

            // Dynamic bubble size based on movement speed
            const speed = Math.abs(this.targetX - this.currentX) +
                Math.abs(this.targetY - this.currentY);
            this.bubbleSize = 200 + Math.min(speed * 0.5, 60);

            if (!this.isHovering) {
                this.isHovering = true;
                this.bubble.classList.add('active');
                this.currentX = this.targetX;
                this.currentY = this.targetY;
                this.animate();
            }
        }, { passive: true });

        // Mouse enter - show bubble with fade
        this.container.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.bubble.classList.add('active');

            // Smooth transition for color reveal
            this.colorImage.style.transition = 'clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
        }, { passive: true });

        // Mouse leave - hide bubble and reset color
        this.container.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.bubble.classList.remove('active');

            // Animate color back to black & white
            this.colorImage.style.transition = 'clip-path 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
            this.colorImage.style.clipPath = 'circle(0% at 50% 50%)';

            // Cancel animation frame
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }, { passive: true });

        // Click - expand bubble temporarily
        this.container.addEventListener('click', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Temporarily expand the bubble
            this.colorImage.style.transition = 'clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            this.colorImage.style.clipPath = `circle(350px at ${x}px ${y}px)`;

            // Expand bubble visual
            this.bubble.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            this.bubble.style.transform = `translate(${x}px, ${y}px) scale(1.5)`;

            // Reset after delay
            setTimeout(() => {
                if (this.isHovering) {
                    this.bubble.style.transition = 'all 0.3s ease';
                    this.bubble.style.transform = `translate(${x}px, ${y}px) scale(1)`;
                    this.colorImage.style.transition = 'clip-path 0.15s ease';
                }
            }, 600);
        });

        // Add accessibility
        this.container.setAttribute('role', 'img');
        this.container.setAttribute('aria-label', 'Profile photo - hover to reveal color through watery bubble');
    },

    animate() {
        if (!this.isHovering) return;

        // Smooth interpolation for bubble movement
        this.currentX += (this.targetX - this.currentX) * 0.18;
        this.currentY += (this.targetY - this.currentY) * 0.18;

        // Apply to bubble position
        this.bubble.style.left = `${this.currentX}px`;
        this.bubble.style.top = `${this.currentY}px`;

        // Apply dynamic size
        this.bubble.style.width = `${this.bubbleSize}px`;
        this.bubble.style.height = `${this.bubbleSize}px`;

        // Update color reveal clip path
        const radius = this.bubbleSize / 2.2;
        this.colorImage.style.clipPath = `circle(${radius}px at ${this.currentX}px ${this.currentY}px)`;

        // Update 3D edges clip path (slightly larger for 'scanning' effect)
        if (this.edgesImage) {
            this.edgesImage.style.clipPath = `circle(${radius + 20}px at ${this.currentX}px ${this.currentY}px)`;
            this.edgesImage.style.transform = `translate(${(this.currentX - this.targetX) * 0.05}px, ${(this.currentY - this.targetY) * 0.05}px)`; // Parallax
        }

        // Glitch effect occasional sync
        if (this.glitchImage && Math.random() > 0.95) {
            this.glitchImage.style.clipPath = `circle(${radius}px at ${this.currentX}px ${this.currentY}px)`;
            this.glitchImage.style.opacity = '0.5';
            setTimeout(() => { if (this.glitchImage) this.glitchImage.style.opacity = '0'; }, 100);
        }

        this.rafId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }
};

// Initialize hero water bubble
if (document.readyState === 'loading') {
    // document.addEventListener('DOMContentLoaded', () => HeroWaterBubble.init());
} else {
    // HeroWaterBubble.init();
}

// ==========================================
// ENTERPRISE GRADE ERROR HANDLING
// ==========================================
window.addEventListener('error', (e) => {
    console.error('Portfolio Error:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error?.stack
    });
    // Prevent error from breaking the page
    e.preventDefault();
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    e.preventDefault();
});

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
if ('PerformanceObserver' in window) {
    try {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    console.log(`LCP: ${entry.startTime}ms`);
                }
                if (entry.entryType === 'first-input') {
                    console.log(`FID: ${entry.processingStart - entry.startTime}ms`);
                }
            }
        });
        perfObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    } catch (e) {
        console.warn('PerformanceObserver not supported');
    }
}

// ==========================================
// MOBILE OPTIMIZATIONS
// ==========================================
const MobileOptimizer = {
    init() {
        this.isTouchDevice = this.detectTouchDevice();

        if (this.isTouchDevice) {
            this.optimizeForTouch();
            console.log('MobileOptimizer: Touch device optimizations applied');
        }

        this.initLazyLoading();
    },

    detectTouchDevice() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            window.matchMedia('(pointer: coarse)').matches ||
            window.matchMedia('(hover: none)').matches
        );
    },

    optimizeForTouch() {
        // Disable hover-dependent effects on touch devices
        document.body.classList.add('touch-device');

        // Optimize project cards for touch
        const projectCards = document.querySelectorAll('.project-cinema-card');
        projectCards.forEach(card => {
            // Add tap highlight
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            }, { passive: true });

            card.addEventListener('touchend', () => {
                card.style.transform = '';
            }, { passive: true });
        });

        // Optimize terminal for mobile
        const terminalInput = document.getElementById('terminal-input');
        if (terminalInput && this.isTouchDevice) {
            // Ensure input is accessible on mobile
            terminalInput.setAttribute('autocorrect', 'off');
            terminalInput.setAttribute('autocomplete', 'off');

            // Scroll terminal into view when focused
            terminalInput.addEventListener('focus', () => {
                setTimeout(() => {
                    terminalInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        }

        // Optimize smooth scroll for mobile
        if (typeof lenis !== 'undefined') {
            lenis.options.smoothTouch = false;
        }
    },

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: 0.01
            });

            // Observe images for lazy loading
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
};

// Initialize mobile optimizer
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileOptimizer.init());
} else {
    MobileOptimizer.init();
}

// ==========================================
// SYSTEM INITIALIZATION CHECK
// ==========================================
const SystemCheck = {
    init() {
        const systems = [
            { name: 'Lenis Smooth Scroll', check: () => typeof lenis !== 'undefined' },
            { name: 'GSAP Animation', check: () => typeof gsap !== 'undefined' },
            { name: 'ScrollTrigger', check: () => typeof ScrollTrigger !== 'undefined' },
            { name: 'Navigation Highlighter', check: () => typeof NavigationHighlighter !== 'undefined' },
            { name: 'Project Filter System', check: () => typeof ProjectFilterSystem !== 'undefined' },

            { name: 'Mobile Menu', check: () => typeof MobileMenu !== 'undefined' },
            { name: 'Mobile Optimizer', check: () => typeof MobileOptimizer !== 'undefined' }
        ];

        console.group('🚀 Portfolio System Check');
        let allPassed = true;
        systems.forEach(system => {
            const passed = system.check();
            const icon = passed ? '✅' : '❌';
            console.log(`${icon} ${system.name}`);
            if (!passed) allPassed = false;
        });
        console.groupEnd();

        if (allPassed) {
            console.log('%c✨ All systems operational!', 'color: #27c93f; font-weight: bold;');
        } else {
            console.warn('⚠️ Some systems failed to initialize');
        }
    }
};

// Run system check after all modules initialize
setTimeout(() => SystemCheck.init(), 1000);

// ==========================================
// CONSOLE EASTER EGG
// ==========================================
console.log('%c👋 Hey there, curious developer!', 'color: #007AFF; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to my portfolio source code.', 'color: #86868B; font-size: 14px;');
console.log('%c\n🎮 Secret commands:', 'color: #007AFF; font-size: 12px; font-weight: bold;');
console.log('%c• Type "matrix" in the terminal', 'color: #86868B; font-size: 12px;');
console.log('%c• Press F for flashlight mode', 'color: #86868B; font-size: 12px;');
console.log('%c• Explore the terminal for more secrets', 'color: #86868B; font-size: 12px;');
console.log('%c\n✨ Happy exploring! 🚀', 'color: #007AFF; font-size: 12px;');

// ==========================================
// PROJECT FILTERS - ENTERPRISE GRADE
// ==========================================
const ProjectFilterSystem = {
    init() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-cinema-card');
        this.currentFilter = 'all';
        this.isAnimating = false;

        if (!this.filterButtons.length || !this.projectCards.length) {
            console.warn('ProjectFilterSystem: Elements not found');
            return;
        }

        this.bindEvents();
        this.applyFilter('all', false);
        console.log('ProjectFilterSystem: Initialized successfully');
    },

    bindEvents() {
        this.filterButtons.forEach(btn => {
            // Remove any existing listeners to prevent duplicates
            btn.removeEventListener('click', this.handleFilterClick);
            btn.addEventListener('click', (e) => this.handleFilterClick(e, btn));

            // Add keyboard accessibility
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleFilterClick(e, btn);
                }
            });
        });
    },

    handleFilterClick(e, btn) {
        e.preventDefault();
        e.stopPropagation();

        const filter = btn.getAttribute('data-filter');
        if (!filter || filter === this.currentFilter || this.isAnimating) {
            return;
        }

        this.applyFilter(filter, true);
    },

    applyFilter(filter, animate = true) {
        this.currentFilter = filter;
        this.isAnimating = animate;

        // Update button states
        this.filterButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-filter') === filter;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });

        // Apply filter to cards
        let visibleCount = 0;
        this.projectCards.forEach((card, index) => {
            const category = card.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;

            if (shouldShow) {
                visibleCount++;
                card.classList.remove('filter-hidden');
                card.classList.add('filter-visible');
                card.style.display = 'block';

                if (animate) {
                    gsap.fromTo(card,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.4,
                            delay: index * 0.05,
                            ease: 'power2.out',
                            onComplete: () => {
                                if (index === this.projectCards.length - 1) {
                                    this.isAnimating = false;
                                }
                                gsap.set(card, { clearProps: 'transform,width,margin,padding' }); // Ensure clean layout
                            }
                        }
                    );
                }
            } else {
                card.classList.remove('filter-visible');
                card.classList.add('filter-hidden');

                if (animate) {
                    gsap.to(card, {
                        opacity: 0,
                        y: -20,
                        margin: 0,
                        width: 0,
                        padding: 0,
                        duration: 0.3,
                        ease: 'power2.in',
                        onComplete: () => {
                            card.style.display = 'none';
                            if (index === this.projectCards.length - 1) {
                                this.isAnimating = false;
                            }
                            gsap.set(card, { clearProps: 'width,padding,margin,y,scale,opacity' }); // Reset for next show
                            card.classList.add('filter-hidden'); // Ensure class sticks
                        }
                    });
                } else {
                    card.style.display = 'none';
                }
            }
        });

        console.log(`ProjectFilterSystem: Filter applied - ${filter}, ${visibleCount} projects visible`);

        if (!animate) {
            this.isAnimating = false;
        }
    }
};

// Initialize filter system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProjectFilterSystem.init());
} else {
    ProjectFilterSystem.init();
}

// ==========================================
// TOAST NOTIFICATIONS - Steal from Wall of Portfolios
// ==========================================
const Toast = {
    init() {
        this.toast = document.getElementById('notificationToast');
        if (!this.toast) {
            this.createToast();
        }
        this.timeout = null;
    },

    createToast() {
        this.toast = document.createElement('div');
        this.toast.id = 'notificationToast';
        this.toast.className = 'notification-toast';
        this.toast.innerHTML = `
            <p class="toast-message"></p>
            <a href="#" class="toast-action"></a>
        `;
        document.body.appendChild(this.toast);
    },

    show(message, action = null, duration = 3000) {
        this.toast.querySelector('.toast-message').textContent = message;

        if (action) {
            const actionEl = this.toast.querySelector('.toast-action');
            actionEl.textContent = action.text;
            actionEl.href = action.href;
            actionEl.style.display = 'block';
        } else {
            this.toast.querySelector('.toast-action').style.display = 'none';
        }

        this.toast.classList.add('active');

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.toast.classList.remove('active');
        }, duration);
    }
};

// Initialize Toast
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Toast.init());
} else {
    Toast.init();
}




// ==========================================
// 3D TILT EFFECT FOR CARDS - ENHANCED
// ==========================================
const CardTiltEffect = {
    init() {
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

        if (this.isTouchDevice) {
            console.log('CardTiltEffect: Disabled on touch device');
            return;
        }

        this.cards = document.querySelectorAll('.about-card, .project-cinema-inner, .contact-card');
        this.setupCards();

        console.log(`CardTiltEffect: Initialized for ${this.cards.length} cards`);
    },

    setupCards() {
        // Unused listeners removed to prevent performance drag
    },

    onMouseMove(e, card) {
        // Disabled - 3D tilt removed
    },

    onMouseLeave(card) {
        // Disabled - 3D tilt removed
    },

    onMouseEnter(card) {
        // Disabled - 3D tilt removed
    }
};

// Initialize card tilt effect - DISABLED
// CardTiltEffect.init()

// ==========================================
// MAGNETIC BUTTON EFFECT - ENHANCED
// ==========================================
const MagneticButtons = {
    init() {
        // Disabled - magnetic button drag effect removed
        console.log('MagneticButtons: Disabled');
    },

    setupButton(btn) {
        // Disabled
    },

    onMouseMove(e, btn) {
        // Disabled
    },

    onMouseLeave(btn) {
        // Disabled
    },

    onMouseEnter(btn) {
        // Disabled
    }
};

// Initialize magnetic buttons - DISABLED
// MagneticButtons.init()

// ==========================================
// FIX 6: SCROLL-TRIGGERED SECTION REVEALS
// Content flows in with purpose, not just fades
// ==========================================
const SectionReveals = {
    init() {
        const sections = document.querySelectorAll('section');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.revealSection(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05, // Trigger much earlier
            rootMargin: '0px 0px -5% 0px'
        });

        sections.forEach(section => {
            const sectionId = section.id;
            // These sections have their own GSAP reveal logic for children
            const needsCustomReveal = ['skills', 'education', 'contact', 'about', 'projects', 'insights', 'experience'].includes(sectionId);

            if (needsCustomReveal) {
                section.style.opacity = '1';
                section.style.transform = 'none';
                return;
            }

            // Snappier preparation
            section.style.opacity = '0';
            section.style.transform = 'translateY(15px)';
            section.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            observer.observe(section);
        });
    },

    revealSection(section) {
        // Simplified reveal to ensure element is actually visible 
        // while respecting GSAP controls
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        section.classList.add('section-revealed');
    }
};

// Initialize Section Reveals
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SectionReveals.init());
} else {
    SectionReveals.init();
}

// ==========================================
// TEXT SCRAMBLE EFFECT FOR LABELS
// ==========================================
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 20);
            const end = start + Math.floor(Math.random() * 20);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Apply scramble effect to section labels on scroll - DOWN ONLY, ONCE
const scrambleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Only trigger when scrolling down (element entering from bottom)
        if (entry.isIntersecting && entry.boundingClientRect.top > 0 && !entry.target.dataset.scrambled) {
            entry.target.dataset.scrambled = 'true';
            const fx = new TextScramble(entry.target);
            const originalText = entry.target.innerText;
            fx.setText(originalText);
            scrambleObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.section-label').forEach(label => {
    scrambleObserver.observe(label);
});

// ==========================================
// NAVIGATION ACTIVE LINK HIGHLIGHTING
// ==========================================
const NavigationHighlighter = {
    init() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.currentActive = null;

        if (!this.navLinks.length || !this.sections.length) {
            console.warn('NavigationHighlighter: Elements not found');
            return;
        }

        this.bindEvents();
        this.updateActiveLink();
        console.log('NavigationHighlighter: Initialized successfully');
    },

    bindEvents() {
        // Use IntersectionObserver for better performance
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveLink(entry.target.id);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            this.observer.observe(section);
        });

        // Fallback scroll listener for edge cases
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.updateActiveLink(), 100);
        }, { passive: true });
    },

    setActiveLink(sectionId) {
        if (this.currentActive === sectionId) return;
        this.currentActive = sectionId;

        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `#${sectionId}`;
            link.classList.toggle('active', isActive);

            // Accessibility
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        console.log(`NavigationHighlighter: Active section - ${sectionId}`);
    },

    updateActiveLink() {
        const scrollPos = window.scrollY + window.innerHeight / 3;

        let currentSection = null;
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        if (currentSection) {
            this.setActiveLink(currentSection);
        }
    },

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
};

// Initialize navigation highlighter
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NavigationHighlighter.init());
} else {
    NavigationHighlighter.init();
}

// ==========================================
// SMOOTH SCROLL FOR ANCHOR LINKS - ENHANCED
// ==========================================
// Consolidated link handler is already in the Lenis init block (top of file)
// This redundant block is removed for performance.

// ==========================================
// AMBIENT BACKGROUND ANIMATION
// ==========================================
const ambientBg = document.createElement('div');
ambientBg.className = 'ambient-bg';
ambientBg.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: -1;
            opacity: 0.4;
            background: 
                radial-gradient(circle at 20% 50%, rgba(0,122,255,0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(0,122,255,0.05) 0%, transparent 40%);
            animation: ambientMove 20s ease-in-out infinite;
            will-change: transform;
        `;
document.body.appendChild(ambientBg);

const ambientStyle = document.createElement('style');
ambientStyle.textContent = `
            @keyframes ambientMove {
                0%, 100% { transform: translate(0, 0) scale(1); }
                33% { transform: translate(2%, 2%) scale(1.02); }
                66% { transform: translate(-2%, 1%) scale(0.98); }
            }
        `;
document.head.appendChild(ambientStyle);

// ==========================================
// SOUND MANAGER (PHASE 3)
// ==========================================
var SoundManager = {
    init() {
        // Sound effects disabled — invalid audio data removed to prevent console errors
        this.clickSound = null;
        this.hoverSound = null;

        this.muted = true;
        this.setupListeners();
        console.log('SoundManager: Initialized (Muted until interaction)');
    },

    setupListeners() {
        const enableAudio = () => {
            this.muted = false;
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('keydown', enableAudio);
            console.log('SoundManager: Audio Enabled 🔊');
        };
        document.addEventListener('click', enableAudio);
        document.addEventListener('keydown', enableAudio);

        // Attach sounds to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .project-cinema-card, .nav-link, .hero-cta-primary');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.play('hover'));
            el.addEventListener('click', () => this.play('click'));
        });
    },

    play(type) {
        if (this.muted) return;

        try {
            const sound = type === 'click' ? this.clickSound : this.hoverSound;
            if (!sound) return;
            const clone = sound.cloneNode();
            clone.volume = 0.05; // Very subtle
            clone.play().catch(() => { });
        } catch (e) {
            // Ignore autoplay errors
        }
    }
};

// ==========================================
// MOBILE CAROUSEL - OPTIMIZED
// ==========================================
const MobileCarousel = {
    isMobile: false,
    containers: [],

    init() {
        this.checkMobile();
        if (!this.isMobile) return;

        this.setupCarousels();
        this.setupResizeListener();
    },

    checkMobile() {
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;
    },

    setupCarousels() {
        const containerSelectors = [
            '.about-grid',
            '.timeline-container',
            '.projects-cinema',
            '.insights-grid'
        ];

        containerSelectors.forEach(selector => {
            const container = document.querySelector(selector);
            if (container && !container.dataset.carouselInit) {
                this.setupCarousel(container);
                container.dataset.carouselInit = 'true';
            }
        });
    },

    setupCarousel(container) {
        const cards = Array.from(container.children).filter(el =>
            el.classList.contains('about-card') ||
            el.classList.contains('timeline-item') ||
            el.classList.contains('project-cinema-card') ||
            el.classList.contains('insight-card')
        );

        if (cards.length <= 1) return;

        // Create indicators
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';

        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = i === 0 ? 'carousel-dot active' : 'carousel-dot';
            indicators.appendChild(dot);
        });

        container.parentNode.insertBefore(indicators, container.nextSibling);

        // Single observer for all carousels
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const index = cards.indexOf(card);
                    const dots = indicators.querySelectorAll('.carousel-dot');

                    cards.forEach(c => c.classList.remove('mobile-card-active'));
                    dots.forEach(d => d.classList.remove('active'));

                    card.classList.add('mobile-card-active');
                    if (dots[index]) dots[index].classList.add('active');
                }
            });
        }, { root: container, threshold: 0.5 });

        cards.forEach(card => observer.observe(card));
    },

    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.checkMobile();
                if (!wasMobile && this.isMobile) {
                    this.setupCarousels();
                }
            }, 250);
        }, { passive: true });
    }
};

// ==========================================
// PERFORMANCE MANAGER - OPTIMIZED
// ==========================================
const PerformanceManager = {
    isLowPower: false,
    observers: [],

    init() {
        this.detectLowPowerDevice();
        this.setupIntersectionObserverOptimization();
        this.setupAnimationOptimization();
    },

    detectLowPowerDevice() {
        const checks = [
            navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4,
            navigator.deviceMemory && navigator.deviceMemory <= 4,
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ];

        if (checks.some(check => check)) {
            this.enableLowPowerMode();
        }
    },

    setupIntersectionObserverOptimization() {
        // Use a single observer for all scroll animations
        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.1, rootMargin: '50px' });

        // Observe all animatable elements
        document.querySelectorAll('.about-card, .timeline-item, .project-cinema-card, .insight-card').forEach(el => {
            this.scrollObserver.observe(el);
        });
    },

    setupAnimationOptimization() {
        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.classList.add('animations-paused');
            } else {
                document.body.classList.remove('animations-paused');
            }
        });
    },

    enableLowPowerMode() {
        if (this.isLowPower) return;
        this.isLowPower = true;

        console.log('⚡ PerformanceManager: Low Power Mode Enabled');
        document.body.classList.add('low-power');

        // Disable heavy effects
        const style = document.createElement('style');
        style.textContent = `
                    .low-power .glow-particle,
                    .low-power .hero-bubble,
                    .low-power .ambient-bg,
                    .low-power .hero-micro-bubbles {
                        display: none !important;
                    }
                    .low-power * {
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition: none !important;
                    }
                    .low-power .glitch-name::before,
                    .low-power .glitch-name::after {
                        display: none !important;
                    }
                `;
        document.head.appendChild(style);
    }
};

// ==========================================
//  FIX 1: INTELLIGENT NAME MORPH CONTROLLER
//  Crossfade between pre-rendered states - no layout shift
// ==========================================
// Initialize Phase 3 Systems
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SoundManager.init();
        PerformanceManager.init();
    });
} else {
    SoundManager.init();
    PerformanceManager.init();
}
// Enhanced Dock Active State Logic
const dockItems = document.querySelectorAll('.mobile-dock-item');
const sections = document.querySelectorAll('section');
let dockInitialized = false;

// Prevent auto-scroll jumps on load
setTimeout(() => {
    dockInitialized = true;
}, 2500);

// Config for observer
const observerConfig = {
    root: null,
    rootMargin: '-45% 0px -45% 0px', // Active when element is in the middle 10% of screen
    threshold: 0
};

const dockObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            // Only update if we found a matching dock item
            dockItems.forEach(item => {
                if (item.getAttribute('href') === `#${id}`) {
                    // Remove active class from all
                    dockItems.forEach(i => i.classList.remove('active'));
                    // Add to current
                    item.classList.add('active');

                    // Only auto-scroll after initialization to prevent jump on load
                    if (dockInitialized) {
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }
            });
        }
    });
}, observerConfig);

sections.forEach(section => dockObserver.observe(section));

// Scroll Hint Logic
const dock = document.querySelector('.mobile-dock');
const wrapper = document.querySelector('.mobile-dock-wrapper');

// Initial shake (using class instead of inline style for cleaner separation)
setTimeout(() => {
    if (dock) dock.style.animation = 'dockShake 1.2s ease forwards';
}, 1500);

if (dock && wrapper) {
    dock.addEventListener('scroll', () => {
        if (dock.scrollLeft > 10) {
            wrapper.classList.add('scrolled');
        } else {
            wrapper.classList.remove('scrolled');
        }
    }, { passive: true });
}
// ==========================================
// SMART ANIMATIONS SYSTEM
// ==========================================
const SmartAnimations = {
    init() {
        this.initMagneticButtons();
        this.initTextScramble();
        this.initScrollProgress();
        this.initFloatingElements();
        console.log("✓ Smart Animations initialized");
    },

    // Subtle hover lift effect (removed magnetic drag)
    initMagneticButtons() {
        // Disabled - magnetic effect was too distracting
        // Now using simple CSS hover transitions instead
    },

    // Text scramble effect on scroll into view (down only)
    initTextScramble() {
        const chars = '!<>-_\\/[]{}—=+*^?#________';
        const elements = document.querySelectorAll('.section-title');

        elements.forEach(el => {
            const originalText = el.textContent;
            let hasAnimated = false;

            // Use IntersectionObserver to trigger only when scrolling down into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // Only animate when coming into view from below (scrolling down)
                    if (entry.isIntersecting && !hasAnimated && entry.boundingClientRect.top > 0) {
                        hasAnimated = true;
                        let iteration = 0;

                        const interval = setInterval(() => {
                            el.textContent = originalText
                                .split('')
                                .map((char, index) => {
                                    if (index < iteration) return originalText[index];
                                    return chars[Math.floor(Math.random() * chars.length)];
                                })
                                .join('');

                            iteration += 1;
                            if (iteration >= originalText.length) {
                                clearInterval(interval);
                                el.textContent = originalText;
                            }
                        }, 20);

                        // Stop observing after animation
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(el);
        });
    },

    // Scroll progress indicator
    initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
        document.body.appendChild(progressBar);

        const bar = progressBar.querySelector('.scroll-progress-bar');

        // Efficiently update progress bar using Lenis if available
        if (typeof lenis !== 'undefined') {
            lenis.on('scroll', (e) => {
                const scrollPercent = (e.scroll / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                bar.style.width = scrollPercent + '%';
            });
        } else {
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const scrollTop = window.scrollY;
                        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                        const scrollPercent = (scrollTop / docHeight) * 100;
                        bar.style.width = scrollPercent + '%';
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    },

    // Floating elements animation - DISABLED
    initFloatingElements() {
        // Disabled to reduce motion
    },

};

// Initialize Smart Animations
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SmartAnimations.init());
} else {
    SmartAnimations.init();
}
// Final safety refresh for ScrollTrigger after all assets and scripts are loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
            console.log('✓ ScrollTrigger final refresh complete');
        }
    }, 1000);
});
