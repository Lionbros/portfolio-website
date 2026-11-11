# What Changed

Two passes over the site: the media optimization of 2026-11-04 and the launch prep of 2026-11-11.
Scope: `v2/` (the live site). Nothing was deleted.

---

## 2026-11-11 — Launch preparation

**Removed the two placeholder testimonials** from the homepage `#trust-section` (markup and the `trust.t1.*` / `trust.t2.*` strings in all three languages). The stats row and the "I don't believe in problems" claim stay, so the section still reads as complete.

**Blog and Installation are now "under construction".** All 36 blog pages and `installation.html` serve the full site shell — real navbar (including the mobile drawer) and the black homepage footer — with a headline that highlights the word *construction*, a short explanation, an email-capture form and a "Back to homepage" button. Every page carries the correct relative paths for its depth and is `noindex`.

The notify form posts to **Netlify Forms** (`name="uc-notify"`, `data-netlify="true"`), so on Netlify the address lands in the dashboard with no backend. Anywhere else the POST fails and the script falls back to opening a pre-filled mail draft, so the form never lies about having stored the address. To use a different provider, change the `action`/`fetch` URL in `js/under-construction.js`.

The real pages are preserved in `unused_assets/drafts/` at their original paths — restore by copying them back.

**Mobile menu rebuilt as a right-side drawer.** It used to fade a full-screen opaque panel over the page. Now:
- the panel slides in from the right (`min(86vw, 400px)`), the page stays visible behind a dimmed, blurred backdrop
- tap the backdrop, the ✕ button, or press Escape to close
- "MENU" label, numbered links with arrows, staggered entrance, language toggle and CTA pinned to the bottom
- focus moves to the close button on open and back to the burger on close; page scroll locks while open
- the Videography page carries its own stylesheet, so it got a dark-themed copy of the drawer

**Homepage spacing after the testimonials were removed.** The gap between the "I don't believe in problems" claim and the About section was three stacked spacings that only made sense when the testimonial cards sat between them (claim `margin-bottom: 4rem` + section `padding-bottom: 6rem` + About `padding-top: 8rem`). Now: claim margin `0`, trust section `3rem`, About `4rem`, and the orphaned bottom border on the claim is gone. The decorative dash moved into the new, smaller gap so it no longer crosses the text.

---

## 2026-11-04 — Media optimization

### Result

| Page | Critical path before | After | @ 9 Mbps | @ 1.6 Mbps (slow 4G) |
|---|---:|---:|---:|---:|
| Home | 25.4 MB | **393 KB** | 0.36 s | 2.0 s |
| Videography | 26.7 MB | **490 KB** | 0.45 s | 2.5 s |
| Software Solutions | 14.9 MB | **395 KB** | 0.36 s | 2.0 s |
| Taarten | 12.6 MB | **701 KB** | 0.64 s | 3.6 s |
| Any blog article | 3.4 MB | **216 KB** | 0.20 s | 1.1 s |

- Whole `v2/` folder: **3.04 GB → 155 MB**
- Video payload: **1,620 MB → 93.5 MB** (−94 %)
- All pages are under the 2 s budget on standard 4G. Blog and Software also pass the 1.6 Mbps stress test.
- The videography hero frame sequence loads progressively *after* first paint (47 × ~62 KB), so it does not block it.

---

## 1. Nothing deleted — everything moved to `unused_assets/`

165 files / **2.78 GB** now live in `unused_assets/`, mirroring their old paths so you can put any of them back:

| Group | Count | Size | Why it moved |
|---|---:|---:|---|
| Never-referenced files (`Unused-Images/`, `menu-originals/` duplicates, `Notes/`, `.DS_Store`, `css/solutions.css`, docs) | 65 | 1.21 GB | No page ever requested them |
| Original 93 scrub frames (`.jpg`) | 93 | 16.4 MB | Replaced by 47 WebP frames |
| Original video files | 9 | 1.73 GB | Replaced by 720p encodes at the same filenames |

`unused_assets/MANIFEST.csv` lists the first group with sizes.
Video originals are under `unused_assets/originals/` — same relative path as before.

---

## 2. Images — 155 new derivatives, AVIF + WebP

Every image the site loads now has an `.avif` and `.webp` sibling next to it, resized to the slot it renders in:

- **53 AVIF** (2.9 MB) + **102 WebP** (7.2 MB) = 10.1 MB for what used to be 66.8 MB of source images.
- Examples: `Camperplaats Zsana Cover.png` 5.48 MB → 40 KB WebP / 33 KB AVIF · `logo-badge.png` 3.14 MB → **10 KB** · `taarten-hero-3.png` 1.82 MB → 102 KB / 72 KB.
- The original JPG/PNG files were **kept in place** and are now the last-resort `<source>` fallback, so no browser can ever end up with a missing image.

Quality settings: photos AVIF q58 / WebP q80; UI screenshots and design mockups q62 / q84 to keep text edges crisp; frames q70.

### Transparency fix (applied after first review)

The first pass flattened everything to RGB, which **dropped the alpha channel** on the 13 cut-out images — the pie got a white box and the logos lost their see-through background. Fixed by re-encoding every image whose source actually has transparency as **RGBA**: `taarten-hero-1/2/3`, `maarten-met-taart`, `portrait-hero`, `logo-badge`, `logo-badge-white-small`, both project logos, the two Webtools mockups and the MacBook/Galaxy screenshots.

Verified by compositing old and new over the real page background — the pie on cream and the logo on the nav now match the original PNGs pixel for pixel (`_build/compare-pie.png`, `compare-logo.png`, `compare-portrait.png`). AVIF and WebP both carry alpha, so nothing is lost in the new formats. Cost: +0.3 MB across the whole site.

Note: `portrait-hero.png` has a faint white edge baked into the source cut-out itself (visible in the original PNG too). That is a retouch job on the source, not something the encoder introduced.

## 3. Markup — `<picture>` with dimensions and lazy-loading

- **81 `<picture>` blocks** added across all 40 pages (plus 3 Taarten hero images served as plain WebP, see notes).
- Each carries `width`/`height` (kills layout shift), `loading="lazy"` below the fold, `decoding="async"`.
- `picture { display: contents; }` added to `main.css` so the `<img>` keeps its exact existing box — no CSS layout changes.

## 4. CSS — `image-set()` for the three gateway backgrounds

`main.css`: the Videography / Taarten / Technical card backgrounds now offer AVIF → WebP → JPEG via `image-set()`.

## 5. JavaScript

- `js/circular-gallery.js`: the six gallery covers now point at the WebP derivatives.
- `videography.html`: the scroll-scrub sequence is **47 frames** at 1280 px WebP (was 93 × 1920 JPG), and `#whyImage` loads the WebP preview.

## 6. Video — re-encoded to 720p30, same filenames

| File | Before | After |
|---|---:|---:|
| Suzhou Center | 1146 MB (84.5 Mbps!) | **22.0 MB** |
| Mammamia | 159 MB | **27.6 MB** |
| SSIS | 167 MB | **25.5 MB** |
| Suzhou Times Square | 124 MB | **14.0 MB** |
| 3 snippets | 22.9 MB | **4.4 MB** |

H.264 High, CRF 28, `-pix_fmt yuv420p`, `+faststart` (plays before fully downloaded), AAC 96 kbps stereo preserved on the four films, audio dropped on the silent snippets. No markup change was needed since the filenames stayed identical.

---

## Rollback

- **Videos:** copy back from `unused_assets/originals/assets/img/Videography-Page/...`.
- **Frames:** the 93 originals are in `unused_assets/assets/img/Videography-Page/scrub-frames/`; restore and set `FRAME_COUNT = 93` in `videography.html`.
- **Everything else:** `git checkout -- v2/` restores the pre-change pages (the derivatives are new, unreferenced files after that).
- Nothing was deleted, so a mistake costs a copy, not a file.

---

## Notes and open items

1. **`installation.html` arrived mid-session** (17:00, not part of this work) and links to `css/installation.css` and `js/i18n-install.js`, which do not exist yet. It already uses the new `logo-badge-256.avif` pattern and loads `main.css`, so it inherits the `<picture>` layout rule. Add the two missing files to finish that page.
2. **Fonts are still on Google Fonts.** Self-hosting would remove two extra connections, but the CSS uses Fraunces at 400–800 plus italics, so a proper subset needs a font pipeline. Left as the next win (~150 KB and two RTTs).
3. **No multi-width `srcset` yet.** Each image is served at one size (roughly 2× the desktop box), which is enough to hit the budget; adding 480/960/1440 variants would help mobile data further.
4. **The heavy originals still sit in `v2/`** as fallbacks (50 MB). They are never requested by modern browsers, but they are still uploaded on deploy.
5. **I could not screenshot the pages** — the sandbox blocks Chrome's IPC, so headless rendering fails. Structure was verified instead: all 81 `<picture>` blocks contain a valid `<img>` + both sources, all 155 derivatives decode, and every reference resolves except the known `installation.html`. Please open the four pages and confirm the layout looks unchanged.
6. Working files (conversion script, manifest, verifier) are in `_build/` — outside `v2/`, so they are not deployed.
