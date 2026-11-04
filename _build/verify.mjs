import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("v2");
const walk = (d, o = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p, o) : o.push(p);
  }
  return o;
};
const all = walk(ROOT);
const lower = new Map(all.map((f) => [path.relative(ROOT, f).replace(/\\/g, "/").toLowerCase(), f]));

function resolveRef(file, raw) {
  let c = raw.split(/[?#]/)[0];
  try { c = decodeURIComponent(c); } catch {}
  for (const b of [path.dirname(path.join(ROOT, file)), ROOT]) {
    const a = path.resolve(b, c.replace(/^\//, ""));
    if (fs.existsSync(a) && fs.statSync(a).isFile()) return a;
  }
  return lower.get(path.relative(ROOT, path.resolve(path.dirname(path.join(ROOT, file)), c)).replace(/\\/g, "/").toLowerCase()) || null;
}

const missing = [];
const pages = [];
for (const f of all) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const isHTML = /\.html$/i.test(f), isCSS = /\.css$/i.test(f), isJS = /\.js$/i.test(f);
  if (!isHTML && !isCSS && !isJS) continue;
  let txt = fs.readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const refs = [];
  const rx = /\b(src|href|srcset|poster|data-src|data-img|data-video)\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = rx.exec(txt))) {
    const key = m[1].toLowerCase();
    const val = m[2];
    if (!val || /^(https?:|data:|#|mailto:|tel:)/i.test(val)) continue;
    if (key === "srcset") { refs.push({ raw: val.split(",")[0].trim().split(/\s+/)[0], key }); continue; }
    refs.push({ raw: val, key });
  }
  const urx = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  while ((m = urx.exec(txt))) if (!/^(https?:|data:|#)/i.test(m[1])) refs.push({ raw: m[1], key: "css-url" });

  for (const r of refs) {
    if (!resolveRef(rel, r.raw)) missing.push(`${rel} -> ${r.raw}`);
  }
  if (isHTML) pages.push({ rel, txt });
}

console.log(`MISSING REFS: ${missing.length}`);
missing.slice(0, 25).forEach((x) => console.log("  " + x));

/* eager page weight using the AVIF source the browser will actually pick */
const size = (p) => fs.statSync(p).size;
const FONT_EST = 130000;
console.log("\nPAGE\tcrit_KB\t\ts@9Mbps\ts@1.6Mbps");
const rows = [];
for (const { rel, txt } of pages) {
  let css = 0, js = 0, media = 0;
  const linkRx = /<link\b[^>]*>/gi;
  let m;
  while ((m = linkRx.exec(txt))) {
    const href = (m[0].match(/href\s*=\s*"([^"]*)"/i) || [])[1];
    if (!href || /^https?:/i.test(href) || !/stylesheet/i.test(m[0])) continue;
    const a = resolveRef(rel, href); if (a) css += size(a);
  }
  const scrRx = /<script\b[^>]*src\s*=\s*"([^"]*)"/gi;
  while ((m = scrRx.exec(txt))) { if (/^https?:/i.test(m[1])) continue; const a = resolveRef(rel, m[1]); if (a) js += size(a); }
  const picRx = /<picture>([\s\S]*?)<\/picture>/gi;
  while ((m = picRx.exec(txt))) {
    if (/loading\s*=\s*"lazy"/i.test(m[1])) continue;
    const avif = (m[1].match(/srcset\s*=\s*"([^"]*)"/i) || [])[1];
    if (avif) { const a = resolveRef(rel, avif.split(",")[0].trim().split(/\s+/)[0]); if (a) media += size(a); }
  }
  const stripped = txt.replace(/<picture>[\s\S]*?<\/picture>/gi, "");
  const imgRx = /<img\b[^>]*>/gi;
  while ((m = imgRx.exec(stripped))) {
    if (/loading\s*=\s*"lazy"/i.test(m[0])) continue;
    const src = (m[0].match(/src\s*=\s*"([^"]*)"/i) || [])[1];
    if (!src || /^https?:/i.test(src)) continue;
    const a = resolveRef(rel, src); if (a) media += size(a);
  }
  const crit = size(path.join(ROOT, rel)) + css + js + media + FONT_EST;
  rows.push([rel, crit]);
}
rows.sort((a, b) => b[1] - a[1]);
for (const [rel, c] of rows.slice(0, 8)) {
  console.log(`${rel}\t${(c / 1024).toFixed(0)}\t\t${(c / 1.125e6).toFixed(2)}s\t${(c / 2e5).toFixed(1)}s`);
}
const blog = rows.find((r) => r[0].startsWith("Blog/") && r[0].endsWith("index.html"));
if (blog) console.log(`(blog sample ${blog[0]}: ${(blog[1] / 1024).toFixed(0)} KB, ${(blog[1] / 1.125e6).toFixed(2)}s @9Mbps)`);
