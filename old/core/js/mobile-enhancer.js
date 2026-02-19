/**
 * Mobile Portfolio - Clean Design
 */

(function() {
    'use strict';

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    // Stop glitch animation
    function init() {
        stopGlitchAnimation();
        initDock();
        initScroll();
        initFilters();
        initModal();
        initContact();
    }

    function stopGlitchAnimation() {
        // Stop name cycling
        if (window.nameCycleInterval) {
            clearInterval(window.nameCycleInterval);
        }
        
        // Show only first name, hide others
        const glitchNames = document.querySelectorAll('.glitch-name');
        glitchNames.forEach((name, index) => {
            if (index === 0) {
                name.classList.add('active');
                name.style.cssText = 'display: block !important; position: relative !important; opacity: 1 !important; transform: none !important; filter: none !important; animation: none !important;';
            } else {
                name.style.display = 'none !important';
            }
        });
    }

    // Dock navigation
    function initDock() {
        const items = document.querySelectorAll('.mobile-dock-item');
        const sections = document.querySelectorAll('section[id]');

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(item.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 20,
                        behavior: 'smooth'
                    });
                    
                    items.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    if (navigator.vibrate) navigator.vibrate(5);
                }
            });
        });

        // Update active on scroll
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollPos = window.scrollY + 100;
                    sections.forEach(section => {
                        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                            items.forEach(item => {
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

    // Scroll animations
    function initScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.about-card, .timeline-card, .project-cinema-card, .skill-category, .education-card, .insight-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(15px)';
            el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            observer.observe(el);
        });
    }

    // Project filters
    function initFilters() {
        const buttons = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.project-cinema-card');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                cards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Project modal
    function initModal() {
        const nexus = document.getElementById('project-nexus');
        const closeBtn = document.getElementById('nexus-close');
        
        if (!nexus) return;

        document.querySelectorAll('.project-cinema-card').forEach(card => {
            card.addEventListener('click', () => {
                nexus.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const close = () => {
            nexus.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', close);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    }

    // Contact copy
    function initContact() {
        document.querySelectorAll('.contact-card[data-copy]').forEach(card => {
            card.addEventListener('click', async (e) => {
                const href = card.getAttribute('href');
                if (href?.startsWith('http') || href?.startsWith('mailto:')) return;
                
                e.preventDefault();
                const text = card.getAttribute('data-copy');
                
                try {
                    await navigator.clipboard.writeText(text);
                    if (navigator.vibrate) navigator.vibrate(10);
                } catch (err) {
                    console.error('Copy failed:', err);
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
