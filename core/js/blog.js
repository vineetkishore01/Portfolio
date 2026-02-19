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

        // GitHub API Config
        this.repo = "vineetkishore01/Portfolio";
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
                this.grid.innerHTML = '<div class="blog-error">System offline. Data streams interrupted.</div>';
            }
        }
    },

    async loadArticles() {
        // Check cache first (sha-based)
        const cache = JSON.parse(localStorage.getItem('blog_cache') || '{}');
        const now = Date.now();

        try {
            const apiResp = await fetch(`https://api.github.com/repos/${this.repo}/contents/${this.path}`);
            const files = await apiResp.json();

            if (!Array.isArray(files)) throw new Error('Could not list folder');

            const mdFiles = files.filter(f => f.name.endsWith('.md') && f.size > 0);

            this.posts = await Promise.all(mdFiles.map(async file => {
                // If we have valid cache for this SHA, use it
                if (cache[file.sha] && cache[file.sha].expires > now) {
                    return cache[file.sha].data;
                }

                // Otherwise, fetch and parse metadata
                const post = await this.parseMetadata(file);

                // Cache it
                cache[file.sha] = {
                    expires: now + (1000 * 60 * 60 * 24), // 24hr cache
                    data: post
                };
                return post;
            }));

            localStorage.setItem('blog_cache', JSON.stringify(cache));

            // Sort by date descending by default
            this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.filteredPosts = [...this.posts];

        } catch (e) {
            console.warn('BlogEngine: API error or local env, falling back to cache if available', e);
            this.posts = Object.values(cache).map(c => c.data);
            if (this.posts.length === 0) throw e;
        }
    },

    async parseMetadata(file) {
        try {
            const resp = await fetch(file.download_url);
            const text = await resp.text();

            // Basic extraction
            const titleMatch = text.match(/^#\s+(.*)/m);
            const title = titleMatch ? titleMatch[1].trim() : file.name.replace('.md', '');

            // Try to find a date in the text YYYY-MM-DD
            const dateMatch = text.match(/Date:\s*(\w+\s+\d{1,2},?\s+\d{4})/i) ||
                text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i) ||
                text.match(/20\d{2}-\d{2}-\d{2}/);

            // Fallback: extract date from filename if exists, else use current
            const fileDateMatch = file.name.match(/(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : (fileDateMatch ? fileDateMatch[1] : new Date().toLocaleDateString('en-CA'));

            // Excerpt: first non-empty line after title
            const lines = text.split('\n').filter(l =>
                l.trim() !== '' &&
                !l.startsWith('#') &&
                !l.match(/^Date:/i) &&
                !l.match(/^Category:/i) &&
                !l.match(/^---/)
            );
            // Excerpt: strip markdown and extract first clean line
            const rawExcerpt = lines[0] || "A deep dive into technical implementation and discovery.";
            const excerpt = this.stripMarkdown(rawExcerpt).substring(0, 180).trim() + (rawExcerpt.length > 180 ? '...' : '');

            return {
                slug: encodeURIComponent(file.name), // Use filename as slug
                title,
                date,
                readTime: this.estimateReadTime(text),
                excerpt,
                file: file.name
            };
        } catch (e) {
            return {
                slug: encodeURIComponent(file.name),
                title: file.name,
                date: new Date().toISOString().split('T')[0],
                readTime: "5 min",
                excerpt: "Failed to parse article metadata.",
                file: file.name
            };
        }
    },

    stripMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
            .replace(/\*(.*?)\*/g, '$1')     // Italics
            .replace(/`(.*?)`/g, '$1')       // Code
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
            .replace(/#+\s+/g, '')           // Headers
            .trim();
    },

    estimateReadTime(text) {
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / 225);
        return `${minutes} min`;
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
