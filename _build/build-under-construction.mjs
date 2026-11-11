/**
 * Replaces the unfinished Blog pages and the Installation page with a styled
 * "under construction" page. The original files are moved to
 * unused_assets/drafts/ (never deleted) and can be restored at any time.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("v2");
const DRAFTS = path.resolve("unused_assets/drafts");

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
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="__P__css/under-construction.css">
</head>
<body data-uc="1">

    <header class="uc-top">
        <a class="uc-logo" href="__P__index.html" aria-label="Maarten van der Leeuw - home">
            <img src="__P__assets/logo-badge-256.webp" alt="Maarten van der Leeuw" width="38" height="38">
            <span>Maarten<br>van der Leeuw</span>
        </a>
        <a class="uc-back" href="__P__index.html">&larr; Back to home</a>
    </header>

    <main class="uc-main">
        <p class="uc-kicker">__KICKER__</p>
        <h1 class="uc-title">Still <em>building</em><br>this page.</h1>
        <p class="uc-text">__TEXT__</p>
        <div class="uc-actions">
            <a class="uc-btn" href="__P__index.html#projects-section">See the work</a>
            <a class="uc-btn uc-btn--ghost" href="mailto:hello@maartenvanderleeuw.com">Email me</a>
        </div>
    </main>

    <footer class="uc-foot">
        <span>&copy; 2026 Maarten van der Leeuw</span>
        <span><a href="mailto:hello@maartenvanderleeuw.com">hello@maartenvanderleeuw.com</a></span>
    </footer>

</body>
</html>
`;

const SECTIONS = {
    blog: {
        kicker: "Blog &mdash; under construction",
        title: "Blog — under construction · Maarten van der Leeuw",
        text: "The project write-ups are being finished before launch, so this part of the site is not ready yet. The work itself is all there — have a look around in the meantime.",
    },
    installation: {
        kicker: "Installation &mdash; under construction",
        title: "Installation — under construction · Maarten van der Leeuw",
        text: "The installation page is being finished before launch. Everything else on the site is ready to explore in the meantime.",
    },
};

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

let replaced = 0, skipped = 0, backedUp = 0;
for (const file of targets) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    const current = fs.readFileSync(file, "utf8");

    if (current.includes('data-uc="1"')) { skipped++; continue; }

    // keep the original before replacing it
    const draft = path.join(DRAFTS, rel);
    fs.mkdirSync(path.dirname(draft), { recursive: true });
    fs.renameSync(file, draft);
    backedUp++;

    const section = rel.startsWith("Blog/") ? SECTIONS.blog : SECTIONS.installation;
    const depth = rel.split("/").length - 1;
    const prefix = "../".repeat(depth);

    const html = TEMPLATE
        .replaceAll("__P__", prefix)
        .replaceAll("__KICKER__", section.kicker)
        .replaceAll("__TEXT__", section.text)
        .replaceAll("__TITLE__", section.title);

    fs.writeFileSync(file, html);
    replaced++;
}

console.log(`under construction: ${replaced} pages written, ${skipped} already done, ${backedUp} originals moved to unused_assets/drafts/`);
