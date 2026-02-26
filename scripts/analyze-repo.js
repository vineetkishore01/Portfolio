const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../');

function walkDir(dir, filterExt, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === '.agents' || file === 'tmp') continue;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, filterExt, callback);
        } else if (!filterExt || file.endsWith(filterExt)) {
            callback(filePath);
        }
    }
}

let errors = [];

// 1. Check HTML for broken local links
console.log('--- Checking HTML files for broken links ---');
walkDir(ROOT_DIR, '.html', (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = /(?:href|src)=["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        let link = match[1];
        if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('#')) continue;

        // Remove query params or hashes
        link = link.split('?')[0].split('#')[0];
        if (!link) continue;

        // Resolve absolute vs relative
        let targetPath;
        if (link.startsWith('/')) {
            targetPath = path.join(ROOT_DIR, link.substring(1));
        } else {
            targetPath = path.join(path.dirname(filePath), link);
        }

        if (!fs.existsSync(targetPath)) {
            // Check if it's missing the extension
            if (!fs.existsSync(targetPath + '.html')) {
                // Some pages might be routed differently, but generally this is an error
                errors.push(`[Broken Link] in ${path.relative(ROOT_DIR, filePath)}: points to missing file "${link}"`);
            }
        }
    }
});

// 2. Check CSS for syntax errors (like literal \n or unbalanced brackets)
console.log('--- Checking CSS files for syntax issues ---');
walkDir(ROOT_DIR, '.css', (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for literal \n
    if (content.includes('\\n') && !content.includes('content: "\\n"')) {
        // Just to be safe, count occurrences of actual backslash-n string
        const lines = content.split('\n');
        lines.forEach((line, i) => {
            if (line.match(/\s+\\n\s*/) || line.trim() === '\\n') {
                errors.push(`[CSS Error] Literal '\\n' string found in ${path.relative(ROOT_DIR, filePath)} on line ${i + 1}`);
            }
        });
    }

    // Check bracket balance
    let openBrackets = (content.match(/\{/g) || []).length;
    let closeBrackets = (content.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
        errors.push(`[CSS Error] Unbalanced brackets in ${path.relative(ROOT_DIR, filePath)}: { (${openBrackets}) vs } (${closeBrackets})`);
    }
});

// 3. Print Results
if (errors.length === 0) {
    console.log('✅ No obvious errors found in HTML links or CSS syntax!');
} else {
    console.log(`❌ Found ${errors.length} issues:`);
    errors.forEach(e => console.log(e));
}
