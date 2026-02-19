
document.addEventListener('DOMContentLoaded', () => {
    // Only run on mobile
    if (window.innerWidth > 768) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('story-visible');
                // Optional: Stop observing once visible for one-time animation
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Elements to animate
    const elements = document.querySelectorAll('.hero-title, .hero-subtitle, .about-card, .timeline-item, .project-cinema-card, .skill-category, .section-title');

    elements.forEach(el => observer.observe(el));
});
