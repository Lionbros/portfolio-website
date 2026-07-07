# Footer Standards - Maarten van der Leeuw Portfolio

This document contains the source code and design requirements for the website's universal footer. All AI agents should ensure this footer is present and consistent on every page.

## Required Dependencies

The footer styles have been consolidated into the global CSS. Ensure `main.css` is linked in the `<head>` of every page:

```html
<link rel="stylesheet" href="css/main.css">
```

## Footer HTML Code

Paste this code at the very bottom of the `<body>` element (following the transition section):

```html
<!-- 400px White Spacing -->
<section style="height: 400px; background: white;"></section>

<footer class="main-footer">
    <div class="footer-content">
        <div class="footer-logo">
            <span class="footer-name">MAARTEN VAN DER LEEUW</span>
        </div>
        <p class="footer-tagline">
            Software Engineering • Cinematic Videography • Dutch Baking
        </p>
        <div class="footer-socials">
            <a href="#" aria-label="Instagram" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="Facebook" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="TikTok" class="social-link">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
            </a>
            <a href="mailto:hello@maarten.com" aria-label="Email" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
        </div>
    </div>
    <div class="footer-bottom">
        <div class="footer-copyright">
            © 2026 Maarten van der Leeuw. All rights reserved.
        </div>
    </div>
</footer>
```

## Design Integrity
- **Transition:** Uses an `h-40` gradient segment to bridge the light site content with the dark footer.
- **Background:** Deep neutral black (`#0a0a0a`).
- **Typography:** Uses the **Inter** font family. The logo name is `font-weight: 900` with `letter-spacing: -0.05em`.
- **Scaling:** The logo uses `clamp()` to remain legible on mobile while feeling massive on desktop.
- **Performance:** No external CDNs are required for the footer's visual fidelity.
