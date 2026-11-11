/**
 * Builds the "under construction" pages for the Blog section and the
 * Installation page. They keep the real navbar and footer, highlight the
 * word "construction" and offer an email-notify form.
 *
 * The original pages are moved to unused_assets/drafts/ on the first run and
 * never touched again afterwards.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("v2");
const DRAFTS = path.resolve("unused_assets/drafts");

const NAV = `<nav class="top-nav">
    <div class="nav-group nav-group--left">
        <div class="lang-toggle">
            <button type="button" class="lang-btn active" data-lang="en">EN</button><button type="button" class="lang-btn" data-lang="nl">NL</button><button type="button" class="lang-btn" data-lang="hu">HU</button>
        </div>
        <a href="__P__index.html#projects-section" class="nav-link" data-i18n="nav.work">Work</a>
        <a href="__P__index.html#about-section" class="nav-link" data-i18n="nav.about">About</a>
        <a href="__P__Blog/index.html" class="nav-link">Blog</a>
    </div>
    <a href="__P__index.html" class="nav-logo" aria-label="Maarten van der Leeuw - home">
        <picture><source type="image/avif" srcset="__P__assets/logo-badge-256.avif"><source type="image/webp" srcset="__P__assets/logo-badge-256.webp"><img src="__P__assets/logo-badge.png" alt="Maarten van der Leeuw" width="256" height="275" decoding="async"></picture>
        <span class="nav-logo__word">MAARTEN<br>VAN DER LEEUW</span>
    </a>
    <div class="nav-group nav-group--right">
        <a href="__P__index.html#contact-section" class="nav-link" data-i18n="nav.contact">Contact</a>
        <a href="__P__index.html#contact-section" class="nav-cta" data-i18n="nav.cta">Let's Talk</a>
    </div>
    <button class="nav-burger" aria-label="Menu" data-i18n-aria="nav.menu" aria-expanded="false"><span></span><span></span><span></span></button>
</nav>
<div class="nav-overlay">
    <div class="nav-overlay__inner">
        <div class="lang-toggle">
            <button type="button" class="lang-btn active" data-lang="en">EN</button><button type="button" class="lang-btn" data-lang="nl">NL</button><button type="button" class="lang-btn" data-lang="hu">HU</button>
        </div>
        <a href="__P__index.html#projects-section" class="nav-overlay__link" data-i18n="nav.work">Work</a>
        <a href="__P__index.html#about-section" class="nav-overlay__link" data-i18n="nav.about">About</a>
        <a href="__P__Blog/index.html" class="nav-overlay__link">Blog</a>
        <a href="__P__index.html#contact-section" class="nav-overlay__link" data-i18n="nav.contact">Contact</a>
        <a href="__P__index.html#contact-section" class="nav-cta" data-i18n="nav.cta">Let's Talk</a>
    </div>
</div>`;

const FOOTER = `<footer class="main-footer">
    <div class="footer-content">
        <div class="footer-brand">
            <h3>LEEUW.</h3>
            <p data-i18n="footer.tagline">Dutch quality based in Hungary</p>
        </div>
        <div class="footer-col">
            <h4 data-i18n="footer.nav">Navigation</h4>
            <ul>
                <li><a href="__P__index.html" data-i18n="footer.site.home">Homepage</a></li>
                <li><a href="__P__videography.html" data-i18n="footer.site.video">Videography</a></li>
                <li><a href="__P__taarten.html" data-i18n="footer.site.taarten">Taarten van Maarten</a></li>
                <li><a href="__P__software-solutions.html" data-i18n="footer.site.tech">Software Solutions</a></li>
                <li><a href="__P__installation.html" data-i18n="footer.site.install">Installation</a></li>
                <li><a href="__P__Blog/index.html" data-i18n="footer.site.blog">Blog</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h4 data-i18n="footer.contactTitle">Contact</h4>
            <ul>
                <li>hello@maartenvanderleeuw.com</li>
                <li>+36 20 977 4547</li>
                <li data-i18n="footer.address">Kiskunhalas, 6400 Hungary</li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <div class="footer-copyright" data-i18n-html="footer.rights">&copy; 2026 Maarten van der Leeuw. All Rights Reserved.</div>
        <button class="back-to-top" id="back-to-top">
            <span data-i18n="footer.top">Back to Top</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
    </div>
</footer>`;

const TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#ffffff">
    <meta name="robots" content="noindex">
    <title>__TITLE__</title>
    <link rel="icon" type="image/svg+xml" href="__P__assets/logo.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="__P__css/main.css">
    <link rel="stylesheet" href="__P__css/under-construction.css">
</head>
<body class="uc-page" data-uc="1">

<div class="grid-overlay"></div>
<div class="noise-overlay"></div>

${NAV}

<main class="uc-main">
    <div class="uc-inner">
        <h1 class="uc-title">This page is still under <em>construction</em>.</h1>
        <p class="uc-text">This page is still under construction, please come back later to see the final page published, or leave your email to be notified.</p>

        <form class="uc-form" name="uc-notify" method="POST" data-netlify="true" netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="uc-notify">
            <p hidden><label>Leave this field empty: <input name="bot-field"></label></p>
            <input type="email" name="email" placeholder="your@email.com" aria-label="Your email address" autocomplete="email" required>
            <button type="submit">Notify me</button>
        </form>
        <p class="uc-note" id="uc-note" role="status" hidden></p>
        <p class="uc-success" id="uc-success" hidden>Thanks - you are on the list. I will let you know as soon as this page is live.</p>

        <a class="uc-back" href="__P__index.html">&larr; Back to homepage</a>
    </div>
</main>

${FOOTER}

<script src="__P__js/i18n.js?v=5"></script>
<script src="__P__js/under-construction.js?v=1"></script>

</body>
</html>
`;

const TITLE = "Under construction · Maarten van der Leeuw";

function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        e.isDirectory() ? walk(p, out) : out.push(p);
    }
    return out;
}

const targets = [];
for (const f of walk(path.join(ROOT, "Blog"))) if (f.endsWith(".html")) targets.push(f);
const install = path.join(ROOT, "installation.html");
if (fs.existsSync(install)) targets.push(install);

let written = 0, backedUp = 0, regenerated = 0;
for (const file of targets) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    const current = fs.readFileSync(file, "utf8");

    if (current.includes('data-uc="1"')) {
        regenerated++;
    } else {
        const draft = path.join(DRAFTS, rel);
        fs.mkdirSync(path.dirname(draft), { recursive: true });
        fs.renameSync(file, draft);
        backedUp++;
    }

    const depth = rel.split("/").length - 1;
    const prefix = "../".repeat(depth);
    const title = TITLE;

    fs.writeFileSync(file, TEMPLATE.replaceAll("__P__", prefix).replaceAll("__TITLE__", title));
    written++;
}

console.log(`under construction: ${written} pages written (${regenerated} regenerated, ${backedUp} originals moved to unused_assets/drafts/)`);
