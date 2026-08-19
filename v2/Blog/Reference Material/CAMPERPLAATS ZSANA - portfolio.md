# Camperplaats Zsana — Web Design, Development, SEO & Content Portfolio

## Web Design & Development

### Trilingual Camperplaats Website — https://camperplaatszsana.nl
A fully custom-built, hand-coded website for a family-run motorhome campsite in the Hungarian puszta, delivered in Dutch, English and German. The site spans 30+ pages — homepage, stay & pitches, facilities, surroundings, birdwatching, about, guestbook, booking, contact and the legal pages — each with its own translated URL structure (`/verblijf/`, `/en/stay/`, `/de/aufenthalt/`).

The homepage combines a fullscreen hero video, an auto-advancing pitch carousel with image counter, a review slider, an image-swap "Our Story" section and a slide-in sidebar menu. A flag-based language switcher plus browser-language auto-redirect (with localStorage persistence) routes international visitors to the right version. The booking page features a custom inquiry form integrated with Web3Forms: AJAX submission, loading and success states, honeypot spam protection and input sanitisation against script injection, with Google Maps embedded for the exact location. A dedicated birdwatching page ships with a trilingual, downloadable bird checklist PDF (25+ species across four categories) generated server-side.

The site is engineered for performance: all imagery is converted to WebP (Sharp) and resized to a maximum of 1920px, the Tailwind CSS is minified and split into critical and async chunks, fonts load asynchronously with preconnect, media is cached immutable for a year via .htaccess, and a Content-Security-Policy header restricts what can execute on the page. It is deployed to Strato hosting through an automated SFTP pipeline that rebuilds the CSS and uploads only changed files.

**Languages & tools:** HTML5, CSS3, JavaScript, Tailwind CSS, Node.js, Sharp, PDFKit, Web3Forms, Umami Analytics, .htaccess, SSH/SFTP deployment

### Automated Multilingual Site Pipeline (NL → EN → DE)
The entire site is maintained from Dutch sources and mirrored into English and German through a custom Node.js pipeline. It generates the translated folder structures (`stay`, `about-us`, `birdwatching`, etc.), applies a large dictionary of manually curated translations across every page and metadata field (titles, descriptions, Open Graph), and re-injects the correct hreflang tags and cross-language links after each build.

**Languages & tools:** Node.js, JavaScript, JSON, regex, build-script automation

### Interactive Under-Construction Landing Page
A pre-launch landing page with the campsite branding, an animated hero, and a lead-capture form (Web3Forms) that collects e-mail addresses ahead of the official opening — so the business started building its mailing list before the site went live.

**Languages & tools:** HTML5, CSS3, JavaScript, Web3Forms

## SEO & Online Visibility

### On-Page SEO & Structured Data
Every page ships with hand-tuned titles, meta descriptions and keywords targeting real search intent (e.g. "camperplaats Hongarije", "vogelspotten Hongaarse puszta"), plus canonical URLs, Open Graph and Twitter Cards for social sharing. Structured data is implemented as JSON-LD — Campground, WebSite, BreadcrumbList and ReserveAction schemas — so search engines understand the business, location and booking action. A reusable injection script (`seo-inject.mjs`) keeps all metadata consistent across the whole site from a single configuration file, and the site is verified in Google Search Console.

**Languages & tools:** JSON-LD, Schema.org, Open Graph, Twitter Cards, Google Search Console, Node.js automation

### International SEO & Crawlability
- Full hreflang coverage (nl / en / de / x-default) on every page
- Complete XML sitemap with priorities and change frequencies
- `robots.txt` and `llms.txt` (AI/LLM discoverability)

**Languages & tools:** XML sitemaps, hreflang, robots.txt, llms.txt, Google Search Console

### Link-Building & Backlink Outreach
I researched and approached relevant publishers — travel bloggers, birdwatching experts and Hungarian tour operators — with personalised outreach e-mails to earn quality backlinks to the campsite. Prospects and follow-ups are tracked in an Excel pipeline, and a documented internal-linking strategy weaves 22 contextual links across the site's pages to reinforce its core theme.

**Languages & tools:** Excel, outreach copywriting, link-analysis research

### Local & Platform Listings
The campsite was set up and integrated with the platforms campers actually use: Campercontact, Park4Night, Facebook, Instagram and Google Maps, with social and platform links embedded in the site footer.

**Tools:** Google Maps / Google Business, Campercontact, Park4Night, Facebook, Instagram

## Branding & Design

### Logo Design & Favicon
Redesigned the Camperplaats Zsana logo into web-ready variants — main logo, navbar version, favicon and apple-touch-icon — exported in PNG and WebP with consistent, on-brand sizing.

**Tools:** Logo design, favicon generation, PNG/WebP export

### Visual Identity & Art Direction
A custom design system built around a warm, natural palette (beige #FFFAEA, green #206c34, charcoal #161108) with an editorial pairing of Noto Serif and Manrope. The same premium, "rustic luxury" art direction is applied consistently across all 30+ pages, from typography and iconography to buttons and modals.

**Tools:** Brand identity, colour system, typography (Google Fonts), UI/UX design

## Photography & Videography

### Photoshoot — Campsite & Puszta
A full photoshoot of the campsite in the soft morning light: 450+ RAW images captured on a Nikon DSLR covering every area — pitches, sanitary block, pool, playground, pets, signs and surroundings — supplemented by 200+ drone photos and clips for aerial context. Shots were culled, colour-graded and delivered per page category, ready for the website.

**Tools:** Nikon DSLR, RAW (NEF), DJI drone, photo editing & colour grading

### Hero Video Production
Filmed, edited and compressed the homepage hero video into three optimized versions (1080p desktop, mobile and a balanced MP4) so the cinematic first impression loads fast on any connection.

**Tools:** Video production & editing, HandBrake compression, MP4

### Automated Image Optimization Pipeline
Built a Node.js/Sharp batch pipeline that converts every photo to WebP, resizes oversized images to a maximum of 1920px and reports the size savings per file (typically ~80%). References in all HTML files are updated automatically, keeping the site fast without manual maintenance.

**Tools:** Node.js, Sharp, WebP, batch automation
