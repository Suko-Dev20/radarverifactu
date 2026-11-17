import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const affiliates = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'config', 'affiliates.json'), 'utf8')
);
const catalog = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'data', 'software_catalog.json'), 'utf8')
);

function parseArgs(argv) {
  const args = { dryRun: false, mode: 'auto' };
  for (const arg of argv) {
    if (arg === '--dry-run') args.dryRun = true;
    if (arg.startsWith('--mode=')) args.mode = arg.split('=')[1];
  }
  return args;
}

function escapeTelegramHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function pickByDay(items) {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return items[dayOfYear % items.length];
}

function buildDealPost(deal) {
  const affUrl =
    affiliates.lifetime_links[deal.affiliate_key] ||
    affiliates.lifetime_links.appsumo_general ||
    affiliates.site.domain;
  const siteUrl = (affiliates.site.domain || 'https://radar-verifactu.pages.dev').replace(/\/+$/, '');
  const annualOld = deal.replaces_monthly_eur * 12;
  const savings = annualOld - deal.lifetime_price_eur;

  const featuresLines = deal.features.map((f) => `• ${escapeTelegramHtml(f)}`).join('\n');

  return {
    contextPrompt: `Redacta un post corto y persuasivo en español para un canal de Telegram de pymes y autónomos sobre esta oferta de pago único:\nHerramienta: ${deal.deal_name}\nSustituye a: ${deal.replaces} (${deal.replaces_monthly_eur} €/mes)\nPrecio pago único: ${deal.lifetime_price_eur} €\nAhorro año 1: ${savings} €\nResumen: ${deal.summary}\nUsa HTML de Telegram (<b>, <i>, <a href="...">) en máximo 12 líneas e incluye exactamente este enlace de afiliado: ${affUrl} y el enlace a la calculadora: ${siteUrl}/#calculadora`,
    fallbackHtml: [
      `🔥 <b>CHOLLO DE SOFTWARE PAGO ÚNICO</b>`,
      ``,
      `💳 <b>${escapeTelegramHtml(deal.deal_name)}</b>`,
      `❌ Deja de pagar <b>${deal.replaces_monthly_eur} €/mes</b> (${annualOld} €/año) en ${escapeTelegramHtml(deal.replaces)}.`,
      `✅ Llévatelo hoy por <b>${deal.lifetime_price_eur} € pago único de por vida</b> (ahorras <b>${savings} €</b> solo el primer año).`,
      ``,
      `📌 <i>${escapeTelegramHtml(deal.summary)}</i>`,
      featuresLines,
      ``,
      `👉 <a href="${escapeTelegramHtml(affUrl)}">Ver oferta de pago único aquí</a>`,
      `🧮 <a href="${escapeTelegramHtml(siteUrl)}/#calculadora">Calcula cuánto ahorras con tu negocio</a>`
    ].join('\n')
  };
}

function buildVerifactuPost(toolA, toolB) {
  const urlA = affiliates.verifactu_links[toolA.id] || affiliates.site.domain;
  const urlB = affiliates.verifactu_links[toolB.id] || affiliates.site.domain;
  const siteUrl = (affiliates.site.domain || 'https://radar-verifactu.pages.dev').replace(/\/+$/, '');
  const vsUrl = `${siteUrl}/vs/${toolA.id}-vs-${toolB.id}.html`;

  return {
    contextPrompt: `Redacta un post breve y práctico en español para Telegram sobre Verifactu comparando ${toolA.name} (${toolA.price_label}) vs ${toolB.name} (${toolB.price_label}). Usa HTML de Telegram (<b>, <i>, <a href="...">) e incluye los enlaces: ${urlA}, ${urlB} y la comparativa ${vsUrl}`,
    fallbackHtml: [
      `⚖️ <b>RADAR VERIFACTU: ${escapeTelegramHtml(toolA.name)} vs ${escapeTelegramHtml(toolB.name)}</b>`,
      ``,
      `Si buscas programa homologado para la Ley Antifraude en España, aquí tienes el resumen rápido:`,
      ``,
      `1️⃣ <b>${escapeTelegramHtml(toolA.name)}</b> (${toolA.score}/10) — ${escapeTelegramHtml(toolA.price_label)}`,
      `👍 Ideal si: ${escapeTelegramHtml(toolA.best_for)}`,
      `👉 <a href="${escapeTelegramHtml(urlA)}">Probar ${escapeTelegramHtml(toolA.name)} (${escapeTelegramHtml(toolA.free_trial)})</a>`,
      ``,
      `2️⃣ <b>${escapeTelegramHtml(toolB.name)}</b> (${toolB.score}/10) — ${escapeTelegramHtml(toolB.price_label)}`,
      `👍 Ideal si: ${escapeTelegramHtml(toolB.best_for)}`,
      `👉 <a href="${escapeTelegramHtml(urlB)}">Probar ${escapeTelegramHtml(toolB.name)} (${escapeTelegramHtml(toolB.free_trial)})</a>`,
      ``,
      `📊 <a href="${escapeTelegramHtml(vsUrl)}">Leer tabla comparativa completa</a>`
    ].join('\n')
  };
}

async function generateWithGeminiIfConfigured(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini API HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? text.trim() : null;
}

async function sendTelegramMessage(htmlText) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error('Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en las variables de entorno.');
  }

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })
  });

  const payload = await res.json();
  if (!res.ok || !payload.ok) {
    throw new Error(`Error Telegram API: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function main() {
  const { dryRun, mode } = parseArgs(process.argv.slice(2));

  let chosenMode = mode;
  if (chosenMode === 'auto') {
    const day = new Date().getDate();
    chosenMode = day % 2 === 0 ? 'deal' : 'verifactu';
  }

  let postSpec;
  if (chosenMode === 'verifactu') {
    const tools = catalog.verifactu_tools;
    const toolA = pickByDay(tools);
    const idxA = tools.indexOf(toolA);
    const toolB = tools[(idxA + 1) % tools.length];
    postSpec = buildVerifactuPost(toolA, toolB);
  } else {
    const deal = pickByDay(catalog.lifetime_deals);
    postSpec = buildDealPost(deal);
  }

  let messageHtml = postSpec.fallbackHtml;
  let source = 'plantilla local (coste 0 €)';

  if (process.env.GEMINI_API_KEY) {
    try {
      const aiText = await generateWithGeminiIfConfigured(postSpec.contextPrompt);
      if (aiText) {
        messageHtml = aiText;
        source = 'Gemini API';
      }
    } catch (err) {
      console.warn(`[Aviso] Falló Gemini API (${err.message}); usando plantilla local.`);
    }
  }

  if (dryRun) {
    console.log(`=== MODO SIMULACIÓN (--dry-run) | Modo: ${chosenMode} | Generado con: ${source} ===\n`);
    console.log(messageHtml);
    console.log('\n=== FIN DEL MENSAJE ===');
    return;
  }

  const result = await sendTelegramMessage(messageHtml);
  console.log(`[OK] Mensaje publicado en Telegram (message_id: ${result.result?.message_id}).`);
}

main().catch((err) => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
