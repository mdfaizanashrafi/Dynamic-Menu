# DynamicMenu — AI Agent Guide

This document provides essential information for AI coding agents working on the DynamicMenu project. **The current working tree is a lightweight static landing page**, not the full-stack SaaS application that exists in the project's Git history.

---

## Project Overview

DynamicMenu is a QR-based digital menu management concept for restaurants. The **currently checked-out version** of the repository is a single-page marketing landing site that announces the product, describes its features, and collects waitlist email addresses.

It is designed to be deployed as a static site with no build step, no backend, and no external runtime dependencies beyond Google Fonts loaded via CDN.

> **Important historical note:** The Git history (HEAD and earlier commits) contains a much larger full-stack codebase under `app/` and `dynamicmenu/` that included a React + Vite frontend, a Node.js + Express + Prisma backend, and a shadcn/ui component library. Those directories have been deleted from the working tree but remain in the commit history. If you need to work on that version, restore the files from Git or ask the project owner which version is authoritative.

---

## Repository Structure (Working Tree)

```
Dynamic-Menu/
├── .git/                       # Git repository metadata
├── .gitignore                  # Ignore rules (Node.js / React oriented, legacy)
├── AGENTS.md                   # This file
├── assets/
│   └── dynamicmenu-logo.png    # Project logo (500x500 PNG)
├── index.html                  # Single-page landing site (HTML + CSS + JS)
└── mvp/                        # Fresh lightweight full-stack MVP
    ├── README.md
    ├── backend/                # Express + SQLite + JWT API
    └── frontend/               # React + Vite + Tailwind app
```

The `index.html` landing page remains a zero-build static site. The `mvp/` directory is a separate full-stack application with its own `package.json` files.

---

## Technology Stack

- **HTML5** — semantic page structure
- **CSS3** — all styles are inline within `<style>` in `index.html`
  - CSS custom properties (variables) for the design system
  - Flexbox and CSS Grid for layouts
  - Media queries for responsive design
  - CSS animations and transitions
- **Vanilla JavaScript (ES6+)** — all behavior is inline within `<script>` in `index.html`
  - `IntersectionObserver` for scroll-triggered animations
  - `requestAnimationFrame` for counter animations
  - DOM event listeners for interactions
- **External assets**
  - Google Fonts CDN: Plus Jakarta Sans, Inter, Manrope, JetBrains Mono
  - Local logo image: `./assets/dynamicmenu-logo.png`

No frameworks, no package manager, and no compilation step are required for the current site.

> **MVP note:** The `mvp/` directory contains a full-stack Express + React application. See `mvp/README.md` for its setup and commands.

---

## Build and Development Commands

Because this is a static HTML site, there is no formal build process.

### Local development

Open `index.html` directly in a browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html
```

Or serve it with any static file server, for example:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (if npx/serve is available)
npx serve .

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`.

### Production deployment

Deploy the repository root to any static host. The host must serve:

- `index.html` at the root path
- `assets/dynamicmenu-logo.png` at `./assets/dynamicmenu-logo.png`

Suitable platforms include GitHub Pages, Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront, or any standard web server (Nginx, Apache, Caddy).

---

## Code Organization

All production code lives in a single file:

| File | Responsibility |
|------|----------------|
| `index.html` | Complete landing page: `<head>` metadata, inline CSS, semantic markup, inline JavaScript |
| `assets/dynamicmenu-logo.png` | Brand logo referenced by the navbar and footer |

### Sections inside `index.html`

1. **`<head>`** — meta tags, title, favicon, Google Fonts preload, CSS variables, and all component styles.
2. **Navbar** — fixed navigation with desktop links and a mobile hamburger menu.
3. **Hero** — headline, description, CTAs, and a CSS-only dashboard mockup with animated counters.
4. **Trusted By** — hospitality business type pills.
5. **Features** — six feature cards (QR menus, menu management, analytics, billing, multi-location, speed).
6. **How It Works** — five-step timeline.
7. **Showcase** — dashboard / analytics / mobile preview cards.
8. **Why DynamicMenu** — six value proposition items.
9. **Pricing** — Starter, Pro, and Enterprise tiers.
10. **Coming Soon / Waitlist** — email capture form with success message.
11. **Footer** — product, company, and support links.
12. **`<script>`** — navbar scroll behavior, mobile menu, fade-in observer, counter animation, ripple effect, waitlist form, smooth-scroll anchors.

---

## Code Style Guidelines

### HTML

- Use semantic elements (`<nav>`, `<section>`, `<footer>`, `<h1>`–`<h3>`).
- Keep accessibility attributes (`aria-label`, `alt` text) in place.
- Anchor links use `href="#section-id"` for in-page navigation.

### CSS

- The project uses CSS custom properties defined on `:root` for colors, fonts, and spacing.
- Class naming is descriptive and section-based (e.g., `.navbar`, `.hero`, `.feature-card`).
- Mobile-first responsive patterns with breakpoints at `480px`, `640px`, `768px`, and `1024px`.
- Honor `prefers-reduced-motion` by disabling animations for users who request reduced motion.

### JavaScript

- Vanilla ES6+; no transpilation needed.
- Selectors use `document.getElementById` and `document.querySelectorAll`.
- Event listeners are attached directly after DOM elements are parsed.
- Helper functions are small and single-purpose (`toggleMenu`, `animateCounter`, `createRipple`).

### Assets

- The logo path is `./assets/dynamicmenu-logo.png`. If you replace the logo, keep the same filename or update both references in `index.html`.

---

## Testing Strategy

There are no automated tests in the current working tree.

Recommended manual checks after any change:

1. Open `index.html` in Chrome, Firefox, and Safari (or their mobile equivalents).
2. Verify the logo loads and the favicon displays.
3. Resize the viewport to test mobile, tablet, and desktop layouts.
4. Click the mobile hamburger menu and confirm it opens/closes.
5. Scroll through the page and confirm fade-in animations trigger.
6. Confirm dashboard counters animate when the hero section enters the viewport.
7. Submit the waitlist form and confirm the success message appears.
8. Click anchor links (Features, How It Works, Showcase, Pricing, Join Waitlist) and confirm smooth scrolling.

---

## Deployment Process

1. Ensure `index.html` and `assets/dynamicmenu-logo.png` are present at the repository root.
2. Commit changes.
3. Push to the static hosting platform or branch configured for the site.

No build artifacts, environment files, or dependency installation steps are required.

---

## Security Considerations

- The site has no server-side code, authentication, database, or API in the current working tree, so typical backend attack vectors (SQL injection, XSS from user input, JWT leaks) are not applicable here.
- The waitlist form currently shows a client-side success message only; it does not submit data anywhere. If you connect it to a backend or third-party service, validate and sanitize the email input on the server.
- All external resources are loaded over HTTPS (Google Fonts). Avoid mixing HTTP content.
- Keep the `.gitignore` rules even though they target Node.js build artifacts; they prevent accidental commits if the full-stack directories are restored later.

---

## Notes for AI Agents

- **Do not assume the full-stack `app/` or `dynamicmenu/` directories are available.** They are deleted from the working tree. Check `git status` and `git ls-tree -r HEAD` if you need to verify what is currently tracked versus what exists on disk.
- **If you are asked to add backend/frontend functionality,** clarify whether the request refers to the static landing page or the historical full-stack codebase. The historical code is in Git and can be restored with `git checkout HEAD -- app dynamicmenu` if desired.
- **Keep changes minimal.** Since the entire page is one file, small edits to `index.html` are usually sufficient for content or style updates.
