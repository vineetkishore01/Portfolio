/**
 * BLOG POST READER ENGINE
 * Parses URL params, fetches markdown, and renders it using marked.js.
 */

const PostReader = {
    async init() {
        console.log('PostReader: Initializing Dynamic Loader...');

        const params = new URLSearchParams(window.location.search);
        const rawSlug = params.get('slug');
        this.currentSlug = rawSlug ? decodeURIComponent(rawSlug) : null;

        if (!this.currentSlug) {
            window.location.href = 'blog.html';
            return;
        }

        // GitHub API Config (for neighbor discovery)
        this.repo = "vineetkishore01/Portfolio";
        this.path = "blogs";

        try {
            // 1. Fetch the markdown file directly
            // Ensure spaces and special chars are encoded for the fetch
            const safePath = `blogs/${encodeURIComponent(this.currentSlug)}`;
            const postResponse = await fetch(safePath);
            if (!postResponse.ok) throw new Error('File not found');
            const markdown = await postResponse.text();

            // 2. Parse metadata from content
            const post = this.parseMetadataFromContent(markdown, this.currentSlug);
            this.updateMetadata(post);

            // 3. Render
            this.renderMarkdown(markdown);

            // 4. Setup scroll progress & Share logic
            this.setupScrollProgress();
            this.setupShare(post);

            // 5. Setup Navigation (Neighbor Discovery)
            this.setupNavigation();

            console.log(`PostReader: Successfully rendered "${post.title}"`);
        } catch (error) {
            console.error('PostReader: Error:', error);
            this.renderError('Failed to load article. It might have been relocated or renamed.');
        }
    },

    parseMetadataFromContent(text, filename) {
        const titleMatch = text.match(/^#\s+(.*)/m);
        const title = titleMatch ? titleMatch[1].trim() : filename.replace('.md', '');

        const dateMatch = text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i) || text.match(/20\d{2}-\d{2}-\d{2}/);
        const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];



        return {
            title,
            date,

            readTime: this.estimateReadTime(text),
            slug: encodeURIComponent(filename)
        };
    },

    estimateReadTime(text) {
        const words = text.split(/\s+/).length;
        return `${Math.ceil(words / 225)} min`;
    },

    async setupNavigation() {
        const prevBtn = document.getElementById('prev-post-btn');
        const nextBtn = document.getElementById('next-post-btn');
        if (!prevBtn && !nextBtn) return;

        try {
            // Check cache first
            const cache = JSON.parse(localStorage.getItem('blog_cache') || '{}');
            let posts = Object.values(cache).map(c => c.data).sort((a, b) => new Date(b.date) - new Date(a.date));

            // If cache empty, we can optionaly fetch list, but usually the user comes from blog.html which populates it
            if (posts.length === 0) {
                const apiResp = await fetch(`https://api.github.com/repos/${this.repo}/contents/${this.path}`);
                const files = await apiResp.json();
                posts = files.filter(f => f.name.endsWith('.md')).map(f => ({ slug: encodeURIComponent(f.name), file: f.name }));
            }

            const currentIndex = posts.findIndex(p => p.file === this.currentSlug || p.slug === encodeURIComponent(this.currentSlug));

            if (currentIndex > 0) {
                const prevPost = posts[currentIndex - 1];
                prevBtn.href = `blog-post.html?slug=${prevPost.slug}`;
                prevBtn.style.display = 'inline-flex';
            }
            if (currentIndex < posts.length - 1 && currentIndex !== -1) {
                const nextPost = posts[currentIndex + 1];
                nextBtn.href = `blog-post.html?slug=${nextPost.slug}`;
                nextBtn.style.display = 'inline-flex';
            }
        } catch (e) {
            console.warn('PostReader: Could not load navigation', e);
        }
    },

    updateMetadata(post) {
        document.title = `${post.title} | Vineet Kishore`;
        document.getElementById('post-title').textContent = post.title;

        document.getElementById('post-date').textContent = this.formatDate(post.date);
        document.getElementById('post-read-time').textContent = post.readTime;
    },

    renderMarkdown(markdown) {
        const contentArea = document.getElementById('post-content');
        if (!contentArea || typeof marked === 'undefined') return;

        // Configure marked options
        marked.setOptions({
            highlight: function (code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });

        // Strip the first H1 from markdown content to avoid duplication with our custom header
        const cleanMarkdown = markdown.replace(/^#\s+.*\n?/, '');
        contentArea.innerHTML = marked.parse(cleanMarkdown);

        // Highlight logic for code blocks
        document.querySelectorAll('pre code').forEach((el) => {
            hljs.highlightElement(el);
        });

        // Entrance animation
        gsap.from('.post-header > *', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out'
        });

        gsap.from('.blog-prose > *', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power3.out',
            delay: 0.4
        });
    },

    setupScrollProgress() {
        const sideBar = document.getElementById('side-progress-bar');
        if (!sideBar) return;

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;

            sideBar.style.height = scrolled + "%";
        }, { passive: true });
    },

    setupShare(post) {
        const shareToggle = document.getElementById('share-toggle');
        if (!shareToggle) return;

        // Calculate absolute URL
        const siteBase = "https://vineetkishore01.github.io/Portfolio";
        const articleUrl = `${siteBase}/blog-post.html?slug=${post.slug}`;

        shareToggle.addEventListener('click', () => {
            navigator.clipboard.writeText(articleUrl).then(() => {
                const originalText = shareToggle.textContent;
                shareToggle.textContent = 'Link Copied!';
                shareToggle.classList.add('copied');
                setTimeout(() => {
                    shareToggle.textContent = originalText;
                    shareToggle.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        });
    },

    renderError(msg) {
        const contentArea = document.getElementById('post-content');
        if (contentArea) {
            contentArea.innerHTML = `<div class="blog-error">${msg}</div>`;
        }
    },

    formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) throw new Error('Invalid date');
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        } catch (e) {
            return dateStr; // Return as-is if parsing fails
        }
    }
};

document.addEventListener('DOMContentLoaded', () => PostReader.init());
