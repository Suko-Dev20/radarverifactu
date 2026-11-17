# Guía Paso a Paso — RadarVerifactu (Verifactu + Chollos Pago Único + Bot Telegram)

Esta guía resume todo lo que necesitas para activar tus enlaces de afiliado, publicar la web gratis y encender el bot automático de Telegram.

---

## 1. Estrategia práctica antes de hacerte autónomo
*(Nota: esto es información práctica operativa, no asesoramiento fiscal vinculante; consulta con un gestor cuando empieces a retirar ingresos regulares).*

1. **Construyes el activo a coste 0 €:** Publicas la web en Cloudflare Pages o Vercel gratis y lanzas el canal de Telegram sin pagar servidores.
2. **Acumulas saldo en las plataformas de afiliación:** En plataformas como **PartnerStack**, **Impact** (AppSumo) o programas SaaS directos, tus comisiones se quedan guardadas en el monedero interno de la plataforma.
3. **Configura un umbral de retirada alto o retira manualmente:** No configures transferencia automática cada mes; deja que el saldo crezca dentro de la plataforma y solicítalo cuando veas que el negocio genera ingresos recurrentes que compensan darte de alta.

---

## 2. Dónde registrarte gratis para conseguir tus enlaces de afiliado

* **AppSumo (Chollos de Pago Único - Opción C):** Se gestiona a través de **Impact.com** (busca el programa *AppSumo* dentro de Impact). Paga comisiones muy altas por compras de herramientas Lifetime.
* **Holded:** Programa de afiliados en **PartnerStack** o desde la sección *Partners / Afiliados* en `holded.com/es`.
* **Quipu / Billin / Contasimple / Declarando / Qonto:** Revisa el pie de página (*"Programa de Afiliados"* o *"Partners"*) de cada web oficial para obtener tu enlace con código `ref` o `via`.

---

## 3. Cómo poner tus enlaces reales en 1 minuto

1. Abre el archivo `config/affiliates.json`.
2. Sustituye cada enlace de ejemplo (`TU_ID_AFILIADO`, `TU_ID_IMPACT`) por tus enlaces reales y revisa `telegram_channel_url` / `domain`.
3. Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm run build
```

Ese comando regenera automáticamente `public/index.html`, las **15 páginas de comparativas (`public/vs/*.html`)**, las **6 páginas sectoriales (`public/sector/*.html`)** y el `sitemap.xml` con tus enlaces actualizados.

Para verlo en tu ordenador antes de publicarlo:

```bash
npm run serve
```

Luego abre `http://localhost:8080`.

---

## 4. Subir la web a internet gratis (Coste: 0 €)

### Opción rápida: Cloudflare Pages o Vercel
1. Sube esta carpeta a un repositorio privado o público de **GitHub**.
2. Entra en **Cloudflare Pages** (o **Vercel**) e inicia sesión con GitHub.
3. Selecciona tu repositorio y configura:
   * **Build command:** `npm run build`
   * **Build output directory:** `public`
4. En 30 segundos tendrás una URL pública rápida con certificado SSL gratis.
5. Entra en **Google Search Console** y envía tu `https://tu-web.pages.dev/sitemap.xml` para que Google indexe tus 22 páginas.

---

## 5. Encender el Bot de Telegram en piloto automático (Coste: 0 €)

1. Crea un canal público o privado en Telegram (por ejemplo, `@radarverifactu`).
2. Habla con `@BotFather` en Telegram, envía `/newbot` y guarda el **Token** que te da.
3. Añade tu bot como **Administrador** de tu canal con permiso para publicar mensajes.
4. En tu repositorio de GitHub, ve a **Settings → Secrets and variables → Actions** y crea estos secretos:
   * `TELEGRAM_BOT_TOKEN`: El token que te dio BotFather.
   * `TELEGRAM_CHAT_ID`: El `@nombre_de_tu_canal` (ej. `@radarverifactu`).
   * `GEMINI_API_KEY` *(Opcional)*: Si quieres que una IA redacte textos nuevos cada día en lugar de usar las plantillas incluidas (si no la pones, funciona igual gratis con las plantillas de alta conversión).

Listo: el archivo `.github/workflows/daily_radar.yml` se ejecutará cada mañana a las 08:00 UTC automáticamente, y también podrás lanzarlo manualmente desde la pestaña **Actions** de GitHub.
