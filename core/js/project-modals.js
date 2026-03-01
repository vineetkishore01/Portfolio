/**
 * Project Nexus Modal System
 * Seamlessly expands project cards into full case studies using modern APIs.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Project Data Registry
    const projectData = {
        'droppy': {
            id: 'PROJ-01',
            title: 'Droppy',
            subtitle: 'macOS Dynamic Island utility',
            category: 'Development',
            stats: { users: '5K+', growth: '100x', trending: '#1' },
            tech: ['Swift', 'macOS API', 'Firebase', 'AppKit'],
            desc: "Droppy brings the iOS Dynamic Island experience to macOS. Designed for pixel-perfect precision and minimal resource usage, it quickly became the #1 trending macOS utility on Reddit and GitHub, proving the massive demand for modern UX paradigms on desktop.",
            features: [
                "Native Swift implementation with zero electron bloat.",
                "Real-time resource monitoring and seamless drag-and-drop clipboard.",
                "Reverse-engineered undocumented Apple APIs for authentic animation curves."
            ],
            link: "https://github.com/vineetkishore01/droppy"
        },
        'homelab': {
            id: 'PROJ-02',
            title: 'Home Lab Infrastructure',
            subtitle: 'Enterprise-grade micro datacenter',
            category: 'Infrastructure',
            stats: { uptime: '99.9%', monitoring: '24/7', healing: 'Auto' },
            tech: ['Docker', 'Kubernetes', 'Proxmox', 'Ansible', 'Grafana'],
            desc: "A highly available, self-healing home lab designed to mimic enterprise infrastructure. The cluster autonomously handles DNS, storage replication, and service load-balancing across multiple nodes.",
            features: [
                "Automated zero-downtime deployments via GitHub Actions and ArgoCD.",
                "Custom built PromQL alerts and Grafana dashboards for deep telemetry.",
                "Hardware failure simulation proved a Recovery Time Objective (RTO) of under 2 minutes."
            ]
        },
        'n8n-llm': {
            id: 'PROJ-03',
            title: 'N8N LLM Pipeline',
            subtitle: 'GenAI automation for evidence synthesis',
            category: 'AI / LLM',
            stats: { timeSaved: '90%', poweredBy: 'AI', pipeline: 'Auto' },
            tech: ['Node.js', 'n8n', 'OpenAI API', 'Python', 'Vector DB'],
            desc: "An automated intelligence pipeline combining web scrapers and Large Language Models. It continuously monitors hundreds of sources, categorizes developments, and synthesizes executive summaries.",
            features: [
                "Multi-agent architecture using LangChain for parallel data processing.",
                "Dynamic prompt engineering to ensure high-fidelity data extraction without hallucinations.",
                "Webhook-driven architecture for instant Slack/Email alerts on critical findings."
            ]
        }
    };

    // Inject modal container into body
    let modalWrapper = document.getElementById('project-nexus-modal');
    if (!modalWrapper) {
        modalWrapper = document.createElement('div');
        modalWrapper.id = 'project-nexus-modal';
        modalWrapper.className = 'project-nexus';
        modalWrapper.innerHTML = `
            <div class="nexus-backdrop"></div>
            <div class="nexus-container">
                <div class="nexus-header">
                    <div class="nexus-title-group">
                        <span class="nexus-id"></span>
                        <h2 class="nexus-title"></h2>
                    </div>
                    <button class="nexus-close-btn" aria-label="Close modal">
                        <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="nexus-content">
                    <div class="nexus-grid">
                        <div class="nexus-sidebar">
                            <div class="nexus-stat-box">
                                <span class="nexus-stat-label">Category</span>
                                <span class="nexus-stat-value nexus-category"></span>
                            </div>
                            <div class="nexus-tech-stack"></div>
                            <div class="nexus-actions"></div>
                        </div>
                        <div class="nexus-main">
                            <div class="nexus-section">
                                <h3>Overview</h3>
                                <p class="nexus-desc"></p>
                            </div>
                            <div class="nexus-section">
                                <h3>Key Infrastructure Highlights</h3>
                                <ul class="nexus-list"></ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalWrapper);
    }

    const backdrop = modalWrapper.querySelector('.nexus-backdrop');
    const closeBtn = modalWrapper.querySelector('.nexus-close-btn');
    let currentTransitioningCard = null;

    // Insert fallback view transition styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .view-transition-project {
            contain: layout paint;
        }
        ::view-transition-old(modal-expand),
        ::view-transition-new(modal-expand) {
            animation-duration: 0.4s;
            animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
        }
    `;
    document.head.appendChild(style);

    // Setup card click listeners
    document.querySelectorAll('.project-cinema-card').forEach(card => {
        // Prevent clicking if clicking the source link directly
        const sourceLink = card.querySelector('a');
        if (sourceLink) {
            sourceLink.addEventListener('click', e => e.stopPropagation());
        }

        // Add class to trigger pointer icon
        card.style.cursor = 'pointer';

        card.addEventListener('click', () => {
            const projectId = card.getAttribute('data-id');
            const data = projectData[projectId];
            if (!data) return;

            // Optional: Play audio
            if (window.vkAudioEngine) {
                window.vkAudioEngine.playSuccess();
            }

            // Populate Modal
            modalWrapper.querySelector('.nexus-id').textContent = data.id;
            modalWrapper.querySelector('.nexus-title').textContent = data.title;
            modalWrapper.querySelector('.nexus-category').textContent = data.category;
            modalWrapper.querySelector('.nexus-desc').textContent = data.desc;

            // Tech stack
            modalWrapper.querySelector('.nexus-tech-stack').innerHTML = data.tech.map(t => `<span>${t}</span>`).join('');

            // Features list
            modalWrapper.querySelector('.nexus-list').innerHTML = data.features.map(f => `<li>${f}</li>`).join('');

            // Actions
            const actionsContainer = modalWrapper.querySelector('.nexus-actions');
            actionsContainer.innerHTML = '';
            if (data.link) {
                actionsContainer.innerHTML = `<a href="${data.link}" target="_blank" class="nexus-cta primary" style="display:block">View Repository ↗</a>`;
            }

            // Animate In using View Transitions API if supported
            if (document.startViewTransition) {
                currentTransitioningCard = card;
                card.style.viewTransitionName = `modal-expand`;
                modalWrapper.querySelector('.nexus-container').style.viewTransitionName = `modal-expand`;

                const transition = document.startViewTransition(() => {
                    modalWrapper.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });

                transition.finished.finally(() => {
                    if (currentTransitioningCard) currentTransitioningCard.style.viewTransitionName = '';
                    modalWrapper.querySelector('.nexus-container').style.viewTransitionName = '';
                });
            } else {
                modalWrapper.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close logic
    const closeModal = () => {
        if (!modalWrapper.classList.contains('active')) return;

        if (window.vkAudioEngine) window.vkAudioEngine.playClick();

        if (document.startViewTransition && currentTransitioningCard) {
            currentTransitioningCard.style.viewTransitionName = `modal-expand`;
            modalWrapper.querySelector('.nexus-container').style.viewTransitionName = `modal-expand`;

            const transition = document.startViewTransition(() => {
                modalWrapper.classList.remove('active');
                document.body.style.overflow = '';
            });

            transition.finished.finally(() => {
                currentTransitioningCard.style.viewTransitionName = '';
                modalWrapper.querySelector('.nexus-container').style.viewTransitionName = '';
                currentTransitioningCard = null;
            });
        } else {
            modalWrapper.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
});
