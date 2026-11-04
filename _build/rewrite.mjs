import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("v2");
const manifest = JSON.parse(fs.readFileSync("_build/media-manifest.json", "utf8"));

const enc = (p) => encodeURI(p).replace(/#/g, "%23");
const dec = (p) => { try { return decodeURIComponent(p); } catch { return p; } };

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const html = files.filter((f) => f.endsWith(".html"));
const js = files.filter((f) => f.endsWith(".js"));

/* map absolute file path -> manifest entry, keyed by page-relative URL */
function lookup(pageFile, src) {
  if (!src || /^(https?:|data:|#)/i.test(src)) return null;
  const clean = dec(src.split("?")[0].split("#")[0]);
  const abs = path.resolve(path.dirname(pageFile), clean);
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  return manifest[rel] ? { rel, m: manifest[rel] } : null;
}

/* ── 1. HTML: wrap <img> in <picture> ─────────────────────────── */
const HERO = /(hero|logo-badge|logo\.svg)/i;
const SKIP_IDS = new Set(["whyImage", "slhFrame"]);

function parseAttrs(tag) {
  const attrs = [];
  const rx = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = rx.exec(tag))) {
    attrs.push({ name: m[1].toLowerCase(), value: m[3] !== undefined ? m[3] : m[4], quote: m[2][0] });
  }
  return attrs;
}

let wrapped = 0, skipped = 0;
for (const file of html) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;

  text = text.replace(/<img\b[^>]*>/gi, (tag) => {
    const attrs = parseAttrs(tag);
    const get = (n) => attrs.find((a) => a.name === n)?.value;

    if (SKIP_IDS.has(get("id"))) { skipped++; return tag; }
    const hit = lookup(file, get("src"));
    if (!hit) { skipped++; return tag; }

    const { m } = hit;
    const relBase = path.dirname(file);
    const toUrl = (abs) => enc(path.relative(relBase, path.join(ROOT, abs)).replace(/\\/g, "/"));

    const avif = toUrl(m.avif);
    const webp = toUrl(m.webp);

    const isHero = HERO.test(hit.rel) || (get("fetchpriority") === "high");
    const out = [];
    for (const a of attrs) {
      if (a.name === "src") { out.push(`src="${a.value}"`); continue; }
      if (a.name === "width" || a.name === "height") { out.push(`${a.name}="${a.value}"`); continue; }
      if (a.name === "loading" || a.name === "decoding") continue;
      out.push(`${a.name}="${a.value}"`);
    }
    if (!attrs.some((a) => a.name === "width")) out.push(`width="${m.w}"`);
    if (!attrs.some((a) => a.name === "height")) out.push(`height="${m.h}"`);
    if (!isHero && !attrs.some((a) => a.name === "loading")) out.push('loading="lazy"');
    if (!attrs.some((a) => a.name === "decoding")) out.push('decoding="async"');

    wrapped++;
    return (
      `<picture>` +
      `<source type="image/avif" srcset="${avif}">` +
      `<source type="image/webp" srcset="${webp}">` +
      `<img ${out.join(" ")}>` +
      `</picture>`
    );
  });

  /* JS-consumed attributes point straight at the WebP derivative */
  text = text.replace(/\b(data-img|data-src|poster)\s*=\s*"([^"]*)"/gi, (full, attr, val) => {
    const hit = lookup(file, dec(val));
    if (!hit) return full;
    const relBase = path.dirname(file);
    const url = enc(path.relative(relBase, path.join(ROOT, hit.m.webp)).replace(/\\/g, "/"));
    return `${attr}="${url}"`;
  });

  if (text !== original) fs.writeFileSync(file, text);
}
console.log(`HTML: wrapped ${wrapped} images, skipped ${skipped}`);

/* ── 2. JS: repoint hard-coded image paths to WebP ────────────── */
const entries = Object.entries(manifest).sort((a, b) => b[0].length - a[0].length);
let jsEdits = 0;
for (const file of js) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  for (const [rel, m] of entries) {
    for (const form of [rel, enc(rel)]) {
      const target = form === rel ? m.webp : enc(m.webp);
      if (text.includes(form)) { text = text.split(form).join(target); }
    }
  }
  if (text !== before) { fs.writeFileSync(file, text); jsEdits++; }
}
console.log(`JS: updated ${jsEdits} files`);

/* ── 3. Video frame sequence -> WebP ──────────────────────────── */
const vg = path.join(ROOT, "videography.html");
if (fs.existsSync(vg)) {
  let t = fs.readFileSync(vg, "utf8");
  t = t.replace(/scrub-frames\/frame-' \+ s\.slice\(-3\) \+ '\.jpg/g, "scrub-frames/frame-' + s.slice(-3) + '.webp");
  t = t.replace(/(scrub-frames\/frame-\d{3})\.jpg/g, "$1.webp");
  fs.writeFileSync(vg, t);
}
console.log("frames: frameURL -> .webp");
