/**
 * Micro-Audio Interactions for Portfolio
 * Uses Web Audio API to synthesize sounds without external assets
 */

class AudioEngine {
    constructor() {
        this.enabled = true; // Enabled by default as requested

        // Settings - make extremely subtle for a premium feel
        this.masterVolume = 0.05;

        // Track if context has been unlocked by a user gesture
        this.isUnlocked = false;

        this.init();
    }

    initContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Must be called inside a user gesture event listener
    unlockAudio() {
        if (this.isUnlocked) return;

        this.initContext();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                this.isUnlocked = true;
            });
        } else {
            this.isUnlocked = true;
        }

        // Play a very brief, silent sound to force unlock on iOS
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(0);
        osc.stop(0.001);
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.initContext();
            this.playSuccess();
        }
        return this.enabled;
    }

    playTone(freq, type, duration, volModifier = 1) {
        if (!this.enabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.masterVolume * volModifier, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    // Specific sound profiles
    playHover() {
        // Very subtle, low frequency tick
        this.playTone(120, 'sine', 0.04, 0.4);
    }

    playClick() {
        // Sharp, higher frequency click
        this.playTone(400, 'triangle', 0.08, 1.2);
    }

    playType() {
        // Quick, mechanical tick for typing text like terminal or glitch name
        this.playTone(600, 'square', 0.02, 0.2);
    }

    playSuccess() {
        // Pleasant double-chime for activating sound
        if (!this.enabled || !this.ctx) return;

        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.8, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.5);

        osc2.start(now + 0.1);
        osc2.stop(now + 0.6);
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Unlock audio on first interaction to comply with browser autoplay policies
            const unlockHandler = () => {
                this.unlockAudio();
                document.removeEventListener('click', unlockHandler);
                document.removeEventListener('keydown', unlockHandler);
            };
            document.addEventListener('click', unlockHandler);
            document.addEventListener('keydown', unlockHandler);

            const toggleBtn = document.getElementById('audio-toggle');

            // Set initial UI state
            if (toggleBtn && this.enabled) {
                const iconOff = document.getElementById('audio-icon-off');
                const iconOn = document.getElementById('audio-icon-on');
                if (iconOff && iconOn) {
                    iconOff.style.display = 'none';
                    iconOn.style.display = 'block';
                    toggleBtn.title = 'Sound: ON';
                    toggleBtn.classList.add('audio-active');
                }
            }

            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    const isEnabled = this.toggle();

                    // Update UI
                    const iconOff = document.getElementById('audio-icon-off');
                    const iconOn = document.getElementById('audio-icon-on');

                    if (isEnabled) {
                        iconOff.style.display = 'none';
                        iconOn.style.display = 'block';
                        toggleBtn.title = 'Sound: ON';
                        toggleBtn.classList.add('audio-active');
                    } else {
                        iconOff.style.display = 'block';
                        iconOn.style.display = 'none';
                        toggleBtn.title = 'Sound: OFF';
                        toggleBtn.classList.remove('audio-active');
                    }
                });
            }

            // Attach hover sounds to interactive elements dynamically
            const attachSounds = () => {
                const interactables = document.querySelectorAll('a, button, .project-cinema-card, .about-card, .filter-btn');
                interactables.forEach(el => {
                    if (el.id === 'audio-toggle') return; // skip the toggle itself
                    if (el.hasAttribute('data-audio-attached')) return;

                    el.setAttribute('data-audio-attached', 'true');
                    el.addEventListener('mouseenter', () => this.playHover());
                    el.addEventListener('click', () => this.playClick());
                });
            };

            attachSounds();

            // Observe DOM changes in case new elements are added
            const observer = new MutationObserver((mutations) => {
                let shouldAttach = false;
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length > 0) {
                        shouldAttach = true;
                        break;
                    }
                }
                if (shouldAttach) attachSounds();
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // Make it globally available for other scripts (like the terminal)
            window.vkAudioEngine = this;
        });
    }
}

new AudioEngine();
