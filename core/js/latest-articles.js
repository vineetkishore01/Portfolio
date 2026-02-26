/**
 * LATEST ARTICLES LOADER
 * Fetches the latest 3 blog posts from GitHub and updates the home page.
 */

const LatestArticles = {
    async init() {
        console.log('LatestArticles: Initializing...');
        this.container = document.querySelector('.insights-grid');
        if (!this.container) return;

        // GitHub API Config
        this.repo = "vineetkishore01/Portfolio";
        this.path = "articles/blogs";

        try {
            const posts = await this.fetchLatestPosts();
            if (posts.length > 0) {
                this.render(posts);
            } else {
                this.container.innerHTML = '<div class="insight-loading">No articles at the moment. check back soon!</div>';
            }
        } catch (error) {
            console.error('LatestArticles: Error loading posts:', error);
            if (this.container) {
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                this.container.innerHTML = `<div class="insight-error" style="color: var(--text-secondary); text-align: center; padding: 2rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                    API stream interrupted.
                    ${isLocal ? '<br><small style="color:var(--accent-blue); display:block; margin-top:0.5rem; font-size:0.7rem; font-family:monospace;">Dev Hint: GitHub API 403/404. Push your "articles/blogs" folder to GitHub to sync the content.</small>' : ''}
                </div>`;
            }
        }
    },

    async fetchLatestPosts() {
        try {
            const response = await fetch(`${this.path}/index.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const posts = await response.json();
            return posts.slice(0, 3);
        } catch (e) {
            console.error('LatestArticles: Failed to load index.json', e);
            throw e;
        }
    },

    async parseMetadata(file) {
        try {
            const resp = await fetch(file.download_url);
            const text = await resp.text();

            const titleMatch = text.match(/^#\s+(.*)/m);
            const title = titleMatch ? titleMatch[1].trim() : file.name.replace('.md', '');

            const dateMatch = text.match(/Date:\s*(\w+\s+\d{1,2},?\s+\d{4})/i) ||
                text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i) ||
                text.match(/20\d{2}-\d{2}-\d{2}/);
            const fileDateMatch = file.name.match(/(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : (fileDateMatch ? fileDateMatch[1] : new Date().toLocaleDateString('en-CA'));

            // Cat match removed/ignored as per request, just getting basic info
            const catMatch = text.match(/Category:\s*(.*)/i);
            const category = catMatch ? catMatch[1].trim() : "Technical";


            // Excerpt
            const lines = text.split('\n').filter(l =>
                l.trim() !== '' &&
                !l.startsWith('#') &&
                !l.match(/^Date:/i) &&
                !l.match(/^Category:/i) &&
                !l.match(/^---/)
            );
            const rawExcerpt = lines[0] || "A deep dive into technical implementation.";
            const excerpt = this.stripMarkdown(rawExcerpt).substring(0, 120) + '...';

            return {
                title,
                date,
                category,
                readTime: this.estimateReadTime(text),
                excerpt,
                slug: encodeURIComponent(file.name)
            };
        } catch (e) {
            return {
                title: file.name,
                date: new Date().toISOString().split('T')[0],
                category: "Technical",
                readTime: "5 min",
                excerpt: "...",
                slug: encodeURIComponent(file.name)
            };
        }
    },

    stripMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/#+\s+/g, '')
            .trim();
    },

    estimateReadTime(text) {
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / 225);
        return `${minutes} min read`;
    },

    render(posts) {
        this.container.innerHTML = posts.map(post => `
            <article class="insight-card" onclick="window.location.href='articles/blog-post.html?slug=${post.slug}'" onpointerenter="LatestArticles.prefetch('${post.slug}')">
                <div class="insight-category">${post.category}</div>
                <h3 class="insight-title">${post.title}</h3>
                <p class="insight-excerpt">${post.excerpt}</p>
                <div class="insight-meta">
                    <span>${post.readTime}</span>
                    <a href="articles/blog-post.html?slug=${post.slug}" class="insight-link">Read Article →</a>
                </div>
            </article>
        `).join('');

        // Re-run animations if needed, though usually standard CSS hover works fine
    },

    prefetch(slug) {
        if (!window.prefetchedPosts) window.prefetchedPosts = new Set();
        if (window.prefetchedPosts.has(slug)) return;
        window.prefetchedPosts.add(slug);

        try {
            const decodedSlug = decodeURIComponent(slug);
            const url = `articles/blogs/${decodedSlug}`;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            link.as = 'fetch';
            document.head.appendChild(link);
            console.log('Prefetching:', decodedSlug);
        } catch (e) { /* ignore */ }
    }
};

document.addEventListener('DOMContentLoaded', () => LatestArticles.init());
