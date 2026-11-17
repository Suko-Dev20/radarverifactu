import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const VS_DIR = path.join(PUBLIC_DIR, 'vs');
const SECTOR_DIR = path.join(PUBLIC_DIR, 'sector');
const GUIAS_DIR = path.join(PUBLIC_DIR, 'guias');

const affiliates = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'config', 'affiliates.json'), 'utf8')
);
const catalog = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'data', 'software_catalog.json'), 'utf8')
);

function ensureCleanDirs() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.mkdirSync(VS_DIR, { recursive: true });
  fs.mkdirSync(SECTOR_DIR, { recursive: true });
  fs.mkdirSync(GUIAS_DIR, { recursive: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getToolAffiliateUrl(toolId) {
  return affiliates.verifactu_links[toolId] || '#';
}

function getDealAffiliateUrl(deal) {
  return affiliates.lifetime_links[deal.affiliate_key] || affiliates.lifetime_links.appsumo_general || '#';
}

function formatEur(num) {
  return (
    Number(num).toLocaleString('es-ES', {
      minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
      maximumFractionDigits: 2
    }) + ' €'
  );
}

function getMonogram(name) {
  const clean = String(name || 'R').trim();
  return clean.slice(0, 2).toUpperCase();
}

function buildHeader(prefix = '') {
  const siteName = escapeHtml(affiliates.site.name || 'RadarVerifactu');
  const tgUrl = escapeHtml(affiliates.site.telegram_channel_url || '#');
  return `
  <header class="site-header">
    <div class="container header-inner">
      <a href="${prefix}index.html" class="brand">
        <span class="brand-badge">RV</span>
        <span class="brand-text">${siteName}</span>
      </a>
      <nav class="main-nav" aria-label="Navegación principal">
        <a href="${prefix}index.html#calculadora">Calculadora</a>
        <a href="${prefix}index.html#comparador">Software Verifactu</a>
        <a href="${prefix}index.html#chollos">Chollos Pago Único</a>
        <a href="${prefix}index.html#directorio">Comparativas</a>
      </nav>
      <a href="${tgUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
        Canal Telegram ↗
      </a>
    </div>
  </header>`;
}

function buildFooter(prefix = '') {
  const siteName = escapeHtml(affiliates.site.name || 'RadarVerifactu');
  const tgUrl = escapeHtml(affiliates.site.telegram_channel_url || '#');
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <div class="brand footer-brand">
          <span class="brand-badge">RV</span>
          <span class="brand-text">${siteName}</span>
        </div>
        <p class="footer-desc">
          Directorio minimalista de software de facturación adaptado a Verifactu y selección diaria de herramientas de pago único sin cuotas mensuales para pymes y autónomos.
        </p>
      </div>
      <div>
        <h4>Secciones</h4>
        <ul>
          <li><a href="${prefix}index.html#calculadora">Calculadora Verifactu + Ahorro</a></li>
          <li><a href="${prefix}index.html#comparador">Ranking Software Verifactu</a></li>
          <li><a href="${prefix}index.html#chollos">Cazador de Chollos Lifetime</a></li>
          <li><a href="${tgUrl}" target="_blank" rel="noopener">Alertas diarias en Telegram</a></li>
        </ul>
      </div>
      <div>
        <h4>Transparencia</h4>
        <p class="footer-note">
          Algunos enlaces son enlaces de afiliado: si contratas una herramienta desde ellos, recibimos una comisión sin coste extra para ti. Precios orientativos sujetos a cambios de cada proveedor.
        </p>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© ${year} ${siteName}. Guía informativa, no constituye asesoramiento fiscal vinculante.</span>
    </div>
  </footer>`;
}

function buildPageShell({ title, description, prefix = '', bodyHtml, includeAppScript = false }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google-site-verification" content="fkL6kpNosyhEGFbPwYwwnA_j84Iyc3axqm93PnOsFPY" />
  <meta name='impact-site-verification' value='eaec2a93-30ba-4d7d-9efa-8e92585d6d27'>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}styles.css">
</head>
<body>
  ${buildHeader(prefix)}
  <main>
    ${bodyHtml}
  </main>
  ${buildFooter(prefix)}
  ${includeAppScript ? `<script src="${prefix}app.js"></script>` : ''}
</body>
</html>`;
}

function buildStylesCss() {
  return `:root {
  --background: #ffffff;
  --surface-muted: #fafafa;
  --surface-subtle: #f4f4f5;
  --foreground: #09090b;
  --muted-foreground: #71717a;
  --border: #e4e4e7;
  --border-hover: #a1a1aa;
  --primary: #09090b;
  --primary-hover: #27272a;
  --primary-foreground: #fafafa;
  --emerald-bg: #ecfdf5;
  --emerald-border: #a7f3d0;
  --emerald-text: #047857;
  --amber-bg: #fffbeb;
  --amber-border: #fde68a;
  --amber-text: #b45309;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

section[id],
.filter-bar {
  scroll-margin-top: 84px;
}

body {
  font-family: var(--font-sans);
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  background-color: var(--background);
  color: var(--foreground);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

.mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Glassmorphism Claro */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--foreground);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.025em;
  color: var(--foreground);
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 0.89rem;
  font-weight: 500;
  color: var(--muted-foreground);
}

.main-nav a {
  transition: color 0.15s ease;
}

.main-nav a:hover {
  color: var(--foreground);
}

/* Buttons (shadcn/ui style) */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.89rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.btn-sm {
  padding: 7px 12px;
  font-size: 0.82rem;
}

.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--background);
  border: 1px solid var(--border);
  color: var(--foreground);
  box-shadow: var(--shadow-xs);
}

.btn-secondary:hover {
  background: var(--surface-subtle);
  border-color: var(--border-hover);
}

.btn-white {
  background: #ffffff;
  color: var(--foreground);
}

.btn-white:hover {
  background: var(--surface-subtle);
}

/* Hero Minimalista Luminoso (OpenAlternative + shadcn/ui) */
.hero {
  position: relative;
  background-color: var(--background);
  background-image: radial-gradient(#e4e4e7 1px, transparent 1px);
  background-size: 20px 20px;
  border-bottom: 1px solid var(--border);
  padding: 76px 0 64px;
  overflow: hidden;
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.92) 85%, #ffffff 100%);
  pointer-events: none;
}

.hero-inner {
  position: relative;
  z-index: 1;
}

.hero-center {
  max-width: 760px;
  margin: 0 auto 44px;
  text-align: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--background);
  border: 1px solid var(--border);
  color: var(--muted-foreground);
  font-size: 0.78rem;
  font-weight: 500;
  margin-bottom: 20px;
  box-shadow: var(--shadow-xs);
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
}

.hero h1 {
  font-size: clamp(2.1rem, 4.4vw, 3.25rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: var(--foreground);
  margin-bottom: 18px;
}

.hero p.lead {
  font-size: 1.08rem;
  color: var(--muted-foreground);
  margin: 0 auto 28px;
  max-width: 620px;
}

.hero p.lead strong {
  color: var(--foreground);
  font-weight: 600;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-xs);
}

.stat-value {
  display: block;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--foreground);
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: var(--muted-foreground);
  line-height: 1.45;
}

/* Sections */
.section {
  padding: 64px 0;
}

.section-alt {
  background: var(--surface-muted);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.section-header {
  max-width: 680px;
  margin-bottom: 32px;
}

.section-kicker {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  color: var(--muted-foreground);
  margin-bottom: 8px;
}

.section-header h2 {
  font-size: clamp(1.5rem, 2.8vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: var(--foreground);
  margin-bottom: 8px;
}

.section-header p {
  color: var(--muted-foreground);
  font-size: 0.97rem;
}

/* Calculator (shadcn/ui Dashboard style) */
.calc-wrapper {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
  padding: 28px;
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 28px;
}

.calc-step {
  margin-bottom: 22px;
}

.calc-step-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  color: var(--foreground);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--foreground);
  margin-bottom: 6px;
}

.field select {
  width: 100%;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--background);
  font-family: var(--font-sans);
  font-size: 0.88rem;
  color: var(--foreground);
  font-weight: 500;
  box-shadow: var(--shadow-xs);
}

.field select:focus {
  outline: 2px solid var(--foreground);
  outline-offset: -1px;
}

.deals-checklist {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.deal-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--background);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.deal-check:hover {
  border-color: var(--border-hover);
}

.deal-check:has(input:checked) {
  border-color: var(--foreground);
  background: var(--surface-muted);
}

.deal-check input {
  margin-top: 3px;
  accent-color: var(--primary);
  width: 15px;
  height: 15px;
}

.deal-check-meta strong {
  display: block;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--foreground);
}

.deal-check-meta span {
  font-size: 0.77rem;
  color: var(--muted-foreground);
}

.calc-results {
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.savings-banner {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  text-align: center;
  box-shadow: var(--shadow-xs);
}

.savings-metric small {
  display: block;
  font-size: 0.75rem;
  color: var(--muted-foreground);
  margin-bottom: 4px;
}

.savings-metric strong {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--foreground);
}

.savings-metric.metric-highlight strong {
  color: var(--emerald-text);
}

.result-block h3 {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 10px;
}

.rec-list {
  display: grid;
  gap: 8px;
}

.rec-card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.rec-card-info strong {
  display: block;
  color: var(--foreground);
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 4px;
}

.rec-card-info p {
  font-size: 0.8rem;
  color: var(--muted-foreground);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  border: 1px solid var(--border);
  background: var(--surface-subtle);
  color: var(--foreground);
}

.badge-green {
  background: var(--emerald-bg);
  border-color: var(--emerald-border);
  color: var(--emerald-text);
}

.badge-amber {
  background: var(--amber-bg);
  border-color: var(--amber-border);
  color: var(--amber-text);
}

.badge-neutral {
  background: var(--surface-subtle);
  border-color: var(--border);
  color: var(--muted-foreground);
}

/* Segmented Control Filters (shadcn Tabs) */
.filter-bar {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 24px;
}

.filter-btn {
  padding: 6px 14px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--muted-foreground);
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.filter-btn:hover {
  color: var(--foreground);
}

.filter-btn.active {
  background: var(--background);
  color: var(--foreground);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

/* OpenAlternative Directory Cards */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tool-card,
.deal-card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  transition: border-color 0.15s ease;
}

.tool-card:hover,
.deal-card:hover {
  border-color: var(--border-hover);
}

.tool-card.hidden {
  display: none;
}

.tool-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.tool-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-avatar {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--foreground);
  flex-shrink: 0;
}

.tool-identity h3 {
  font-size: 1.08rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--foreground);
  margin-bottom: 2px;
}

.score-pill {
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  color: var(--foreground);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: 0.78rem;
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.tool-price {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--foreground);
  margin-bottom: 10px;
}

.tool-desc {
  font-size: 0.88rem;
  color: var(--muted-foreground);
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--surface-subtle);
}

.check-list {
  list-style: none;
  display: grid;
  gap: 6px;
  font-size: 0.84rem;
  color: var(--foreground);
}

.check-list li::before {
  content: "✓ ";
  color: var(--emerald-text);
  font-weight: 700;
}

.cons-list {
  list-style: none;
  display: grid;
  gap: 6px;
  font-size: 0.84rem;
  color: var(--muted-foreground);
}

.cons-list li::before {
  content: "– ";
  color: var(--muted-foreground);
  font-weight: 700;
}

/* Lifetime Deals */
.deal-pricing-box {
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.price-caption {
  display: block;
  font-size: 0.73rem;
  color: var(--muted-foreground);
}

.price-old {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
  color: var(--muted-foreground);
  text-decoration: line-through;
}

.price-once {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 1.08rem;
  font-weight: 700;
  color: var(--emerald-text);
}

/* Directory Links */
.directory-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.dir-box {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 22px;
  box-shadow: var(--shadow-xs);
}

.dir-box h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--foreground);
}

.dir-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.dir-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  border: 1px solid var(--border);
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--foreground);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.dir-link::after {
  content: "→";
  color: var(--muted-foreground);
  font-size: 0.82rem;
}

.dir-link:hover {
  background: var(--background);
  border-color: var(--border-hover);
}

/* Telegram Banner (Minimal Monochrome CTA) */
.telegram-banner {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
  padding: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.telegram-banner h2 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin-bottom: 8px;
}

.telegram-banner p {
  color: #a1a1aa;
  font-size: 0.94rem;
  max-width: 620px;
}

/* Comparison & Sector Pages (Light Minimal Header) */
.page-hero {
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border);
  color: var(--foreground);
  padding: 40px 0;
}

.breadcrumb {
  font-size: 0.82rem;
  color: var(--muted-foreground);
  margin-bottom: 12px;
}

.breadcrumb a:hover {
  color: var(--foreground);
  text-decoration: underline;
}

.page-hero h1 {
  font-size: clamp(1.65rem, 3vw, 2.35rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 10px;
}

.page-hero p {
  color: var(--muted-foreground);
  max-width: 760px;
  font-size: 0.98rem;
}

.vs-table-wrap {
  overflow-x: auto;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
  margin-bottom: 24px;
}

table.vs-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

table.vs-table th,
table.vs-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
}

table.vs-table tr:last-child td {
  border-bottom: none;
}

table.vs-table th {
  background: var(--surface-muted);
  color: var(--foreground);
  font-weight: 600;
  font-size: 0.84rem;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 24px;
}

.verdict-box {
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 24px;
}

.verdict-box h2 {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--foreground);
  margin-bottom: 10px;
}

/* Footer Claro Minimalista */
.site-footer {
  background: var(--background);
  border-top: 1px solid var(--border);
  color: var(--muted-foreground);
  padding: 48px 0 28px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 1.2fr;
  gap: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--border);
}

.footer-brand {
  margin-bottom: 10px;
}

.footer-grid h4 {
  color: var(--foreground);
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.footer-grid ul {
  list-style: none;
  display: grid;
  gap: 7px;
  font-size: 0.86rem;
}

.footer-grid a:hover {
  color: var(--foreground);
  text-decoration: underline;
}

.footer-desc,
.footer-note {
  font-size: 0.85rem;
  color: var(--muted-foreground);
}

.footer-bottom {
  padding-top: 20px;
  font-size: 0.8rem;
  color: var(--muted-foreground);
}

@media (max-width: 960px) {
  .hero-stats,
  .calc-wrapper,
  .cards-grid,
  .directory-grid,
  .two-col,
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .telegram-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 680px) {
  .main-nav {
    display: none;
  }

  .form-grid,
  .deals-checklist,
  .dir-links,
  .savings-banner {
    grid-template-columns: 1fr;
  }
}
`;
}

function buildAppJs() {
  const clientPayload = {
    tools: catalog.verifactu_tools.map((t) => ({
      ...t,
      url: getToolAffiliateUrl(t.id)
    })),
    deals: catalog.lifetime_deals.map((d) => ({
      ...d,
      url: getDealAffiliateUrl(d)
    }))
  };

  return `window.RADAR_DATA = ${JSON.stringify(clientPayload)};

(function () {
  function initRadarPyme() {
    const data = window.RADAR_DATA;
    const profileSelect = document.getElementById('calc-profile');
    const volumeSelect = document.getElementById('calc-volume');
    const taxSelect = document.getElementById('calc-taxes');
    const dealCheckboxes = document.querySelectorAll('input[name="calc-deal"]');
    const calcBtn = document.getElementById('calc-run-btn');

    const metricYear1 = document.getElementById('metric-year1');
    const metricYear3 = document.getElementById('metric-year3');
    const metricPayback = document.getElementById('metric-payback');
    const recToolsWrap = document.getElementById('calc-rec-tools');
    const recDealsWrap = document.getElementById('calc-rec-deals');

    function scoreTool(tool, profile, volume, wantsTaxes) {
      let points = tool.score;
      if (tool.profiles.includes(profile)) {
        points += 3;
      }
      if (wantsTaxes === 'si' && (tool.id === 'declarando' || tool.id === 'quipu' || tool.id === 'contasimple')) {
        points += 2.5;
      }
      if (volume === 'bajo' && (tool.id === 'billin' || tool.id === 'contasimple')) {
        points += 2;
      }
      if (volume === 'alto' && (tool.id === 'holded' || tool.id === 'qonto')) {
        points += 2.5;
      }
      if (profile === 'autonomo' && tool.id === 'declarando' && wantsTaxes === 'si') {
        points += 1.5;
      }
      if (profile === 'pyme' && tool.id === 'declarando') {
        points -= 4;
      }
      return points;
    }

    function formatEuro(n) {
      return Math.round(n).toLocaleString('es-ES') + ' €';
    }

    function updateCalculator() {
      if (!profileSelect || !recToolsWrap || !recDealsWrap) return;

      const profile = profileSelect.value;
      const volume = volumeSelect.value;
      const wantsTaxes = taxSelect.value;

      const rankedTools = [...data.tools]
        .sort((a, b) => scoreTool(b, profile, volume, wantsTaxes) - scoreTool(a, profile, volume, wantsTaxes))
        .slice(0, 2);

      recToolsWrap.innerHTML = rankedTools
        .map(
          (t, idx) => \`
        <div class="rec-card">
          <div class="rec-card-info">
            <span class="badge \${idx === 0 ? 'badge-green' : 'badge-neutral'}">\${idx === 0 ? 'Opción #1 para tu perfil' : 'Alternativa recomendada'}</span>
            <strong>\${t.name} — \${t.price_label}</strong>
            <p>\${t.best_for}</p>
          </div>
          <a href="\${t.url}" target="_blank" rel="sponsored noopener" class="btn btn-primary btn-sm">
            Ver oferta ↗
          </a>
        </div>\`
        )
        .join('');

      const selectedIds = Array.from(dealCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

      const selectedDeals = data.deals.filter((d) => selectedIds.includes(d.id));

      let monthlySaved = 0;
      let lifetimeCost = 0;
      selectedDeals.forEach((d) => {
        monthlySaved += d.replaces_monthly_eur;
        lifetimeCost += d.lifetime_price_eur;
      });

      const year1Net = monthlySaved * 12 - lifetimeCost;
      const year3Net = monthlySaved * 36 - lifetimeCost;
      const paybackMonths = monthlySaved > 0 ? Math.max(1, Math.ceil(lifetimeCost / monthlySaved)) : 0;

      metricYear1.textContent = year1Net > 0 ? '+' + formatEuro(year1Net) : formatEuro(0);
      metricYear3.textContent = year3Net > 0 ? '+' + formatEuro(year3Net) : formatEuro(0);
      metricPayback.textContent = paybackMonths > 0 ? paybackMonths + (paybackMonths === 1 ? ' mes' : ' meses') : '—';

      if (selectedDeals.length === 0) {
        recDealsWrap.innerHTML = '<div class="rec-card"><div class="rec-card-info"><strong>Marca al menos una suscripción a la izquierda</strong><p>Verás cuánto dinero fijo te ahorras pasando a pago único.</p></div></div>';
      } else {
        recDealsWrap.innerHTML = selectedDeals
          .map((d) => {
            const annualSave = d.replaces_monthly_eur * 12 - d.lifetime_price_eur;
            return \`
          <div class="rec-card">
            <div class="rec-card-info">
              <span class="badge badge-amber">Sustituye a \${d.replaces} (\${d.replaces_monthly_eur} €/mes)</span>
              <strong>\${d.deal_name} · \${d.lifetime_price_eur} € pago único</strong>
              <p>Ahorro neto el primer año: <strong style="display:inline;margin:0;">\${formatEuro(annualSave)}</strong></p>
            </div>
            <a href="\${d.url}" target="_blank" rel="sponsored noopener" class="btn btn-secondary btn-sm">
              Ver chollo ↗
            </a>
          </div>\`;
          })
          .join('');
      }
    }

    if (calcBtn) {
      calcBtn.addEventListener('click', updateCalculator);
    }
    [profileSelect, volumeSelect, taxSelect].forEach((el) => {
      if (el) el.addEventListener('change', updateCalculator);
    });
    dealCheckboxes.forEach((cb) => cb.addEventListener('change', updateCalculator));

    updateCalculator();

    function applyFilter(target) {
      const filterBtns = document.querySelectorAll('.filter-btn');
      const toolCards = document.querySelectorAll('#comparador .tool-card');

      filterBtns.forEach((b) => {
        const isMatch = b.getAttribute('data-filter') === target;
        b.classList.toggle('active', isMatch);
        b.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      toolCards.forEach((card) => {
        const profiles = (card.getAttribute('data-profiles') || '').split(',');
        if (target === 'all' || profiles.includes(target)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    }

    document.addEventListener('click', (event) => {
      const btn = event.target && event.target.closest ? event.target.closest('.filter-btn') : null;
      if (!btn) return;
      const target = btn.getAttribute('data-filter') || 'all';
      applyFilter(target);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRadarPyme);
  } else {
    initRadarPyme();
  }
})();
`;
}

function buildIndexPage(vsPairs) {
  const tgUrl = escapeHtml(affiliates.site.telegram_channel_url || '#');

  const dealsCheckboxesHtml = catalog.lifetime_deals
    .map((deal, idx) => {
      const checkedAttr = idx < 2 ? 'checked' : '';
      return `
      <label class="deal-check">
        <input type="checkbox" name="calc-deal" value="${escapeHtml(deal.id)}" ${checkedAttr}>
        <span class="deal-check-meta">
          <strong>${escapeHtml(deal.replaces)} (${deal.replaces_monthly_eur} €/mes)</strong>
          <span>Cambiar por ${escapeHtml(deal.category)} (${deal.lifetime_price_eur} € único)</span>
        </span>
      </label>`;
    })
    .join('');

  const toolsCardsHtml = catalog.verifactu_tools
    .map((tool) => {
      const affUrl = escapeHtml(getToolAffiliateUrl(tool.id));
      return `
      <article class="tool-card" data-profiles="${escapeHtml(tool.profiles.join(','))}">
        <div>
          <div class="tool-top">
            <div class="tool-identity">
              <span class="tool-avatar">${escapeHtml(getMonogram(tool.name))}</span>
              <div>
                <h3>${escapeHtml(tool.name)}</h3>
                <span class="badge badge-green">Verifactu + Facturae</span>
              </div>
            </div>
            <span class="score-pill">${tool.score}/10</span>
          </div>
          <div class="tool-price">${escapeHtml(tool.price_label)}</div>
          <p class="tool-desc">${escapeHtml(tool.short_tagline)}</p>
          <ul class="check-list">
            ${tool.pros.slice(0, 3).map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>
        <div>
          <a href="${affUrl}" target="_blank" rel="sponsored noopener" class="btn btn-primary" style="width:100%;">
            Probar ${escapeHtml(tool.name)} (${escapeHtml(tool.free_trial)}) ↗
          </a>
        </div>
      </article>`;
    })
    .join('');

  const dealsCardsHtml = catalog.lifetime_deals
    .map((deal) => {
      const affUrl = escapeHtml(getDealAffiliateUrl(deal));
      const annualOld = deal.replaces_monthly_eur * 12;
      const year1Savings = annualOld - deal.lifetime_price_eur;
      return `
      <article class="deal-card">
        <div>
          <div class="tool-top">
            <div class="tool-identity">
              <span class="tool-avatar">${escapeHtml(getMonogram(deal.deal_name))}</span>
              <div>
                <span class="badge badge-neutral">${escapeHtml(deal.category)}</span>
              </div>
            </div>
            <span class="badge badge-green mono">-${year1Savings} € año 1</span>
          </div>
          <h3 style="margin: 0 0 6px; font-size: 1.05rem; font-weight: 600; color: var(--foreground);">${escapeHtml(deal.deal_name)}</h3>
          <p class="tool-desc">${escapeHtml(deal.summary)}</p>
          <div class="deal-pricing-box">
            <div>
              <span class="price-caption">En vez de ${escapeHtml(deal.replaces)}</span>
              <span class="price-old">${deal.replaces_monthly_eur} €/mes (${annualOld} €/año)</span>
            </div>
            <div style="text-align:right;">
              <span class="price-caption">Pago único</span>
              <span class="price-once">${deal.lifetime_price_eur} €</span>
            </div>
          </div>
          <ul class="check-list" style="margin-top:12px;">
            ${deal.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
          </ul>
        </div>
        <a href="${affUrl}" target="_blank" rel="sponsored noopener" class="btn btn-secondary" style="width:100%;">
          Ver oferta Pago Único ↗
        </a>
      </article>`;
    })
    .join('');

  const vsLinksHtml = vsPairs
    .map(
      ({ a, b, slug }) =>
        `<a class="dir-link" href="vs/${slug}.html">${escapeHtml(a.name)} vs ${escapeHtml(b.name)}</a>`
    )
    .join('');

  const sectorLinksHtml = catalog.professions
    .map(
      (p) =>
        `<a class="dir-link" href="sector/mejor-software-verifactu-${escapeHtml(p.slug)}.html">${escapeHtml(p.short_name)}</a>`
    )
    .join('');

  const guideLinksHtml = (catalog.faq_guides || [])
    .map(
      (g) =>
        `<a class="dir-link" href="guias/${escapeHtml(g.slug)}.html">${escapeHtml(g.short_title)}</a>`
    )
    .join('');

  const bodyHtml = `
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-center">
        <span class="pill"><span class="pill-dot"></span> Ley Antifraude España · Verifactu + Ahorro SaaS</span>
        <h1>Elige tu Software Verifactu y elimina suscripciones mensuales caras</h1>
        <p class="lead">
          Compara los programas de facturación homologados en España y descubre qué herramientas de <strong>pago único de por vida</strong> sustituyen a cuotas de 15 €–40 €/mes.
        </p>
        <div class="hero-actions">
          <a href="#calculadora" class="btn btn-primary">Usar Calculadora Verifactu + Ahorro</a>
          <a href="#chollos" class="btn btn-secondary">Ver Chollos Pago Único</a>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-value">100% Verifactu</span>
          <span class="stat-label">Programas analizados listos para el reglamento antifraude y Facturae</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">+1.000 €/año</span>
          <span class="stat-label">Ahorro medio sustituyendo SaaS mensuales por licencias de pago único</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${vsPairs.length + catalog.professions.length + (catalog.faq_guides || []).length} Guías</span>
          <span class="stat-label">Comparativas directas, rankings por profesión y dudas Verifactu</span>
        </div>
      </div>
    </div>
  </section>

  <section id="calculadora" class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-kicker">Herramienta interactiva</span>
        <h2>Calculadora Verifactu + Ahorro en Software</h2>
        <p>Indica tu perfil de negocio y qué suscripciones mensuales pagas hoy para calcular tu combinación óptima y cuánto dinero ahorras el primer año.</p>
      </div>

      <div class="calc-wrapper">
        <div>
          <div class="calc-step">
            <div class="calc-step-title"><span class="step-num">1</span> Tu negocio y facturación</div>
            <div class="form-grid">
              <div class="field">
                <label for="calc-profile">Tipo de actividad</label>
                <select id="calc-profile">
                  <option value="autonomo">Autónomo / Freelance</option>
                  <option value="pyme">Pyme / Sociedad Limitada</option>
                  <option value="servicios">Agencia / Servicios / Clínica</option>
                  <option value="comercio">Comercio / Tienda / Reformas</option>
                </select>
              </div>
              <div class="field">
                <label for="calc-volume">Facturas al mes</label>
                <select id="calc-volume">
                  <option value="bajo">1 a 15 facturas/mes</option>
                  <option value="medio">15 a 50 facturas/mes</option>
                  <option value="alto">Más de 50 facturas/mes</option>
                </select>
              </div>
            </div>
            <div class="field" style="margin-top:12px;">
              <label for="calc-taxes">¿Quieres que el programa te ayude o presente modelos de impuestos?</label>
              <select id="calc-taxes">
                <option value="no">No, ya tengo gestoría o solo quiero facturar</option>
                <option value="si">Sí, quiero previsión o presentación automática</option>
              </select>
            </div>
          </div>

          <div class="calc-step" style="margin-bottom:14px;">
            <div class="calc-step-title"><span class="step-num">2</span> ¿Qué cuotas mensuales quieres eliminar?</div>
            <div class="deals-checklist">
              ${dealsCheckboxesHtml}
            </div>
          </div>

          <button id="calc-run-btn" type="button" class="btn btn-primary" style="width:100%;">
            Recalcular combinación óptima y ahorro
          </button>
        </div>

        <div class="calc-results" aria-live="polite">
          <div class="savings-banner">
            <div class="savings-metric metric-highlight">
              <small>Ahorro neto Año 1</small>
              <strong id="metric-year1">+0 €</strong>
            </div>
            <div class="savings-metric">
              <small>Ahorro en 3 años</small>
              <strong id="metric-year3">+0 €</strong>
            </div>
            <div class="savings-metric">
              <small>Amortización</small>
              <strong id="metric-payback">—</strong>
            </div>
          </div>

          <div class="result-block">
            <h3>Tu Top 2 Software Verifactu recomendado</h3>
            <div id="calc-rec-tools" class="rec-list"></div>
          </div>

          <div class="result-block">
            <h3>Tus Chollos de Pago Único seleccionados</h3>
            <div id="calc-rec-deals" class="rec-list"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="comparador" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <span class="section-kicker">Software homologado</span>
        <h2>Comparador de Programas Verifactu en España</h2>
        <p>Filtra según tu tipo de negocio para ver los precios reales, pruebas gratuitas y puntos fuertes de cada plataforma.</p>
      </div>

      <div class="filter-bar">
        <button class="filter-btn active" data-filter="all" type="button" aria-pressed="true">Todos (6)</button>
        <button class="filter-btn" data-filter="autonomo" type="button" aria-pressed="false">Autónomos</button>
        <button class="filter-btn" data-filter="pyme" type="button" aria-pressed="false">Pymes / S.L.</button>
        <button class="filter-btn" data-filter="servicios" type="button" aria-pressed="false">Servicios y Agencias</button>
        <button class="filter-btn" data-filter="comercio" type="button" aria-pressed="false">Comercios</button>
      </div>

      <div class="cards-grid">
        ${toolsCardsHtml}
      </div>
    </div>
  </section>

  <section id="chollos" class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-kicker">Lifetime Deals</span>
        <h2>Chollos de Software de Pago Único</h2>
        <p>Alternativas seleccionadas que se pagan una sola vez para toda la vida y sustituyen suscripciones mensuales recurrentes.</p>
      </div>

      <div class="cards-grid">
        ${dealsCardsHtml}
      </div>
    </div>
  </section>

  <section id="directorio" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <span class="section-kicker">Directorio</span>
        <h2>Comparativas Cara a Cara y Guías por Sector</h2>
        <p>Consulta nuestras fichas detalladas si dudas entre dos plataformas concretas o buscas el stack ideal para tu profesión.</p>
      </div>

      <div class="directory-grid">
        <div class="dir-box">
          <h3>Comparativas Directas (${vsPairs.length} análisis)</h3>
          <div class="dir-links">
            ${vsLinksHtml}
          </div>
        </div>
        <div class="dir-box">
          <h3>Guías por Profesión (${catalog.professions.length} sectores)</h3>
          <div class="dir-links" style="margin-bottom:20px;">
            ${sectorLinksHtml}
          </div>
          <h3>Dudas Frecuentes Verifactu (${(catalog.faq_guides || []).length} guías)</h3>
          <div class="dir-links">
            ${guideLinksHtml}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="telegram-banner">
        <div>
          <h2>Recibe 1 Chollo de Software y Alertas Verifactu cada mañana</h2>
          <p>Nuestro radar automatizado analiza cada día nuevas ofertas de pago único y cambios fiscales para pymes y los resume en español en el canal de Telegram.</p>
        </div>
        <a href="${tgUrl}" target="_blank" rel="noopener" class="btn btn-white">
          Unirme gratis al Canal ↗
        </a>
      </div>
    </div>
  </section>`;

  return buildPageShell({
    title: `${affiliates.site.name} — Calculadora Verifactu y Chollos de Software Pago Único`,
    description: affiliates.site.tagline,
    prefix: '',
    bodyHtml,
    includeAppScript: true
  });
}

function buildVsPage(a, b, slug, allPairs) {
  const urlA = escapeHtml(getToolAffiliateUrl(a.id));
  const urlB = escapeHtml(getToolAffiliateUrl(b.id));
  const winner = a.score >= b.score ? a : b;
  const cheaper = a.monthly_price <= b.monthly_price ? a : b;

  const otherPairsHtml = allPairs
    .filter((p) => p.slug !== slug)
    .slice(0, 6)
    .map((p) => `<a class="dir-link" href="${p.slug}.html">${escapeHtml(p.a.name)} vs ${escapeHtml(p.b.name)}</a>`)
    .join('');

  const bodyHtml = `
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb">
        <a href="../index.html">Inicio</a> &rsaquo; <a href="../index.html#directorio">Comparativas</a> &rsaquo; ${escapeHtml(a.name)} vs ${escapeHtml(b.name)}
      </div>
      <h1>${escapeHtml(a.name)} vs ${escapeHtml(b.name)}: ¿Cuál elegir para Verifactu?</h1>
      <p>Análisis práctico frente a frente: precios mensuales reales, facilidad de uso, impuestos, pros, contras y recomendación según tu tipo de negocio en España.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="vs-table-wrap">
        <table class="vs-table">
          <thead>
            <tr>
              <th>Criterio</th>
              <th>${escapeHtml(a.name)}</th>
              <th>${escapeHtml(b.name)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Puntuación RadarVerifactu</strong></td>
              <td><span class="badge badge-green mono">${a.score} / 10</span></td>
              <td><span class="badge badge-neutral mono">${b.score} / 10</span></td>
            </tr>
            <tr>
              <td><strong>Precio orientativo</strong></td>
              <td class="mono" style="font-size:0.84rem;">${escapeHtml(a.price_label)}</td>
              <td class="mono" style="font-size:0.84rem;">${escapeHtml(b.price_label)}</td>
            </tr>
            <tr>
              <td><strong>Prueba gratuita</strong></td>
              <td>${escapeHtml(a.free_trial)}</td>
              <td>${escapeHtml(b.free_trial)}</td>
            </tr>
            <tr>
              <td><strong>Verifactu / Facturae</strong></td>
              <td>✓ Preparado</td>
              <td>✓ Preparado</td>
            </tr>
            <tr>
              <td><strong>Ideal para</strong></td>
              <td>${escapeHtml(a.best_for)}</td>
              <td>${escapeHtml(b.best_for)}</td>
            </tr>
            <tr>
              <td><strong>Enlace directo</strong></td>
              <td><a href="${urlA}" target="_blank" rel="sponsored noopener" class="btn btn-primary btn-sm">Ir a ${escapeHtml(a.name)} ↗</a></td>
              <td><a href="${urlB}" target="_blank" rel="sponsored noopener" class="btn btn-secondary btn-sm">Ir a ${escapeHtml(b.name)} ↗</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="two-col">
        <div class="tool-card">
          <div>
            <div class="tool-top">
              <div class="tool-identity">
                <span class="tool-avatar">${escapeHtml(getMonogram(a.name))}</span>
                <h3>Lo mejor y lo peor de ${escapeHtml(a.name)}</h3>
              </div>
              <span class="score-pill">${a.score}/10</span>
            </div>
            <p class="tool-desc">${escapeHtml(a.short_tagline)}</p>
            <strong style="display:block;margin-bottom:6px;font-size:0.86rem;">Ventajas</strong>
            <ul class="check-list" style="margin-bottom:14px;">
              ${a.pros.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
            </ul>
            <strong style="display:block;margin-bottom:6px;font-size:0.86rem;">A tener en cuenta</strong>
            <ul class="cons-list">
              ${a.cons.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>
          <a href="${urlA}" target="_blank" rel="sponsored noopener" class="btn btn-primary" style="width:100%;">
            Probar ${escapeHtml(a.name)} (${escapeHtml(a.free_trial)}) ↗
          </a>
        </div>

        <div class="tool-card">
          <div>
            <div class="tool-top">
              <div class="tool-identity">
                <span class="tool-avatar">${escapeHtml(getMonogram(b.name))}</span>
                <h3>Lo mejor y lo peor de ${escapeHtml(b.name)}</h3>
              </div>
              <span class="score-pill">${b.score}/10</span>
            </div>
            <p class="tool-desc">${escapeHtml(b.short_tagline)}</p>
            <strong style="display:block;margin-bottom:6px;font-size:0.86rem;">Ventajas</strong>
            <ul class="check-list" style="margin-bottom:14px;">
              ${b.pros.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
            </ul>
            <strong style="display:block;margin-bottom:6px;font-size:0.86rem;">A tener en cuenta</strong>
            <ul class="cons-list">
              ${b.cons.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>
          <a href="${urlB}" target="_blank" rel="sponsored noopener" class="btn btn-secondary" style="width:100%;">
            Probar ${escapeHtml(b.name)} (${escapeHtml(b.free_trial)}) ↗
          </a>
        </div>
      </div>

      <div class="verdict-box">
        <h2>Veredicto rápido: ¿${escapeHtml(a.name)} o ${escapeHtml(b.name)}?</h2>
        <p style="margin-bottom:12px; font-size:0.93rem; color:var(--muted-foreground);">
          Por valoración global, <strong style="color:var(--foreground);">${escapeHtml(winner.name)} (${winner.score}/10)</strong> ofrece un conjunto más completo, mientras que <strong style="color:var(--foreground);">${escapeHtml(cheaper.name)} (${formatEur(cheaper.monthly_price)}/mes aprox.)</strong> resulta más económico si buscas ajustar la cuota fija mensual.
        </p>
        <ul class="check-list">
          <li><strong>Elige ${escapeHtml(a.name)}</strong> si encaja con: ${escapeHtml(a.best_for)}</li>
          <li><strong>Elige ${escapeHtml(b.name)}</strong> si buscas principalmente: ${escapeHtml(b.best_for)}</li>
        </ul>
        <div style="margin-top:16px;">
          <a href="../index.html#calculadora" class="btn btn-secondary btn-sm">Volver a la Calculadora Verifactu + Ahorro</a>
        </div>
      </div>

      <div class="dir-box">
        <h3>Otras comparativas relacionadas</h3>
        <div class="dir-links">
          ${otherPairsHtml}
        </div>
      </div>
    </div>
  </section>`;

  return buildPageShell({
    title: `${a.name} vs ${b.name} (Verifactu): Comparativa y Precios | ${affiliates.site.name}`,
    description: `Comparamos ${a.name} y ${b.name} para cumplir con Verifactu en España: precios, prueba gratuita, pros, contras y cuál conviene más.`,
    prefix: '../',
    bodyHtml
  });
}

function buildSectorPage(profession) {
  const recTools = profession.recommended_ids
    .map((id) => catalog.verifactu_tools.find((t) => t.id === id))
    .filter(Boolean);

  const recDeals = profession.recommended_deals
    .map((id) => catalog.lifetime_deals.find((d) => d.id === id))
    .filter(Boolean);

  const totalDealAnnualSavings = recDeals.reduce(
    (sum, d) => sum + (d.replaces_monthly_eur * 12 - d.lifetime_price_eur),
    0
  );

  const bodyHtml = `
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb">
        <a href="../index.html">Inicio</a> &rsaquo; <a href="../index.html#directorio">Sectores</a> &rsaquo; ${escapeHtml(profession.short_name)}
      </div>
      <h1>Mejor software Verifactu para ${escapeHtml(profession.title)}</h1>
      <p>${escapeHtml(profession.pain_point)} · Volumen habitual: <strong style="color:var(--foreground);">${escapeHtml(profession.monthly_invoices_avg)}</strong>.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-header">
        <span class="section-kicker">Top 3 Facturación Homologada</span>
        <h2>Programas Verifactu recomendados para ${escapeHtml(profession.short_name)}</h2>
      </div>

      <div class="cards-grid" style="margin-bottom:44px;">
        ${recTools
          .map((tool, idx) => {
            const url = escapeHtml(getToolAffiliateUrl(tool.id));
            return `
            <article class="tool-card">
              <div>
                <div class="tool-top">
                  <div class="tool-identity">
                    <span class="tool-avatar">${escapeHtml(getMonogram(tool.name))}</span>
                    <div>
                      <h3>${escapeHtml(tool.name)}</h3>
                      <span class="badge ${idx === 0 ? 'badge-green' : 'badge-neutral'}">#${idx + 1} Recomendado</span>
                    </div>
                  </div>
                  <span class="score-pill">${tool.score}/10</span>
                </div>
                <div class="tool-price">${escapeHtml(tool.price_label)}</div>
                <p class="tool-desc">${escapeHtml(tool.best_for)}</p>
                <ul class="check-list">
                  ${tool.pros.slice(0, 3).map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
                </ul>
              </div>
              <a href="${url}" target="_blank" rel="sponsored noopener" class="btn btn-primary" style="width:100%;">
                Probar ${escapeHtml(tool.name)} ↗
              </a>
            </article>`;
          })
          .join('')}
      </div>

      <div class="section-header">
        <span class="section-kicker">Ahorro en herramientas del sector</span>
        <h2>Chollos de Pago Único recomendados (Ahorro año 1: ${totalDealAnnualSavings} €)</h2>
        <p>Combina tu programa Verifactu con estas licencias sin cuotas mensuales pensadas para ${escapeHtml(profession.short_name)}.</p>
      </div>

      <div class="two-col">
        ${recDeals
          .map((deal) => {
            const url = escapeHtml(getDealAffiliateUrl(deal));
            return `
            <article class="deal-card">
              <div>
                <span class="badge badge-amber">Sustituye a ${escapeHtml(deal.replaces)} (${deal.replaces_monthly_eur} €/mes)</span>
                <h3 style="margin:10px 0 6px;font-size:1.05rem;font-weight:600;color:var(--foreground);">${escapeHtml(deal.deal_name)}</h3>
                <p class="tool-desc">${escapeHtml(deal.summary)}</p>
                <div class="deal-pricing-box">
                  <span class="price-old">${deal.replaces_monthly_eur * 12} €/año</span>
                  <span class="price-once">${deal.lifetime_price_eur} € pago único</span>
                </div>
              </div>
              <a href="${url}" target="_blank" rel="sponsored noopener" class="btn btn-secondary" style="width:100%;">
                Aprovechar chollo pago único ↗
              </a>
            </article>`;
          })
          .join('')}
      </div>

      <div class="verdict-box">
        <h2>3 Claves prácticas para ${escapeHtml(profession.short_name)}</h2>
        <ul class="check-list" style="margin-bottom:16px;">
          ${profession.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
        <a href="../index.html#calculadora" class="btn btn-primary btn-sm">Calcular mi ahorro exacto en la Calculadora</a>
      </div>
    </div>
  </section>`;

  return buildPageShell({
    title: `Mejor Software Verifactu para ${profession.title} | ${affiliates.site.name}`,
    description: `${profession.pain_point} Comparativa de programas de facturación Verifactu y herramientas de pago único para ${profession.short_name}.`,
    prefix: '../',
    bodyHtml
  });
}

function buildGuidePage(guide) {
  const recTools = (guide.recommended_tool_ids || [])
    .map((id) => catalog.verifactu_tools.find((t) => t.id === id))
    .filter(Boolean);

  const otherGuidesHtml = (catalog.faq_guides || [])
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 6)
    .map((g) => `<a class="dir-link" href="${escapeHtml(g.slug)}.html">${escapeHtml(g.short_title)}</a>`)
    .join('');

  const bodyHtml = `
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb">
        <a href="../index.html">Inicio</a> &rsaquo; <a href="../index.html#directorio">Guías Verifactu</a> &rsaquo; ${escapeHtml(guide.short_title)}
      </div>
      <h1>${escapeHtml(guide.title)}</h1>
      <p>${escapeHtml(guide.summary)}</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="verdict-box">
        <h2>Respuesta directa</h2>
        <p style="margin-bottom:14px; font-size:0.96rem; color:var(--foreground);">${escapeHtml(guide.direct_answer)}</p>
        <ul class="check-list" style="margin-bottom:16px;">
          ${guide.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
        <a href="../index.html#calculadora" class="btn btn-primary btn-sm">Calcular mi combinación óptima gratis</a>
      </div>

      <div class="section-header">
        <span class="section-kicker">Opciones recomendadas</span>
        <h2>Programas homologados recomendados para este caso</h2>
      </div>

      <div class="two-col">
        ${recTools
          .map((tool, idx) => {
            const url = escapeHtml(getToolAffiliateUrl(tool.id));
            return `
            <article class="tool-card">
              <div>
                <div class="tool-top">
                  <div class="tool-identity">
                    <span class="tool-avatar">${escapeHtml(getMonogram(tool.name))}</span>
                    <div>
                      <h3>${escapeHtml(tool.name)}</h3>
                      <span class="badge ${idx === 0 ? 'badge-green' : 'badge-neutral'}">Verifactu + Facturae</span>
                    </div>
                  </div>
                  <span class="score-pill">${tool.score}/10</span>
                </div>
                <div class="tool-price">${escapeHtml(tool.price_label)}</div>
                <p class="tool-desc">${escapeHtml(tool.best_for)}</p>
                <ul class="check-list">
                  ${tool.pros.slice(0, 3).map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
                </ul>
              </div>
              <a href="${url}" target="_blank" rel="sponsored noopener" class="btn btn-primary" style="width:100%;">
                Probar ${escapeHtml(tool.name)} (${escapeHtml(tool.free_trial)}) ↗
              </a>
            </article>`;
          })
          .join('')}
      </div>

      <div class="dir-box">
        <h3>Otras dudas frecuentes sobre Verifactu</h3>
        <div class="dir-links">
          ${otherGuidesHtml}
        </div>
      </div>
    </div>
  </section>`;

  return buildPageShell({
    title: `${guide.title} | ${affiliates.site.name}`,
    description: guide.summary,
    prefix: '../',
    bodyHtml
  });
}

function buildSitemap(vsPairs) {
  const domain = (affiliates.site.domain || 'https://radar-verifactu.pages.dev').replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    `${domain}/`,
    ...vsPairs.map((p) => `${domain}/vs/${p.slug}.html`),
    ...catalog.professions.map((p) => `${domain}/sector/mejor-software-verifactu-${p.slug}.html`),
    ...(catalog.faq_guides || []).map((g) => `${domain}/guias/${g.slug}.html`)
  ];

  const items = urls
    .map(
      (u, i) => `  <url>
    <loc>${escapeHtml(u)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${i === 0 ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>
`;
}

function main() {
  ensureCleanDirs();

  const tools = catalog.verifactu_tools;
  const vsPairs = [];
  for (let i = 0; i < tools.length; i++) {
    for (let j = i + 1; j < tools.length; j++) {
      const a = tools[i];
      const b = tools[j];
      vsPairs.push({ a, b, slug: `${a.id}-vs-${b.id}` });
    }
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'styles.css'), buildStylesCss(), 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'app.js'), buildAppJs(), 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), buildIndexPage(vsPairs), 'utf8');

  for (const pair of vsPairs) {
    const html = buildVsPage(pair.a, pair.b, pair.slug, vsPairs);
    fs.writeFileSync(path.join(VS_DIR, `${pair.slug}.html`), html, 'utf8');
  }

  for (const prof of catalog.professions) {
    const html = buildSectorPage(prof);
    fs.writeFileSync(
      path.join(SECTOR_DIR, `mejor-software-verifactu-${prof.slug}.html`),
      html,
      'utf8'
    );
  }

  for (const guide of catalog.faq_guides || []) {
    const html = buildGuidePage(guide);
    fs.writeFileSync(path.join(GUIAS_DIR, `${guide.slug}.html`), html, 'utf8');
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), buildSitemap(vsPairs), 'utf8');
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${(affiliates.site.domain || 'https://radar-verifactu.pages.dev').replace(/\/+$/, '')}/sitemap.xml\n`,
    'utf8'
  );

  console.log(
    `[OK] Sitio generado en ${PUBLIC_DIR}: 1 index.html, ${vsPairs.length} páginas VS, ${catalog.professions.length} páginas sectoriales, ${(catalog.faq_guides || []).length} guías FAQ, sitemap.xml y robots.txt.`
  );
}

main();
