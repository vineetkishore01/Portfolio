/**
 * BLOG LISTING ENGINE
 * Fetches blogs/index.json and renders post cards with filtering & sorting.
 */

const BlogEngine = {
    async init() {
        console.log('BlogEngine: Initializing Auto-Discovery...');
        this.grid = document.getElementById('blog-grid');
        this.sortSelect = document.getElementById('blog-sort-select');
        this.paginationContainer = document.getElementById('blog-pagination');

        // Directory Paths
        this.path = "blogs";

        this.posts = [];
        this.filteredPosts = [];
        this.currentPage = 1;
        this.postsPerPage = 12;

        try {
            await this.loadArticles();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('BlogEngine: Fatal error:', error);
            if (this.grid) {
                const isLocal = window.location.protocol === 'file:';
                this.grid.innerHTML = `<div class="blog-error">
                    System offline. Data streams interrupted.
                    ${isLocal ? '<br><small style="color:var(--accent-blue); display:block; margin-top:1rem; font-family:monospace;">Dev Hint: You are viewing this via the file:// protocol. Browsers restrict fetch() for local files. Please use a local web server (e.g., Live Server) to preview articles properly.</small>' : ''}
                </div>`;
            }
        }
    },

    async loadArticles() {
        try {
            const response = await fetch(`${this.path}/index.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            this.posts = await response.json();

            // Sort by date descending by default
            this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.filteredPosts = [...this.posts];

        } catch (e) {
            console.error('BlogEngine: Failed to load index.json', e);
            throw e;
        }
    },

    setupEventListeners() {
        // Sorting
        this.sortSelect.addEventListener('change', () => {
            this.sortPosts(this.sortSelect.value);
        });
    },

    sortPosts(method) {
        switch (method) {
            case 'latest':
                this.filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                this.filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'alphabetical':
                this.filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        this.render();
    },

    render() {
        if (!this.grid) return;

        // Pagination slice
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const paginatedPosts = this.filteredPosts.slice(startIndex, endIndex);

        if (paginatedPosts.length === 0) {
            this.grid.innerHTML = '<div class="blog-empty">No articles found.</div>';
            this.paginationContainer.innerHTML = '';
            return;
        }

        this.grid.innerHTML = paginatedPosts.map(post => this.createCard(post)).join('');
        this.renderPagination();

        // Entry animation - clear previous and animate in cleanly
        gsap.killTweensOf('.blog-card');
        gsap.fromTo('.blog-card',
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power4.out',
                clearProps: "all" // Ensures the inline opacities don't get stuck
            }
        );
    },

    createCard(post) {
        return `
            <a href="blog-post.html?slug=${post.slug}" class="blog-card">
                <div class="blog-card-meta">
                    <span class="blog-card-date">${this.formatDate(post.date)}</span>
                </div>
                <h2 class="blog-card-title">${post.title}</h2>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-footer">
                    <span>Read Article</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </div>
            </a>
        `;
    },

    renderPagination() {
        const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
        if (totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="BlogEngine.goToPage(${i})">${i}</button>`;
        }
        this.paginationContainer.innerHTML = html;
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    formatDate(dateStr) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }
};

// Global accessor for pagination buttons
window.BlogEngine = BlogEngine;

document.addEventListener('DOMContentLoaded', () => BlogEngine.init());
