const fs = require('fs');
const path = require('path');

const BLOGS_DIR = path.join(__dirname, '../articles/blogs');
const OUTPUT_FILE = path.join(BLOGS_DIR, 'index.json');

function stripMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1')     // Italics
        .replace(/`(.*?)`/g, '$1')       // Code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
        .replace(/#+\s+/g, '')           // Headers
        .trim();
}

function estimateReadTime(text) {
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 225);
    return `${minutes} min`;
}

async function generateIndex() {
    console.log(`Scanning directory: ${BLOGS_DIR}`);

    if (!fs.existsSync(BLOGS_DIR)) {
        console.error(`Directory not found: ${BLOGS_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(BLOGS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log(`Found ${mdFiles.length} markdown files.`);

    const posts = [];

    for (const file of mdFiles) {
        const filePath = path.join(BLOGS_DIR, file);
        const text = fs.readFileSync(filePath, 'utf-8');

        // Basic extraction
        const titleMatch = text.match(/^#\s+(.*)/m);
        const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '');

        // Try to find a date in the text YYYY-MM-DD
        const dateMatch = text.match(/Date:\s*(\w+\s+\d{1,2},?\s+\d{4})/i) ||
            text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i) ||
            text.match(/20\d{2}-\d{2}-\d{2}/);

        // Fallback: extract date from filename if exists, else use birthtime
        const fileDateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);

        let date = new Date().toLocaleDateString('en-CA');
        if (dateMatch) {
            date = dateMatch[1];
        } else if (fileDateMatch) {
            date = fileDateMatch[1];
        } else {
            const stat = fs.statSync(filePath);
            date = stat.birthtime.toISOString().split('T')[0];
        }

        // Excerpt: first non-empty line after title
        const lines = text.split('\n').filter(l =>
            l.trim() !== '' &&
            !l.startsWith('#') &&
            !l.match(/^Date:/i) &&
            !l.match(/^Category:/i) &&
            !l.match(/^---/)
        );

        const rawExcerpt = lines[0] || "A deep dive into technical implementation and discovery.";
        const excerpt = stripMarkdown(rawExcerpt).substring(0, 180).trim() + (rawExcerpt.length > 180 ? '...' : '');

        posts.push({
            slug: encodeURIComponent(file),
            title,
            date,
            readTime: estimateReadTime(text),
            excerpt,
            file: file
        });
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
    console.log(`Successfully generated ${OUTPUT_FILE} with ${posts.length} entries.`);
}

generateIndex().catch(console.error);
