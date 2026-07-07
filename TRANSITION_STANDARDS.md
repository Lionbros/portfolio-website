# Transition Standards - Maarten van der Leeuw Portfolio

This document outlines the source code and logic for the website's **Themed Loading Transition**. This transition must be implemented on every page and used for all navigation or layout-based redirects (e.g., Switching to Mobile).

## 1. Required Dependencies

The transition requires **GSAP** and **Tailwind CSS**. Ensure these are included in the `<head>` or at the bottom of the `<body>`:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
```

## 2. Loader HTML Structure

Paste this at the very beginning of the `<body>` element. It must be visible by default to prevent a "Flash of Unstyled Content" (FOUC).

```html
<!-- Themed Loading Screen Overlay -->
<div id="site-loader" class="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center pointer-events-auto opacity-100">
    <div class="overflow-hidden mb-4">
        <h2 class="loader-text text-2xl font-black tracking-[0.3em] uppercase translate-y-full">MAARTEN</h2>
    </div>
    <div class="w-12 h-[1px] bg-black/10 relative overflow-hidden">
        <div class="loader-bar absolute top-0 left-0 h-full w-full bg-black -translate-x-full"></div>
    </div>
</div>
```

## 3. JavaScript Implementation

The transition logic is split into an **Intro** (page arrival) and an **Outro** (page departure).

### A. Intro Phase (Page Load)
This function should be called **immediately** as the script is parsed (at the bottom of the body) to reveal the site once ready.

```javascript
function initLoader() {
    const loader = document.getElementById('site-loader');
    const text = loader.querySelector('.loader-text');
    const bar = loader.querySelector('.loader-bar');
    
    // Ensure loader is visible and bar is full
    gsap.set(loader, { opacity: 1, pointerEvents: 'all' });
    gsap.set(bar, { x: 0 });
    gsap.set(text, { y: '100%' });
    
    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(loader, { pointerEvents: 'none', opacity: 0 });
        }
    });
    
    // Reveal text then fade away background
    tl.to(text, { y: 0, duration: 0.8, ease: "power4.out", delay: 0.2 })
      .to(loader, { opacity: 0, duration: 0.5, ease: "power1.inOut" }, "+=0.1");
}
```

### B. Outro Phase (Redirects)
Use this function whenever you need to navigate to another page or trigger a refresh.

```javascript
function triggerThemedRedirect(url) {
    const loader = document.getElementById('site-loader');
    const text = loader.querySelector('.loader-text');
    const bar = loader.querySelector('.loader-bar');
    
    gsap.set(text, { y: '100%' });
    gsap.set(bar, { x: '-100%' });
    gsap.set(loader, { pointerEvents: 'all' });
    
    const tl = gsap.timeline({
        onComplete: () => { window.location.href = url; }
    });
    
    tl.to(loader, { opacity: 1, duration: 0.3, ease: "power1.out" })
      .to(bar, { x: 0, duration: 0.7, ease: "power2.inOut" }, "-=0.1");
}
```

## 4. Mandatory Usage Rules

1. **Resolution Switching**: Any logic that redirects between `index.html` and `mobile-landing-page.html` based on screen size **MUST** use `triggerThemedRedirect(url)` to mask the layout shift.
2. **Page Navigation**: All primary navigation links should ideally trigger the Outro sequence before the browser navigates away.
3. **CSS Integrity**: Do not remove the `opacity-100` and `pointer-events-auto` classes from the HTML; they are critical for preventing flickering during heavy page loads.
