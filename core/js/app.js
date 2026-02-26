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
// Core Entrance Animation - defined globally for access
function initHeroEntrance() {
    document.documentElement.classList.remove('js-loading');
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
    heroTl.from('#name-container', {
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

    // Step 6: Stats with Count-up - ONLY if they exist
    const stats = document.querySelectorAll('.hero-stat');
    if (stats.length > 0) {
        heroTl.from(stats, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            onComplete: () => {
                document.querySelectorAll('.hero-stat-value').forEach(el => {
                    const text = el.textContent.trim();
                    const value = parseFloat(text.replace(/[^\d.]/g, ''));
                    const suffix = text.replace(/[\d.]/g, '');
                    if (!isNaN(value)) animateNumber(el, value, suffix);
                });
            }
        }, 1.1);
    }

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
        ease: 'power3.out'
    }, 0.8);
}

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

// Preloader safety removal
const preloader = document.getElementById('preloader');
if (preloader) preloader.style.display = 'none';
document.body.classList.remove('unselectable');

// ==========================================
// LENIS SMOOTH SCROLL - SAFE INIT
// ==========================================
let lenis;
try {
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (typeof Lenis !== 'undefined' && !isMobile) {
        lenis = new Lenis({
            duration: 0.7,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            lerp: 0.1,
            wheelMultiplier: 1.2,
            touchMultiplier: 1.5,
            smooth: true
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                lenis.scrollTo(targetId, {
                    duration: 0.8,
                    offset: -60,
                    onComplete: () => {
                        ScrollTrigger.refresh();
                    }
                });
            });
        });

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        console.log("✓ Lenis Smooth Scroll initialized (Desktop Mode)");
    } else {
        console.warn("Lenis disabled on mobile/touch - fallback to native high-performance scroll");
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.classList.add('ios-native-scroll');
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
// NAVIGATION SCROLL EFFECT
// ==========================================
const NavigationScrollEffect = {
    init() {
        this.nav = document.getElementById('nav');
        if (!this.nav) return;
        this.threshold = 50;
        this.isScrolled = false;
        this.setupEventListeners();
        this.checkScroll();
        console.log('NavigationScrollEffect: Initialized successfully');
    },
    setupEventListeners() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
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
        }
    }
};

// ==========================================
// MOBILE MENU
// ==========================================
const MobileMenu = {
    init(retries = 3) {
        this.toggle = document.getElementById('menu-toggle');
        this.navLinks = document.getElementById('nav-links');
        this.body = document.body;
        if (!this.toggle || !this.navLinks) {
            if (retries > 0) setTimeout(() => this.init(retries - 1), 100);
            return;
        }
        this.isOpen = false;
        this.setupEventListeners();
        console.log('MobileMenu: Initialized successfully 🚀');
    },
    setupEventListeners() {
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });
        this.navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                this.closeMenu();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.closeMenu();
        });
    },
    toggleMenu() { this.isOpen ? this.closeMenu() : this.openMenu(); },
    openMenu() {
        this.isOpen = true;
        this.navLinks.classList.add('active');
        this.toggle.classList.add('active');
        this.body.style.overflow = 'hidden';
    },
    closeMenu() {
        this.isOpen = false;
        this.navLinks.classList.remove('active');
        this.toggle.classList.remove('active');
        this.body.style.overflow = '';
    }
};

// ==========================================
// SECTION CHOREOGRAPHY
// ==========================================
gsap.registerPlugin(ScrollTrigger);
const SectionChoreography = {
    init() {
        if (typeof gsap === 'undefined') return;
        this.setupAbout();
        this.setupExperience();
        this.setupProjects();
        this.setupSkills();
        this.setupEducation();
    },
    setupAbout() {
        gsap.timeline({ scrollTrigger: { trigger: '.about', start: 'top 85%', toggleActions: 'play none none none' } })
            .from('.about .section-header > *', { y: 30, duration: 0.6, stagger: 0.1, clearProps: 'all' })
            .from('.about-card', { y: 50, duration: 0.8, stagger: 0.15, clearProps: 'all' }, '-=0.4');
    },
    setupExperience() {
        document.querySelectorAll('.timeline-item').forEach((item, i) => {
            gsap.from(item, { x: i % 2 === 0 ? -50 : 50, duration: 0.8, scrollTrigger: { trigger: item, start: 'top 95%' }, clearProps: 'all' });
        });
    },
    setupProjects() {
        gsap.timeline({ scrollTrigger: { trigger: '.projects', start: 'top 80%' } })
            .from('.projects .section-header > *', { y: 30, stagger: 0.1, clearProps: 'all' })
            .from('.project-cinema-card', { y: 40, duration: 1, stagger: 0.15, clearProps: 'all' });
    },
    setupSkills() {
        gsap.from('.skill-category', { x: -40, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: '.skills-grid', start: 'top 95%' }, clearProps: 'all' });
    },
    setupEducation() {
        gsap.from('.education-card', { y: 40, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: '.education-grid', start: 'top 90%' }, clearProps: 'all' });
    }
};

// ==========================================
// HERO WATER BUBBLE
// ==========================================
const HeroWaterBubble = {
    init() {
        this.container = document.getElementById('hero-image-container');
        if (!this.container) return;
        this.colorImage = document.getElementById('hero-color-image');
        this.bubble = document.getElementById('hero-bubble');
        if (!this.colorImage || !this.bubble) return;
        this.currentX = 0; this.currentY = 0; this.targetX = 0; this.targetY = 0;
        this.isHovering = false; this.rafId = null;
        this.setupEventListeners();
    },
    setupEventListeners() {
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.targetX = e.clientX - rect.left;
            this.targetY = e.clientY - rect.top;
            if (!this.isHovering) { this.isHovering = true; this.animate(); }
        });
        this.container.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.colorImage.style.clipPath = 'circle(0% at 50% 50%)';
        });
    },
    animate() {
        if (!this.isHovering) return;
        this.currentX += (this.targetX - this.currentX) * 0.18;
        this.currentY += (this.targetY - this.currentY) * 0.18;
        this.bubble.style.left = `${this.currentX}px`;
        this.bubble.style.top = `${this.currentY}px`;
        this.colorImage.style.clipPath = `circle(100px at ${this.currentX}px ${this.currentY}px)`;
        this.rafId = requestAnimationFrame(() => this.animate());
    }
};

// ==========================================
// PROJECT FILTERS
// ==========================================
const ProjectFilterSystem = {
    init() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-cinema-card');
        if (!this.filterButtons.length) return;
        this.filterButtons.forEach(btn => btn.addEventListener('click', () => this.applyFilter(btn.getAttribute('data-filter'), btn)));
    },
    applyFilter(filter, activeBtn) {
        this.projectCards.forEach(card => {
            const visible = filter === 'all' || card.getAttribute('data-category') === filter;
            card.style.display = visible ? 'block' : 'none';
        });
        if (activeBtn) {
            this.filterButtons.forEach(b => b.classList.remove('active'));
            activeBtn.classList.add('active');
        }
    }
};

// ==========================================
// SMART ANIMATIONS
// ==========================================
const SmartAnimations = {
    init() {
        this.initTextScramble();
        this.initKineticText();
        console.log("✓ Smart Animations initialized");
    },
    initTextScramble() {
        const chars = '!<>-_\\/[]{}—=+*^?#________';
        document.querySelectorAll('.section-title').forEach(el => {
            const originalText = el.textContent;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        let iteration = 0;
                        const interval = setInterval(() => {
                            el.textContent = originalText.split('').map((c, i) => i < iteration ? originalText[i] : chars[Math.floor(Math.random() * chars.length)]).join('');
                            if (iteration >= originalText.length) {
                                clearInterval(interval);
                                el.textContent = originalText;
                            }
                            iteration += 1 / 3; // Slower reveal looks cooler and fixes truncation
                        }, 20);
                        observer.unobserve(el);
                    }
                });
            });
            observer.observe(el);
        });
    },
    initKineticText() {
        document.querySelectorAll('.kinetic-text').forEach(el => {
            const span = el.querySelector('span');
            if (span) {
                gsap.to(span, {
                    x: '-30vw',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            }
        });
    }
};

// ==========================================
// NAME MORPH CONTROLLER
// ==========================================
const NameMorphController = {
    names: [],
    currentIndex: 0,
    interval: null,
    isVisible: true,
    init() {
        this.names = document.querySelectorAll('.glitch-name');
        if (!this.names.length) return;
        this.start();
        document.addEventListener('visibilitychange', () => document.hidden ? this.pause() : this.resume());
        const obs = new IntersectionObserver(e => this.isVisible = e[0].isIntersecting);
        const container = document.getElementById('name-container');
        if (container) obs.observe(container);
        console.log("✓ Name Morph Controller initialized. Languages count:", this.names.length);
    },
    start() { this.interval = setInterval(() => this.morph(), 4000); },
    pause() { clearInterval(this.interval); this.interval = null; },
    resume() { if (this.isVisible && !this.interval) this.start(); },
    morph() {
        if (this.names.length < 2) return;
        const current = this.names[this.currentIndex];
        const nextIndex = (this.currentIndex + 1) % this.names.length;
        const next = this.names[nextIndex];

        // Trigger digital glitch and scanline pass
        current.classList.add('transitioning');
        current.classList.add('transitioning-scan');
        next.classList.add('transitioning');

        // Crossfade: new name enters while old exits
        requestAnimationFrame(() => {
            current.classList.remove('active');
            next.classList.add('active');

            // Clean up after transition (400ms matching CSS animation duration)
            setTimeout(() => {
                current.classList.remove('transitioning');
                current.classList.remove('transitioning-scan');
                next.classList.remove('transitioning');
            }, 400);
        });

        this.currentIndex = nextIndex;
    }
};
window.NameMorphController = NameMorphController;

// ==========================================
// MOBILE DOCK NAV
// ==========================================
const MobileDock = {
    init() {
        this.items = document.querySelectorAll('.mobile-dock-item');
        this.sections = document.querySelectorAll('section[id]');
        if (!this.items.length) return;
        this.setupEventListeners();
    },
    setupEventListeners() {
        this.items.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetId = item.getAttribute('href');
                if (targetId.startsWith('#')) {
                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        if (typeof lenis !== 'undefined' && lenis) {
                            lenis.scrollTo(targetId, { duration: 0.8, offset: -20 });
                        } else {
                            window.scrollTo({
                                top: target.offsetTop - 20,
                                behavior: 'smooth'
                            });
                        }
                        this.items.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        if (navigator.vibrate) navigator.vibrate(5);
                    }
                }
            });
        });

        // Update active on scroll
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollPos = window.scrollY + 100;
                    this.sections.forEach(section => {
                        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                            this.items.forEach(item => {
                                item.classList.remove('active');
                                if (item.getAttribute('href') === `#${section.id}`) {
                                    item.classList.add('active');
                                }
                            });
                        }
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
};

// ==========================================
// MOBILE SCROLL ANIMATIONS (IntersectionObserver)
// ==========================================
const MobileScrollAnimations = {
    init() {
        // Only enable on mobile (Cross-Cutting Improvement J)
        if (window.innerWidth > 800) return;

        this.observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optionally unobserve after animation
                    // this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.observeElements();

        // Also observe section headers
        this.observeHeaders();

        console.log('MobileScrollAnimations: Initialized successfully');
    },
    observeElements() {
        const mobileElements = document.querySelectorAll(
            '.about-card, .timeline-item, .project-cinema-card, .skill-category, .education-card, .insight-card'
        );
        mobileElements.forEach(el => this.observer.observe(el));
    },
    observeHeaders() {
        const headers = document.querySelectorAll('.section-header');
        headers.forEach(el => this.observer.observe(el));
    }
};

// ==========================================
// UNIFIED INITIALIZATION
// ==========================================
const InitializationManager = {
    init() {
        console.log('%c🚀 Initializing Portfolio Core...', 'color: #007AFF; font-weight: bold;');
        initHeroEntrance();

        // Initialize mobile scroll animations (only on mobile)
        if (window.innerWidth <= 800) {
            MobileScrollAnimations.init();
        }

        const modules = [
            { name: 'NameMorphController', obj: NameMorphController },
            { name: 'SmartAnimations', obj: SmartAnimations },
            { name: 'MobileMenu', obj: MobileMenu },
            { name: 'NavigationScrollEffect', obj: NavigationScrollEffect },
            { name: 'ProjectFilterSystem', obj: ProjectFilterSystem },
            { name: 'HeroWaterBubble', obj: HeroWaterBubble },
            { name: 'SectionChoreography', obj: SectionChoreography },
            { name: 'MobileDock', obj: MobileDock }
        ];
        modules.forEach(m => {
            if (m.obj && typeof m.obj.init === 'function') {
                try { m.obj.init(); } catch (err) { console.error(`❌ ${m.name} failed:`, err); }
            }
        });
        console.log('%c👋 Welcome!', 'color: #007AFF; font-size: 20px; font-weight: bold;');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InitializationManager.init());
} else {
    InitializationManager.init();
}
