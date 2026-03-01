# 🌐 Portfolio: Infrastructure & Strategic Excellence

A hyper-modern, high-performance portfolio website built with a focus on **visual depth**, **premium interactivity**, and **technical storytelling**. Designed to reflect a background in resilient infrastructure and strategic technology.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-electric_blue)
![Stack](https://img.shields.io/badge/stack-Vanilla_JS_|_GSAP_|_Lenis-black)

## 🚀 Key Features

### 1. ⌨️ Interactive Command Center (Terminal)
A fully functional terminal emulator that allows users to explore the portfolio via CLI.
- **Commands**: `whoami`, `neofetch`, `skills`, `projects`, `matrix`, `hack`, and more.
- **Functionality**: Supports Tab-autocomplete, command history (Up/Down arrows), and section-specific navigation (e.g., `goto projects`).
- **PWA Ready**: Built-in system diagnostics and offline state handling.

### 2. ⚡ Omnipresent Command Palette (`Cmd + K`)
A Spotlight-style command palette triggered globally by keyboard shortcuts.
- **Quick Navigation**: Instant jumps to Home, About, Experience, or Blog.
- **Categorized Actions**: Filterable list of categorized commands (Navigation, Actions, System).
- **Audio Feedback**: Context-aware mechanical sound effects for a tactile experience.

### 3. 🎭 Identity Switcher (About Section)
A sophisticated tab-based component for switching between different professional personas.
- **GSAP Driven**: Utilizes GreenSock's powerful animation engine for smooth transitions between cards.
- **Glassmorphism**: High-depth card designs with backdrop-blur effects and magnetic hover interactions.

### 4. 📽️ Strategic Projects Cinema
A grid of projects presented with high-impact visual depth.
- **Smart Filtering**: Category-aware project filtering with fluid re-layout animations.
- **Horizontal Peek**: Optimized for mobile with horizontal scroll hints (iOS style) and cinema-grade gradients.

### 5. 📱 Native Mobile Experience (iOS Design Language)
Built focused on mobile ergonomics, not just as a responsive afterthought.
- **Mobile Dock**: A bottom-anchored navigation bar mirroring the premium feel of native mobile apps.
- **Optimized Performance**: Disabled CPU-heavy animations (like text scrambling) on mobile to ensure 60fps scrolling.
- **Safe Area Support**: Full support for notches, dynamic islands, and home indicators.

### 6. 📝 Automatic Blog Engine
A static Markdown discovery system that renders articles dynamically.
- **Zero Configuration**: Reads from a structured JSON index to discover new `.md` files in the `articles/` directory.
- **High Readability**: Focuses on typography and clean spacing for a distraction-free reading experience.

---

## 🛠 Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Core** | HTML5, CSS3 (Vanilla), JavaScript (ES2024) |
| **Animations** | [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform) + [ScrollTrigger](https://greensock.com/scrolltrigger/) |
| **Scrolling** | [Lenis](https://github.com/darkroomengineering/lenis) (Smooth Scroll Engine) |
| **PWA** | Service Workers, Web App Manifest, Cache Storage API |
| **Style** | Dark Mode (Matrix/Apple inspired), CSS Grid, Flexbox, Variable Tokens |
| **Deployment** | GitHub Pages Optimized |

---

## 🛠 Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vineetkishore01/Portfolio.git
   ```
2. **Launch a local server**:
   Since it's a static site with local file fetching (for the blog), use an HTTP server:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```
3. **Open in browser**:
   Navigate to `localhost:8000` or the port provided.

---

## ⌨️ Global Shortcuts

- **`Cmd/Ctrl + K`**: Open Command Palette
- **`Esc`**: Close Modals / Command Palette
- **`F`**: Toggle "Flashlight" Mode (experimental)
- **`Tab`**: Auto-complete commands in the Terminal

---

## 📜 Metadata & Architecture

- **Versioning**: Controlled via `?v=X` params for rapid iterative deployment caching.
- **Style Overdrive**: Specific `mobile-design.css` architecture to enforce performance and visual rules on small screens.
- **SEO/OpenGraph**: Full structured data (JSON-LD) and meta tags for optimized recruiter visibility.

---
*Created with precision and passion by **Vineet Kishore**.*
