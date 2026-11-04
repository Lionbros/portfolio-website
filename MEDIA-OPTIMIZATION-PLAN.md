# Media Optimization Plan — 2-Second Load on 4G

**Scope:** all images and videos in `v2/` that are actually loaded by the site (168 files, 1.69 GB).
**Goal:** every page reaches first meaningful paint + hero within 2 s on a standard 4G connection, and no single asset blows the budget.

---

## 1. What "2 seconds" means — the budget

Standard 4G (LTE, typical European mobile): **9 Mbps down ≈ 1.12 MB/s**, RTT 70–100 ms.
After TLS + TCP overhead (~8 %), 2 s buys about **2.0 MB**, split across the critical path only.

| Budget line | Max bytes |
|---|---:|
| HTML | 45 KB |
| CSS (Brotli) | 60 KB |
| JS (Brotli, deferred) | 120 KB |
| Webfonts (2 faces, subset) | 75 KB |
| LCP / hero image | 150 KB |
| **Critical total** | **≤ 450 KB** |
| Everything below the fold | lazy, after paint |

Rules derived from that:
- Nothing on the critical path above **150 KB**; nothing at all above **400 KB** without lazy-loading.
- Page's total *eager* payload ≤ **2.0 MB** (hard fail above it).
- Stress test: Lighthouse "Slow 4G" (1.6 Mbps) must still paint the hero under 3 s.

---

## 2. Measured baseline (why it fails today)

Critical bytes = HTML + CSS + JS + every non-lazy image + fonts, per page:

| Page | Critical now | @ 9 Mbps | @ 1.6 Mbps | Verdict |
|---|---:|---:|---:|---|
| Home | 25.4 MB | 22.5 s | 127 s | ✗ 11× over budget |
| Videography | 26.7 MB | 23.7 s | 133 s | ✗ 12× over |
| Software Solutions | 14.9 MB | 13.2 s | 74 s | ✗ 7× over |
| Taarten | 12.6 MB | 11.2 s | 63 s | ✗ 6× over |
| Any blog article | 3.4 MB | 3.0 s | 17 s | ✗ 1.5× over |
| Video on demand (`data-video`) | 1.62 GB | — | — | 7 min to buffer one film |

**Every single page fails.** The blog pages are the cheapest fix — they are 3.1 MB of *one file*.

---

## 3. Root causes

1. **`assets/logo-badge.png` — 3.14 MB, on all 40 pages.** A 1928×2068 PNG rendered at ~48 px. It alone is the entire critical path of every blog page.
2. **PNG screenshots exported at full resolution** — the Camperplaats cover is 3840×1911 PNG = 5.48 MB for a 960 px card; `Camperplaats Zsana Logo.png` is 4384 KB at 2000×1745.
3. **Photos sized for print, not for the web** — 3000–5000 px JPEGs in 960 px slots (`Personal-Projects.jpg` 3102×2662 = 1.54 MB).
4. **A 93-frame JPEG scroll sequence** — `scrub-frames/frame-001…093.jpg`, 1920×1080, **16.4 MB total** to animate one hero.
5. **Video encoded as if for archival** — Suzhou Center runs at **84.5 Mbps** (1.15 GB for 113 s); Mammamia and SSIS at 9–10 Mbps; all 60 fps where 30 would do. Snippets are 7 s at 7–13 Mbps.
6. **Fonts and JS payload** — Google Fonts requested with 4+3 weights per page (~200 KB), all in the render-blocking path; 98 KB of JS on Taarten.

---

## 4. Format decisions

### Images — measured on this actual library

I encoded all 146 loaded images both ways in memory. Results:

| Pipeline | Total | vs today | Notes |
|---|---:|---:|---|
| Current (JPEG/PNG) | 66.8 MB | — | |
| **WebP q78** | 10.3 MB | **−85 %** | universal support (Safari 14+) |
| **AVIF q55** | 7.2 MB | **−89 %** | Safari 16+, Chrome 85+, FF 93+ |

Per-file examples (already resized to the slot they render in):

| File | Now | WebP | AVIF | Target width |
|---|---:|---:|---:|---:|
| Camperplaats Zsana Cover.png | 5.48 MB | 40 KB | 33 KB | 960 |
| Camperplaats Zsana Logo.png | 4.38 MB | 112 KB | 71 KB | 960 |
| logo-badge.png | 3.14 MB | **10 KB** | 8 KB | 256 |
| Suzhou Center Cover.png | 2.86 MB | 27 KB | 22 KB | 960 |
| work/suzhou-center.jpg | 2.21 MB | 145 KB | 95 KB | 1280 |
| taarten-hero-3.png | 1.82 MB | 102 KB | 72 KB | 960 |

**Decision:** serve **AVIF first, WebP second, JPEG/PNG third** via `<picture>`. Keep the existing PNG/JPG files as the last `<source>` so nothing breaks for old browsers. PNG only survives for assets that need transparency *and* stay tiny — in practice none: every PNG here is a screenshot or a photo, so all become AVIF/WebP.

Screenshots (UI captures) compress differently from photos: at the same quality AVIF is ~25 % smaller than WebP, but for flat UI use `quality 60–65` AVIF — quality loss is invisible on text/UI and saves another 15 %.

**Logo:** `assets/logo.svg` is 107 KB — run `svgo` (expect ~20 KB), then inline the mark in the header and drop the raster badge entirely.

### Video — calibrated by test-encode on these files

Measured with `libx264 -preset slow` at 30 fps:

| Class | Setting | Bitrate | Result |
|---|---|---:|---|
| Inline/preview clips | 720p30, CRF 28 | ~1.35 Mbps | 7 s clip = **1.2 MB** |
| Click-to-play films | 1080p30, CRF 26 | 4.3–5.3 Mbps | 140 s film ≈ 75 MB |

AV1 (`libsvtav1`, or hardware `av1_nvenc`) gives roughly 30–40 % off H.264 at equal quality, and this machine has NVENC AV1 available. But AV1 has no Safari <17 support and encodes slowly, so: **H.264 720p as the universal baseline, AV1 as an optional second `<source>`** — not a replacement.

Non-negotiable flags for every file: `-an` (drop audio on silent clips), `-movflags +faststart` (moov atom first, so playback starts before the file finishes), `-pix_fmt yuv420p`, and `fps=30`.

**Targets:**

| File | Now | Duration | 720p H.264 | 1080p H.264 |
|---|---:|---:|---:|---:|
| Videos/Suzhou Center.mp4 | 1146 MB | 113.6 s | **19 MB** | 76 MB |
| Videos/Mammamia.mp4 | 159 MB | 140.4 s | **24 MB** | 75 MB |
| Videos/SSIS.mp4 | 167 MB | 136.3 s | **23 MB** | 77 MB |
| Videos/Suzhou Times Square.mp4 | 124 MB | 98.0 s | **17 MB** | 55 MB |
| snippets/aerial-snippet.mp4 | 6.5 MB | 7.1 s | **1.2 MB** | 3.2 MB |
| snippets/events-snippet.mp4 | 5.8 MB | 7.1 s | **1.2 MB** | 3.2 MB |
| snippets/promotion-snippet.mp4 | 10.6 MB | 7.0 s | **1.2 MB** | 3.2 MB |
| **Total** | **1620 MB** | | **86 MB (−95 %)** | 292 MB (−82 %) |

---

## 5. Target spec per asset class

| Class | Max dimensions | Format / quality | Max bytes |
|---|---|---|---|
| Logo / favicon | 256 px | SVG → optimized; WebP | 20 KB |
| Hero / LCP image | 1600 px | AVIF 55 / WebP 78 | 150 KB |
| Gallery card covers | 960 px | AVIF 55 / WebP 78 | 60 KB |
| In-page content images | 1280 px | AVIF 58 / WebP 80 | 120 KB |
| UI screenshots | 1280 px | AVIF 65 (text-safe) | 100 KB |
| Thumbnails | 640 px | AVIF 55 / WebP 78 | 25 KB |
| Hero frame sequence | 960 px | **replaced by video** (see §6.4) | 1.5 MB total |
| Preview clips | 720p30 | H.264 CRF 28 | 1.5 MB |
| Click-to-play films | 720p30 | H.264 CRF 28 + faststart | 25 MB |

---

## 6. Phased execution

### Phase 0 — Delete dead weight (10 min, −1.21 GB, zero risk)

65 files are never requested: `Hero-Section-Intro.MP4` (538 MB), `Hungarian Forest Video.mov` (468 MB), `Suzhou Times Square.mov` (124 MB), `assets/img/Unused-Images/`, `menu-originals/` duplicates, `Notes/`, `.DS_Store`, `css/solutions.css`, an empty `2321321.png`.

Move originals **out of `v2/`** to a sibling `_source-media/` folder rather than deleting — the deploy then stops shipping 1.2 GB, and you keep the masters.

**Gate:** `v2/` under 1.7 GB, site still renders.

### Phase 1 — The global win: logo + fonts (1 h, biggest single improvement)

1. `logo-badge.png` 3140 KB → AVIF/WebP at 256 px (**10 KB**), plus a 96 px variant for mobile. Update the nav markup on all 40 pages (one shared block).
2. Self-host fonts instead of Google Fonts: subset to Latin, keep only Space Grotesk 400/600 + JetBrains Mono 400. Drop Fraunces or subset it to the 3 weights the Taarten page actually uses. `font-display: swap`, `<link rel="preload" as="font" crossorigin>` for the display face.
3. Brotli + `Cache-Control: public, max-age=31536000, immutable` for hashed assets.

**Gate:** blog page 3.38 MB → **252 KB**, 3.0 s → **1.3 s** at 9 Mbps. All 36 blog pages fixed by this one phase.

### Phase 2 — Image pipeline (3–4 h, 66.8 MB → 10.3 MB)

1. Batch-convert with the worklist (`media-worklist.csv`): Pillow/`cwebp`/`avifenc`, target width per row, AVIF q55 + WebP q78.
2. Add `<picture>` with AVIF → WebP → original, and `srcset` at 480/960/1440/1920 with `sizes` matching the CSS boxes.
3. Add `loading="lazy" decoding="async"` to everything that is not the hero — today Home has 9 images and only 1 lazy. Explicit `width`/`height` on every `<img>` to kill layout shift.
4. Home: the circular gallery builds 10 covers on load (~16 MB). Initialise it on `IntersectionObserver` and load only the 3 visible cards first.

**Gate:** Home 25.4 MB → **≤ 1.2 MB**, 22.5 s → **~1.0 s**; Software 14.9 → 0.9 MB; Taarten 12.6 → 0.9 MB.

### Phase 3 — Kill the 93-frame sequence (1 h, 16.4 MB → 1.5 MB)

Options, best first:
1. **Replace with a 5 s 720p loop** (~1 MB) and drive the scroll position with `video.currentTime` — same effect, a fraction of the bytes, one request instead of 93.
2. Keep frames but halve them: 46 frames at 960 px AVIF ≈ 25 KB each ≈ **1.2 MB**, still 13× smaller.

Also preload only frame 1, then stream the rest after `load`.

**Gate:** Videography 26.7 MB → **≤ 3 MB** eager.

### Phase 4 — Video re-encode (2–3 h, 1.62 GB → 86 MB)

Per file:
```
ffmpeg -i "Suzhou Center.mp4" -vf "scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 28 \
       -pix_fmt yuv420p -movflags +faststart -an "suzhou-center-720.mp4"
```
- Posters: first frame → AVIF 1280 px (~40 KB), used as `poster` so the slider never waits on video.
- Keep full films click-to-play; they must not be in the initial payload.
- Optional second source: `av1_nvenc -cq 32` (fast on this GPU) as `<source type="video/mp4; codecs=av01.0.05M.08">`.

**Gate:** no video request before a play click; every clip starts < 2 s on 4G.

### Phase 5 — Delivery (30 min)

HTTP/2 or /3, Brotli, long-lived hashed caching, CDN in front, and `preload` the LCP image per page (Taarten already preloads 3 — trim to 1).

---

## 7. Expected result

| Page | Now | After Phase 1–2 | After all phases | @ 9 Mbps |
|---|---:|---:|---:|---:|
| Home | 25.4 MB | 1.2 MB | ~0.9 MB | **0.8 s ✓** |
| Videography | 26.7 MB | 8.9 MB | ~2.5 MB | **2.2 s ✓** |
| Software | 14.9 MB | 0.9 MB | ~0.8 MB | **0.7 s ✓** |
| Taarten | 12.6 MB | 0.9 MB | ~0.8 MB | **0.7 s ✓** |
| Blog article | 3.4 MB | 0.25 MB | ~0.22 MB | **0.2 s ✓** |
| Video on demand | 1620 MB | — | 86 MB | −95 % |

Slow-4G (1.6 Mbps) results: blog **1.3 s ✓**, Home ~4 s, Videography ~12 s — those need the optional extras (code-split `i18n`, lazy gallery) to pass the stretch target.

---

## 8. Verification protocol

Per page, at 9 Mbps / 70 ms RTT (DevTools → Network → custom throttle):
1. **Total transferred** ≤ 2.0 MB before scroll; LCP image ≤ 150 KB.
2. `Lighthouse` mobile, three runs, median: LCP < 1.8 s, CLS < 0.05, total bytes < 2 MB.
3. **WebPageTest** (Dulles, Moto G4, 4G): visual-complete screenshot before 2 s.
4. Regression guard: a small Node script that walks the HTML, sums eager bytes, and fails CI if any page > 2 MB or any asset > 400 KB. (I can add this — it's ~40 lines and reuses the scanner from the inventory.)

---

## 9. Risks and rollback

- **AVIF encode time** — 146 files, ~10–20 min batch; run once, commit outputs.
- **Safari < 16** gets WebP via `<source>`; the original JPEG stays as final fallback, so no browser ever breaks.
- **UI screenshots can look soft** in AVIF at q55 — use q65 for `software-solutions/*` and check text edges at 100 %.
- **Changing image URLs breaks indexed images** — no external links point at them today (single-page portfolio), but use a 301 map if any blog article gets shared.
- **Keep originals out of the deploy root** so nothing is re-converted from a lossy file later.

---

## 10. Decisions I need before executing

1. **Quality tier for films** — 720p (86 MB total, fast everywhere) or 1080p (292 MB, sharper for a videography portfolio)? I'd pick 720p inline + a "download 1080p" link.
2. **Hosting** — is this on Netlify/Vercel/GitHub Pages, or a plain server? It decides whether Brotli, HTTP/2 and cache headers are one config line or manual.
3. **Keep the 93-frame scroll effect** or replace it with the cheaper video scrub? The effect is the same visually; video is 13× lighter.
