# TUINVOORJOU — Software, Automation & 3D Portfolio

## Software & Automation

### Automated Bookkeeping System (WooCommerce → Excel)
An end-to-end order automation pipeline that eliminates manual bookkeeping entry. The system connects to the company mailbox over IMAP (TLS/SSL), identifies new WooCommerce order notification e-mails, and parses the full order into structured data — order number, date, customer name, e-mail, phone, billing and shipping addresses, line items, prices, VAT, shipping costs, payment method and order notes. It even handles Dutch date formats and multi-part HTML e-mails automatically.

A built-in product catalogue maps every garden product (TUINSCHETS, TUINPLAN, BEPLANTINGSPLAN, 3D BEELDEN, DROOMTUINDEAL, etc.) to an estimated workload in hours, scaled by garden surface area (from <100m² to >2500m²). Each order is then written into a macro-enabled Excel workbook with automatically generated headers, currency and hours formatting, color-coded conditional formatting for the project status (Verwerken / Betaald / Te sturen / Overleg / Voltooid), dropdown data-validation, and live formulas for net margin and remaining hours. The script is duplication-safe (existing order numbers are skipped), creates automatic backups before every write, retries when the file is locked, and safely closes/reopens Excel via process management. Configuration is fully externalized in a JSON file.

**Languages & tools:** Python, Microsoft Excel VBA, IMAP, BeautifulSoup, openpyxl, psutil, JSON, Windows shell scripting

### E-mail Attachment & Project Folder Automation
A desktop tool that reads incoming client e-mails ("Aanlevering tuinontwerp") and fully automates project intake. It scans the mailbox, extracts the property address from the e-mail body, and automatically creates a correctly named project folder (`YYYY-MM-DD_Address`) in a predefined directory structure. All attached photos, videos and documents are downloaded and renamed by type with sequential numbering (foto 1, video 2, document 3, ...). The tool is delivered as a branded desktop GUI with a live progress bar, color-coded status log, network connectivity check, dry-run mode, and the ability to stop or scan more in batches of 25 e-mails. Already-processed projects are detected and skipped, making re-runs safe and idempotent.

**Languages & tools:** Python, tkinter (GUI), IMAP/SSL, Pillow, dotenv, threading, MIME parsing, regex

### Plattegrond Generator — https://tuinvoorjou.nl/plattegrond-generator/
A custom-built web tool that generates a professional, correctly scaled blueprint (plattegrond) of any address in the Netherlands or Belgium in seconds. The user enters an address and the tool geocodes it against national cadastral data (BAG/BGT for the Netherlands, GRB/CRAB for Belgium), renders the parcel with its buildings and garden boundaries on top of OpenLayers map tiles, and delivers a printable PDF.

The result is fully engineered: coordinate transformations between Dutch RD (EPSG:28992) and Belgian Lambert 72 (EPSG:31370) via proj4js, a true north arrow, scale presets from 1:50 to 1:1000, an integrated measurement/ruler tool, satellite or map view, adjustable grid, map rotation, watermark, and landscape/portrait output. The interface remembers each user's settings, supports touch on mobile, and produces print-ready PDFs via html2canvas + jsPDF. The PHP backend stores every generated PDF, logs each lead (name, e-mail, address, timestamp) to a CSV export with UTF-8 BOM so it opens cleanly in Excel, and e-mails the PDF to both the client and TUINVOORJOU using MIME attachments.

**Languages & tools:** HTML5, CSS3, JavaScript, PHP, OpenLayers, proj4js, WMTS tile services, BAG/GRB/CRAB geodata, html2canvas, jsPDF, SQL-free lead capture (CSV), MIME e-mail handling

### Tuincalculator — https://tuinvoorjou.nl/tuincalculator/
An interactive garden budget calculator that turns a visitor's wishes into a realistic cost estimate for a complete garden renovation. The interface walks users through the many factors that drive price — garden surface, materials, elements and product choices — and instantly visualises the estimate with live charts (Chart.js). It features a fully custom-designed UI with TUINVOORJOU branding, custom product imagery and logo integration. It went through multiple design iterations (v4 → v7) with a premium and a mobile-optimized version.

On submission, the PHP backend generates a structured XLSX lead report with collapsible group outlines (Plan/Schets sheets), stores the lead, renders a branded PDF containing the client's full calculation, and sends it to both the client and TUINVOORJOU. Leads are also pushed into the FluentCRM (WordPress) database via its REST API, so every calculation lands directly in the company CRM.

**Languages & tools:** HTML5, CSS3, JavaScript, Tailwind CSS, Chart.js, PHP, XLSX generation, PDF generation, WordPress REST API / FluentCRM integration

### Client Vragenlijst (Custom Intake Web Form) - https://tuinvoorjou.nl/tuin-aanleveren/
A custom-coded web form that gathers everything TUINVOORJOU needs to start a new garden project: client details, project wishes and file uploads (photos, PDFs, up to 50MB per submission). Submissions are automatically uploaded to Google Drive via OAuth 2.0 into a predefined, folder-structured workspace, and a PDF summary of the filled-in questionnaire is generated on the server. The form is hardened with CSRF token validation, per-IP rate limiting, strict upload type validation, oversized-upload handling and a test mode — production-ready and fully config-driven.

**Languages & tools:** HTML5, CSS3, JavaScript, PHP, Google Drive API (OAuth 2.0), TCPDF, JSON configuration, CSRF & rate-limit security, .htaccess / .user.ini server configuration

## 3D Modelling

### 3D Garden Models for TUINVOORJOU
For every garden design project I build a full 3D model of the client's garden. I start by reconstructing the base — the house and the garden perimeter — from TUINVOORJOU's technical drawings, blueprints and photographs of the exterior, then I design and build the complete garden from scratch, following the approved design plan. The result is a photorealistic 3D visualisation clients can walk through before anything is built.

Delivered on real client projects, including:
- **Prins Bernhardlaan 20, Uithoorn** — full model with iterative client feedback rounds (fence, stepping stones, play tree, hedge positioning and more refined per client requests)
- **Schootsestraat 28, Schijndel** — end-to-end project: tuinschets, tuinplan, beplantingsplan, matenplan and 3D model
- **DeEenhoorn 24, Middenbeemster** — full delivery set including planting plan and implementation plan
- **Van Bommellaan 9, Wassenaar** — 3D model from on-site survey data

The workflow is structured per project (aanlevering → offerte → factuur → schets → plan → 3D → beplantingsplan → matenplan → realisatie), and I maintain a reusable library of SketchUp assets (characters, doors, windows, planters) to keep models consistent and fast to produce.

**Tools:** SketchUp (skp), 3D modelling, asset libraries, design-to-3D pipeline, iterative client revision workflow

