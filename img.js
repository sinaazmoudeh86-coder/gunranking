// Serves /img/<SKU>.webp?w=320|640|1080 from gunranking.com. First request copies the photo from its GrabAGun "nip" export
// link (tokens stay server-side), trims the white margin, resizes and converts to WebP; Vercel's CDN then keeps that copy for a year.
// Each entry in _img-tokens.json lists the model's lead photo first, then up to 3 sibling configurations: if GrabAGun has no
// usable image for the first, the next one is used, so one dead listing photo never leaves a model blank.
// Add ?debug=1 to see what GrabAGun returned for each candidate.
const sharp = require('sharp');
const T = require('./_img-tokens.json');
const SIZES = [320, 640, 1080], BUDGET = 24000;
const src = t => { const [token, sku] = t.split('|'); return 'https://nip.grabagun.org/GAG_NIP/GAGv2/ProductsFilterExport/getImage.php?token=' + token + '&sku=' + sku; };
async function get(url, ms) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (GunRanking photo copy)', Accept: 'image/*' }, signal: AbortSignal.timeout(ms) });
  const type = r.headers.get('content-type') || '', buf = Buffer.from(await r.arrayBuffer());
  if (!r.ok || !/^image\//.test(type) || buf.length < 1500) throw new Error(r.status + ' ' + type + ' ' + buf.length + 'b');
  return buf;
}
async function render(buf, w) {
  try {
    return await sharp(buf).flatten({ background: '#ffffff' }).trim({ threshold: 12 })
      .resize({ width: w, height: Math.round(w * 0.75), fit: 'inside', withoutEnlargement: true })
      .extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#ffffff' }).webp({ quality: 74 }).toBuffer();
  } catch (e) { return sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer(); }
}
module.exports = async (req, res) => {
  const k = String(req.query.sku || '').replace(/[^A-Za-z0-9_-]/g, '_'), list = [].concat(T[k] || []), debug = req.query.debug === '1';
  if (!list.length) { res.statusCode = 404; res.setHeader('Cache-Control', 'public, max-age=3600'); return res.end('not found'); }
  const w = SIZES.find(s => s >= (+req.query.w || 640)) || 1080, t0 = Date.now(), log = [];
  // Two passes over the candidates (lead first), inside a fixed time budget so the function never hits its timeout.
  for (let pass = 0; pass < 2; pass++) for (const t of list) {
    const left = BUDGET - (Date.now() - t0); if (left < 2500) break;
    try {
      const out = await render(await get(src(t), Math.min(9000, left - 1500)), w);
      if (debug) { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ ok: true, used: t.split('|')[1], tried: log, ms: Date.now() - t0 })); }
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
      return res.end(out);
    } catch (e) { log.push(t.split('|')[1] + ': ' + e.message); }
  }
  res.statusCode = 502; res.setHeader('Cache-Control', 'no-store');
  if (debug) { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ ok: false, tried: log, ms: Date.now() - t0 })); }
  res.end('photo unavailable');
};
