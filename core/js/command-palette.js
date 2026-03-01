/**
 * Omnipresent Command Palette
 * Triggered by Cmd+K or Ctrl+K
 */

class CommandPalette {
    constructor() {
        this.isOpen = false;
        this.selectedIndex = 0;

        // Base Commands
        this.commands = [
            { id: 'home', title: 'Go to Home', category: 'Navigation', icon: '🏠', action: () => this.navigate('#home') },
            { id: 'about', title: 'Go to About', category: 'Navigation', icon: '👤', action: () => this.navigate('#about') },
            { id: 'experience', title: 'Go to Experience', category: 'Navigation', icon: '💼', action: () => this.navigate('#experience') },
            { id: 'projects', title: 'Go to Projects', category: 'Navigation', icon: '🚀', action: () => this.navigate('#projects') },
            { id: 'skills', title: 'Go to Skills', category: 'Navigation', icon: '⚡', action: () => this.navigate('#skills') },
            { id: 'terminal', title: 'Open Terminal', category: 'Navigation', icon: '💻', action: () => this.navigate('#terminal') },
            { id: 'blog', title: 'Read Articles', category: 'Navigation', icon: '📝', action: () => this.navigate('articles/blog.html', true) },
            { id: 'resume', title: 'View Resume', category: 'Actions', icon: '📄', action: () => window.open('https://drive.google.com/file/d/1wJGbPT4FdXkRTixubtMcmjHRfVLUL08z/view?usp=sharing', '_blank') },
            { id: 'email', title: 'Copy Email Address', category: 'Actions', icon: '✉️', action: this.copyEmail },
            { id: 'audio', title: 'Toggle Sound Effects', category: 'Settings', icon: '🔊', action: () => document.getElementById('audio-toggle')?.click() },
            { id: 'matrix', title: 'System Diagnostic', category: 'Terminal', icon: '⚙️', action: () => this.runTerminalCommand('matrix') },
            { id: 'sudo_halt', title: 'Sudo Halt (Danger)', category: 'System', icon: '🔴', action: () => window.location.href = '/offline.html' }
        ];

        this.filteredCommands = [...this.commands];
        this.init();
    }

    init() {
        this.injectStyles();
        this.buildDOM();
        this.attachEventListeners();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #cmd-palette-backdrop {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 99999;
                align-items: flex-start;
                justify-content: center;
                padding-top: 15vh;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            #cmd-palette-backdrop.active {
                display: flex;
                opacity: 1;
            }
            #cmd-palette-modal {
                background: var(--bg-secondary, #0d1117);
                border: 1px solid var(--border-color, rgba(255,255,255,0.1));
                border-radius: 16px;
                width: 100%;
                max-width: 600px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
                overflow: hidden;
                transform: scale(0.95) translateY(-10px);
                transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                flex-direction: column;
                font-family: var(--font-base, 'Inter', sans-serif);
            }
            #cmd-palette-backdrop.active #cmd-palette-modal {
                transform: scale(1) translateY(0);
            }
            #cmd-palette-search-box {
                padding: 1rem 1.25rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1));
            }
            #cmd-palette-search-box svg {
                width: 20px;
                height: 20px;
                color: var(--text-secondary, #8b949e);
            }
            #cmd-palette-input {
                flex-grow: 1;
                background: transparent;
                border: none;
                color: var(--text-primary, #c9d1d9);
                font-size: 1.15rem;
                outline: none;
                font-family: inherit;
            }
            #cmd-palette-input::placeholder {
                color: var(--text-tertiary, #484f58);
            }
            #cmd-palette-list {
                max-height: 350px;
                overflow-y: auto;
                padding: 0.5rem;
            }
            .cmd-palette-category {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--text-tertiary, #484f58);
                padding: 0.5rem 0.75rem;
                margin-top: 0.5rem;
                font-weight: 600;
            }
            .cmd-palette-category:first-child {
                margin-top: 0;
            }
            .cmd-palette-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                border-radius: 8px;
                cursor: pointer;
                color: var(--text-secondary, #8b949e);
                transition: background 0.1s, color 0.1s;
            }
            .cmd-palette-item.selected, .cmd-palette-item:hover {
                background: var(--accent-blue, #3b82f6);
                color: #ffffff;
            }
            .cmd-palette-icon {
                font-size: 1.2rem;
                opacity: 0.8;
                width: 24px;
                text-align: center;
            }
            .cmd-palette-title {
                flex-grow: 1;
                font-weight: 500;
                font-size: 0.95rem;
            }
            .cmd-palette-empty {
                padding: 2rem;
                text-align: center;
                color: var(--text-secondary, #8b949e);
                font-size: 0.9rem;
            }
            
            /* Footer hints */
            #cmd-palette-footer {
                padding: 0.5rem 1rem;
                border-top: 1px solid var(--border-color, rgba(255,255,255,0.05));
                background: rgba(0,0,0,0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.75rem;
                color: var(--text-tertiary, #484f58);
            }
            .cmd-shortcut {
                background: rgba(255,255,255,0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: var(--font-mono, monospace);
                color: var(--text-secondary, #8b949e);
            }
            
            /* Highlight match */
            .cmd-match {
                color: var(--text-primary, #fff);
                font-weight: 700;
            }
        `;
        document.head.appendChild(style);
    }

    buildDOM() {
        this.backdrop = document.createElement('div');
        this.backdrop.id = 'cmd-palette-backdrop';

        this.backdrop.innerHTML = `
            <div id="cmd-palette-modal">
                <div id="cmd-palette-search-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="cmd-palette-input" placeholder="Type a command or search..." autocomplete="off" spellcheck="false" />
                </div>
                <div id="cmd-palette-list"></div>
                <div id="cmd-palette-footer">
                    <span><span class="cmd-shortcut">↑</span> <span class="cmd-shortcut">↓</span> to navigate</span>
                    <span><span class="cmd-shortcut">↵</span> to select</span>
                    <span><span class="cmd-shortcut">esc</span> to close</span>
                </div>
            </div>
        `;

        document.body.appendChild(this.backdrop);
        this.input = document.getElementById('cmd-palette-input');
        this.list = document.getElementById('cmd-palette-list');
    }

    attachEventListeners() {
        // Hotkey Toggle (Cmd+K / Ctrl+K)
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }

            if (this.isOpen) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.close();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateSelection(1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateSelection(-1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executeSelected();
                }
            }
        });

        // Close on backdrop click
        this.backdrop.addEventListener('click', (e) => {
            if (e.target === this.backdrop) this.close();
        });

        // Search logic
        this.input.addEventListener('input', () => {
            if (window.vkAudioEngine) window.vkAudioEngine.playType();
            this.filterCommands(this.input.value);
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.input.value = '';
        this.filterCommands('');
        this.backdrop.classList.add('active');

        setTimeout(() => this.input.focus(), 50);

        if (window.vkAudioEngine) window.vkAudioEngine.playSuccess();
    }

    close() {
        this.isOpen = false;
        this.backdrop.classList.remove('active');
        if (window.vkAudioEngine) window.vkAudioEngine.playClick();
    }

    filterCommands(query) {
        query = query.toLowerCase().trim();

        if (!query) {
            this.filteredCommands = [...this.commands];
        } else {
            this.filteredCommands = this.commands.filter(cmd =>
                cmd.title.toLowerCase().includes(query) ||
                cmd.category.toLowerCase().includes(query)
            );
        }

        this.selectedIndex = 0;
        this.renderList();
    }

    renderList() {
        this.list.innerHTML = '';

        if (this.filteredCommands.length === 0) {
            this.list.innerHTML = '<div class="cmd-palette-empty">No commands found. Try another search.</div>';
            return;
        }

        // Group by category
        const groups = this.filteredCommands.reduce((acc, cmd) => {
            if (!acc[cmd.category]) acc[cmd.category] = [];
            acc[cmd.category].push(cmd);
            return acc;
        }, {});

        let globalIndex = 0;

        for (const [category, cmds] of Object.entries(groups)) {
            const catEl = document.createElement('div');
            catEl.className = 'cmd-palette-category';
            catEl.textContent = category;
            this.list.appendChild(catEl);

            cmds.forEach((cmd) => {
                const item = document.createElement('div');
                item.className = 'cmd-palette-item';
                if (globalIndex === this.selectedIndex) item.classList.add('selected');

                // Highlight query matching
                const query = this.input.value.toLowerCase().trim();
                let displayTitle = cmd.title;
                if (query) {
                    const regex = new RegExp(`(${query})`, 'gi');
                    displayTitle = cmd.title.replace(regex, '<span class="cmd-match">$1</span>');
                }

                item.innerHTML = `
                    <span class="cmd-palette-icon">${cmd.icon}</span>
                    <span class="cmd-palette-title">${displayTitle}</span>
                `;

                item.dataset.index = globalIndex;

                // Mouse interaction
                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = parseInt(item.dataset.index);
                    this.updateSelection();
                    if (window.vkAudioEngine) window.vkAudioEngine.playHover();
                });

                item.addEventListener('click', () => {
                    this.executeCommand(cmd);
                });

                this.list.appendChild(item);
                globalIndex++;
            });
        }

        this.scrollToSelection();
    }

    navigateSelection(direction) {
        if (this.filteredCommands.length === 0) return;

        this.selectedIndex += direction;

        if (this.selectedIndex < 0) {
            this.selectedIndex = this.filteredCommands.length - 1;
        } else if (this.selectedIndex >= this.filteredCommands.length) {
            this.selectedIndex = 0;
        }

        this.updateSelection();
        this.scrollToSelection();
        if (window.vkAudioEngine) window.vkAudioEngine.playHover();
    }

    updateSelection() {
        const items = this.list.querySelectorAll('.cmd-palette-item');
        items.forEach((item, idx) => {
            if (idx === this.selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    scrollToSelection() {
        const selectedEl = this.list.querySelector('.cmd-palette-item.selected');
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    }

    executeSelected() {
        if (this.filteredCommands.length > 0 && this.selectedIndex >= 0) {
            this.executeCommand(this.filteredCommands[this.selectedIndex]);
        }
    }

    executeCommand(cmd) {
        this.close();
        setTimeout(() => cmd.action(), 200);
    }

    // --- Specific Actions ---

    navigate(target, isUrl = false) {
        if (isUrl) {
            // Check if we are already in blog or root
            if (window.location.pathname.includes('/articles/')) {
                window.location.href = target.replace('articles/', '');
            } else {
                window.location.href = target;
            }
        } else {
            // Internal anchor link
            if (window.location.pathname.includes('/articles/')) {
                window.location.href = '../index.html' + target;
            } else {
                const el = document.querySelector(target);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }

    copyEmail() {
        navigator.clipboard.writeText('vineetkishore01@gmail.com');

        // Show a quick visual confirmation somewhere
        const flash = document.createElement('div');
        flash.textContent = 'Email copied to clipboard!';
        Object.assign(flash.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--accent-blue)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: '999999',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            animation: 'slideUpFade 0.3s forwards'
        });
        document.body.appendChild(flash);
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transition = 'opacity 0.3s';
            setTimeout(() => flash.remove(), 300);
        }, 2500);
    }

    runTerminalCommand(cmdString) {
        this.navigate('#terminal');
        setTimeout(() => {
            const input = document.getElementById('terminal-input');
            const form = document.getElementById('terminal-form');
            if (input && form && window.handleTerminalCommand) {
                input.value = cmdString;
                window.handleTerminalCommand(new Event('submit'));
            }
        }, 800);
    }
}

// Instantiate globally
window.vkCommandPalette = new CommandPalette();
