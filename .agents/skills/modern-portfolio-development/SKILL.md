---
name: Modern Portfolio Development
description: Guidelines for building and maintaining a hyper-modern, professional, and animated portfolio using Vanilla HTML, CSS, JS and GSAP/Lenis, compatible with GitHub Pages.
---

# Modern Portfolio Development Skill

This skill defines the technical and aesthetic guidelines for developing a world-class, hyper-modern portfolio site. The architecture strictly avoids heavy frameworks (no React, Next.js, or complex build steps) to remain 100% compatible with static hosting like **GitHub Pages**.

## 1. Core Technology Stack
- **Structure**: Vanilla HTML5. Keep the DOM semantic (`<section>`, `<article>`, `<nav>`, `<main>`).
- **Styling**: Vanilla CSS3 using CSS Custom Properties (Variables) for theming. 
  - **No external CSS frameworks** (no Tailwind, Bootstrap).
  - Use Flexbox and CSS Grid for layouts.
- **Logic**: Vanilla ES6+ JavaScript. Use modules or structured objects (e.g., `InitializationManager`, `SmartAnimations`) to keep the global scope clean.
- **Animations & Scrolling**:
  - **GSAP (GreenSock)** & **ScrollTrigger** for complex, timeline-based sequence animations and scroll-linked effects.
  - **Lenis** for smooth scrolling behavior across desktop devices.
  - Native CSS transitions (`transform`, `opacity`) for simple hover states and micro-interactions.

## 2. Design Language & Aesthetics (Apple-tier / Premium)
The visual identity should scream "Premium." 

- **Color Palette**: 
  - Pure dark mode foundation (`--bg-primary: #000000`, `--bg-secondary: #0a0a0a`).
  - Sleek neutral text (`--text-primary: #ffffff`, `--text-secondary: #86868b`).
  - Vibrant but controlled accents (`--accent-blue`, glowing borders, soft drop shadows).
- **Glassmorphism**: Use `backdrop-filter: blur(12px)` and semi-transparent backgrounds (`rgba(255, 255, 255, 0.05)`) for overlays, navigation bars, and cards.
- **Typography**: Clean, sans-serif primary fonts like `Inter`, and monospace fonts like `JetBrains Mono` for developer/terminal aesthetics.
- **Interactions**:
  - **Magnetic/Spring feel**: Hover states should feel alive and responsive (`transform: translateY(-2px)` with cubic-bezier easing).
  - **Micro-animations**: Subtle scale changes on buttons, expanding underlines, and pulsing elements.

## 3. Animation Guidelines
Animations dictate the perceived quality of the portfolio. Follow these rules:

- **Initial Load (Choreography)**: Use GSAP timelines to stagger the entrance of elements. Background orbs first -> Hero text -> Subtitles -> Profile Card -> CTAs. Do not animate everything at once.
- **Scroll Effects**: Elements should fade and drift up (`y: 40, opacity: 0 -> 1`) gently as they enter the viewport using ScrollTrigger.
- **Kinetic Text & Glitch Effects**: Use custom JavaScript and CSS (`clip-path`, `text-shadow`) to create advanced text effects like scrambled letters (`SmartAnimations`), glitching names, and marquee-style big text behind content (`.kinetic-text`).
- **Performance Constraints**:
  - **Never** animate `width`, `height`, `top`, `left`, `margin`, or `padding` in JS/CSS if it triggers layout repaints.
  - **Always** animate `transform` (GPU accelerated) and `opacity`.

## 4. Mobile Responsiveness & "App-Like" Feel
The mobile version should feel like a native iOS/Android application.
- Hide desktop-heavy elements (like custom cursor followers).
- Implement a floating "Dynamic Island" or Bottom Dock style navigation instead of a traditional hamburger menu if possible, maximizing thumb reach metrics.
- Ensure all interactive elements have sufficient hit areas (`min-height: 44px`).

## 5. Iterative Refinement & Code Quality
You are **encouraged to repeatedly revisit code logic and design** to find improvements:
- **Refactoring**: Shrink redundant JavaScript logic into reusable managers/classes.
- **CSS Optimization**: Consolidate repetitive styles into CSS variables or utility classes where it makes sense, without degrading to fully utility-first Tailwind.
- **Progressive Enhancement**: Ensure the site doesn't break if JS fails or is loading slowly. Use `.js-loading` fallback classes to prevent FOUC (Flash of Unstyled Content).
- **Audit Visually**: Always review if an animation feels "too slow" or "too busy". Adjust duration and staggering to find the perfect timing.

## 6. Process Flow When Implementing Changes
1. **Analyze existing constraints**: Check `index.html`, `style.css`, and `app.js`. Understand the current naming conventions (BEM-light).
2. **Draft the HTML**: Add semantic nodes.
3. **Style with CSS Variables**: Bind colors and timings to the `:root` tokens.
4. **Animate Request**: Bind new sections to `SectionChoreography` or create new `IntersectionObserver` / GSAP hooks.
5. **Re-evaluate**: Look at your own implementation. *Can this logic be simplified? Is the animation buttery smooth? Does it feel premium?* Iterate until perfect.
