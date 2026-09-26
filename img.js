// Serves /img/<SKU>.webp?w=320|640|1080 from gunranking.com.
// Permanent copies: the first time a SKU is requested, the photo is copied from its GrabAGun "nip" export link, trimmed,
// converted to a 1080px WebP master and saved in Vercel Blob (img/<SKU>.webp). Every later request, including after a
// redeploy (which clears Vercel's CDN cache), is served from that stored copy; GrabAGun is only ever contacted once per photo.
// Without a connected Blob store (no BLOB_READ_WRITE_TOKEN) it still works, copying from GrabAGun on each CDN cache miss.
// Each entry in _img-tokens.json lists the model's lead photo first, then up to 3 sibling configurations as fallbacks.
// Response header x-photo-source: blob | grabagun. Add ?debug=1 for a JSON trace.
const sharp = require('sharp');
let blob = null; try { if (process.env.BLOB_READ_WRITE_TOKEN) blob = require('@vercel/blob'); } catch (e) {}
const T = require('./_img-tokens.json');
const SIZES = [320, 640, 1080], BUDGET = 24000;
const src = t => { const [token, sku] = t.split('|'); return 'https://nip.grabagun.org/GAG_NIP/GAGv2/ProductsFilterExport/getImage.php?token=' + token + '&sku=' + sku; };
async function get(url, ms) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (GunRanking photo copy)', Accept: 'image/*' }, signal: AbortSignal.timeout(ms) });
  const type = r.headers.get('content-type') || '', buf = Buffer.from(await r.arrayBuffer());
  if (!r.ok || !/^image\//.test(type) || buf.length < 1500) throw new Error(r.status + ' ' + type + ' ' + buf.length + 'b');
  return buf;
}
async function master(buf) {
  try {
    return await sharp(buf).flatten({ background: '#ffffff' }).trim({ threshold: 12 })
      .resize({ width: 1080, height: 810, fit: 'inside', withoutEnlargement: true })
      .extend({ top: 10, bottom: 10, left: 10, right: 10, background: '#ffffff' }).webp({ quality: 80 }).toBuffer();
  } catch (e) { return sharp(buf).resize({ width: 1080, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(); }
}
const size = (m, w) => w >= 1080 ? m : sharp(m).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer();
async function stored(k) {
  if (!blob) return null;
  try { const h = await blob.head('img/' + k + '.webp'); const r = await fetch(h.url, { signal: AbortSignal.timeout(6000) }); if (r.ok) return Buffer.from(await r.arrayBuffer()); } catch (e) {}
  return null;
}
async function save(k, m) {
  if (!blob) return;
  try { await blob.put('img/' + k + '.webp', m, { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'image/webp', cacheControlMaxAge: 31536000 }); } catch (e) { console.error('blob put', k, e.message); }
}
module.exports = async (req, res) => {
  const k = String(req.query.sku || '').replace(/[^A-Za-z0-9_-]/g, '_'), list = [].concat(T[k] || []), debug = req.query.debug === '1';
  if (!list.length) { res.statusCode = 404; res.setHeader('Cache-Control', 'public, max-age=3600'); return res.end('not found'); }
  const w = SIZES.find(s => s >= (+req.query.w || 640)) || 1080, t0 = Date.now(), log = [];
  const send = async (m, from, used) => {
    const out = await size(m, w);
    if (debug) { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ ok: true, from, used, blob: !!blob, tried: log, ms: Date.now() - t0 })); }
    res.setHeader('Content-Type', 'image/webp'); res.setHeader('x-photo-source', from);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    return res.end(out);
  };
  const have = await stored(k); if (have) return send(have, 'blob', k);
  // Two passes over the candidates (lead first), inside a fixed time budget so the function never hits its timeout.
  for (let pass = 0; pass < 2; pass++) for (const t of list) {
    const left = BUDGET - (Date.now() - t0); if (left < 2500) break;
    try { const m = await master(await get(src(t), Math.min(9000, left - 1500))); await save(k, m); return send(m, 'grabagun', t.split('|')[1]); }
    catch (e) { log.push(t.split('|')[1] + ': ' + e.message); }
  }
  res.statusCode = 502; res.setHeader('Cache-Control', 'no-store');
  if (debug) { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ ok: false, blob: !!blob, tried: log, ms: Date.now() - t0 })); }
  res.end('photo unavailable');
};
