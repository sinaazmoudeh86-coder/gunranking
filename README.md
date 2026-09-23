# GunRanking.com: deploy package

This folder is a complete static site. Upload it as-is to any static host.

## Contents
- `index.html`: the whole site (app, data, articles, fonts and styles bundled in)
- `assets/`: logo, duel icon, article thumbnails (the site loads these at runtime)
- `robots.txt`, `sitemap.xml`, `sitemap-news.xml`, `llms.txt`: search + AI discovery files
- `vercel.json` / `_redirects` + `netlify.toml`: send every clean URL (/edc, /guns/…, /news/…) to index.html

## Deploy (pick one)
**Vercel:** `npx vercel deploy --prod` from this folder, then add the gunranking.com domain.
**Netlify:** drag this folder onto app.netlify.com/drop, then add the domain.
**Cloudflare Pages / S3 + CloudFront:** upload the folder and set the SPA fallback to /index.html.

## Routing
On a real domain the site uses clean paths (/edc, /guns/sig-sauer-p365-xmacro, /news/…) with the History API. Opened as a file or in the design preview, it falls back to #/ routes automatically.

## Go-live checklist
1. Point gunranking.com DNS at the host; force HTTPS.
2. Submit sitemap.xml and sitemap-news.xml in Google Search Console and Bing Webmaster Tools.
3. Replace sample data: set `pipeline_connected: true` once the pipeline (see Data Pipeline Spec.md) writes real firearm records and GrabAGun URLs.
4. Add product images (GrabAGun CDN URLs in each record's image field).
5. For full SEO, add pre-rendering (e.g. Prerender.io, or rebuild on Next.js/Astro with the same data files) so crawlers get complete HTML without running JavaScript.
6. Connect a votes API and newsletter provider (the forms currently save locally only).
