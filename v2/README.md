# Portfolio v2 — Restructured Landing Page

## Current State
Built in `v2/` folder. Original site is untouched in root. Open `v2/index.html` in a browser.

## Section Flow
1. **Hero** — MAARTEN VAN DER LEEUW title, flags, language toggle (EN/NL/HU), scroll-to-header shrink
2. **Floating CTA** — "Let's Talk" button bottom-right, always visible
3. **What I Do** — 3 gateway cards (Videography, Taarten van Maarten, Technical Solutions) with background image slots and descriptions
4. **How I Work** — 4-step numbered process (Discovery → Planning → Execution → Delivery)
5. **Featured Work** — Embla carousel with project cards (1 real project, 3 placeholders)
6. **Trust & Stats** — Animated counters, "I don't believe in problems" claim splash, testimonial cards
7. **About Me** — Portrait + first-person bio + personal widgets (Currently Reading, Latest Gear, Latest Bake)
8. **Contact** — Simplified card, friendly form labels, service dropdown, Web3Forms integration
9. **Footer** — Social links, copyright

## Key Changes from Original
- Spacer: 450vh → 200vh
- Custom cursor: now enhancement only (not `cursor: none !important`)
- No separate mobile page — responsive CSS handles it
- Philosophy 750% pinned scroll removed — replaced with simpler About section
- Gateways now link to contact instead of nowhere
- Dutch orange (#FF4F00) used as warm accent
- Form labels rewritten to be conversational (hellohello-inspired)

## Things to Customize
1. **Gateway images** — Replace gradient backgrounds in `css/main.css` lines ~209-217 with real images
2. **Project images** — Replace Unsplash stock photos in `index.html` with your real work
3. **Contact info** — Phone number, email, social links (currently `#`)
4. **Personal widgets** — Update "Currently Reading", "Latest Gear", "Latest Bake" text
5. **Testimonials** — Replace sample quotes with real client feedback
6. **Stats numbers** — Update `data-target` values on stat counters in `index.html`
7. **Social link `href`s** — All currently `#`, add real URLs

## Next Steps (After Polish)
1. Migrate to Astro (component-based, no HTML duplication)
2. Connect Firebase Firestore (project data, contact messages)
3. Build dedicated category pages (/videography, /taarten, /solutions)
4. Implement full language switcher (EN/NL/HU)
5. Add admin dashboard for managing projects

## Inspiration Sources
- ++hellohello.is — Friendly form labels, personal widgets, floating CTA
- Alethia.earth — Numbered process flow, stats counters, clean contact layout

## Original Files (in root)
- `index.html` — desktop landing page
- `mobile-landing-page.html` — separate mobile version
- `css/main.css` — original styles
- `js/main.js` — original scripts
- `contact.html` — basic contact page
