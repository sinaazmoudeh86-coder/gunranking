#!/usr/bin/env node
// GunRanking photo sync: downloads GrabAGun product photos ONCE, resizes them, and self-hosts them under deploy/img/.
// The tokenized GrabAGun image URLs are only used here, server-side; they are never published to the site.
//
//   npm i sharp csv-parse
//   node importer/sync-images.mjs uploads/asdfsadff.csv uploads/asdf2.csv uploads/asdffsf.csv
//
// Output: deploy/img/<SKU>.webp (800px max, WebP q72, ~30-80 KB each) + deploy/img/manifest.js (which SKUs exist).
// Re-run after each new export; existing files are skipped unless --force.
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import sharp from 'sharp';

const OUT = path.resolve('deploy/img');
const args = process.argv.slice(2);
const force = args.includes('--force');
const files = args.filter(a => !a.startsWith('--'));
if (!files.length) { console.error('usage: node importer/sync-images.mjs <export.csv> [...] [--force]'); process.exit(1); }
await fs.mkdir(OUT, { recursive: true });

const key = sku => String(sku).replace(/[^A-Za-z0-9_-]/g, '_');
const jobs = new Map();
for (const f of files) {
  const rows = parse(await fs.readFile(f, 'utf8'), { columns: true, skip_empty_lines: true, relax_column_count: true, relax_quotes: true });
  for (const r of rows) if (r.sku && /^https?:/.test(r.image_url || '')) jobs.set(key(r.sku), r.image_url);
}
console.log(`${jobs.size} SKUs with photos`);

const have = {};
for (const f of await fs.readdir(OUT)) if (f.endsWith('.webp')) have[f.slice(0, -5)] = 1;
let done = 0, fail = 0, skip = 0;
const queue = [...jobs.entries()];
async function worker() {
  while (queue.length) {
    const [k, url] = queue.shift();
    const dest = path.join(OUT, k + '.webp');
    if (have[k] && !force) { skip++; continue; }
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'GunRanking image sync' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      // Trim the white studio margin so the product fills its frame, then fit to 800px.
      const img = await sharp(buf).flatten({ background: '#ffffff' }).trim({ threshold: 12 })
        .resize({ width: 800, height: 600, fit: 'inside', withoutEnlargement: true })
        .extend({ top: 12, bottom: 12, left: 12, right: 12, background: '#ffffff' })
        .webp({ quality: 72 }).toBuffer();
      await fs.writeFile(dest, img); have[k] = 1; done++;
    } catch (e) { fail++; if (fail < 20) console.warn('fail', k, e.message); }
    if ((done + fail) % 250 === 0) console.log(`${done} saved, ${skip} skipped, ${fail} failed`);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
await fs.writeFile(path.join(OUT, 'manifest.js'), '// Written by importer/sync-images.mjs. SKUs with a self-hosted photo in /img.\nwindow.GR_IMG_HAVE = ' + JSON.stringify(have) + ';\n');
console.log(`done: ${done} saved, ${skip} already present, ${fail} failed, ${Object.keys(have).length} in manifest`);
