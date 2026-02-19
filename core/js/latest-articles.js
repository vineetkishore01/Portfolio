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
        this.path = "blogs";

        try {
            const posts = await this.fetchLatestPosts();
            if (posts.length > 0) {
                this.render(posts);
            } else {
                this.container.innerHTML = '<div class="insight-loading">No articles at the moment. check back soon!</div>';
            }
        } catch (error) {
            console.warn('LatestArticles: Could not fetch posts', error);
            this.container.innerHTML = '<div class="insight-loading">Unable to load articles.</div>';
        }
    },

    async fetchLatestPosts() {
        // Check cache first
        const cache = JSON.parse(localStorage.getItem('blog_cache') || '{}');
        const now = Date.now();
        let posts = [];

        try {
            // Try fetching list
            const apiResp = await fetch(`https://api.github.com/repos/${this.repo}/contents/${this.path}`);
            const files = await apiResp.json();

            if (!Array.isArray(files)) throw new Error('Could not list folder');

            const mdFiles = files.filter(f => f.name.endsWith('.md') && f.size > 0);

            posts = await Promise.all(mdFiles.map(async file => {
                if (cache[file.sha] && cache[file.sha].expires > now) {
                    return cache[file.sha].data;
                }
                const post = await this.parseMetadata(file);
                cache[file.sha] = { expires: now + (1000 * 60 * 60 * 24), data: post };
                return post;
            }));

            localStorage.setItem('blog_cache', JSON.stringify(cache));

        } catch (e) {
            // Fallback to cache
            posts = Object.values(cache).map(c => c.data);
        }

        // Sort by date desc
        return posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
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
            <article class="insight-card" onclick="window.location.href='blog-post.html?slug=${post.slug}'">
                <div class="insight-category">${post.category}</div>
                <h3 class="insight-title">${post.title}</h3>
                <p class="insight-excerpt">${post.excerpt}</p>
                <div class="insight-meta">
                    <span>${post.readTime}</span>
                    <a href="blog-post.html?slug=${post.slug}" class="insight-link">Read Article →</a>
                </div>
            </article>
        `).join('');

        // Re-run animations if needed, though usually standard CSS hover works fine
    }
};

document.addEventListener('DOMContentLoaded', () => LatestArticles.init());
