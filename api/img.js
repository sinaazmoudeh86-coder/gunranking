// Serves /img/<SKU>.webp?w=320|640|1080 from gunranking.com. First request copies the photo from its GrabAGun "nip" export
// link (tokens stay server-side), trims the white margin, resizes and converts to WebP; Vercel's CDN then keeps that copy for a year.
const sharp = require('sharp');
const T = require('./_img-tokens.json');
const SIZES = [320, 640, 1080];
async function pull(url) {
  let last;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (GunRanking photo copy)', Accept: 'image/*' }, signal: AbortSignal.timeout(9000) });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !/^image\//.test(type)) throw new Error('upstream ' + r.status + ' ' + type);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) { last = e; await new Promise(s => setTimeout(s, 600 * (i + 1))); }
  }
  throw last;
}
module.exports = async (req, res) => {
  const k = String(req.query.sku || '').replace(/[^A-Za-z0-9_-]/g, '_'), t = T[k];
  if (!t) { res.statusCode = 404; res.setHeader('Cache-Control', 'public, max-age=86400'); return res.end('not found'); }
  const w = SIZES.find(s => s >= (+req.query.w || 640)) || 1080;
  const [token, sku] = t.split('|');
  try {
    const src = await pull('https://nip.grabagun.org/GAG_NIP/GAGv2/ProductsFilterExport/getImage.php?token=' + token + '&sku=' + sku);
    let out;
    try {
      out = await sharp(src).flatten({ background: '#ffffff' }).trim({ threshold: 12 })
        .resize({ width: w, height: Math.round(w * 0.75), fit: 'inside', withoutEnlargement: true })
        .extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#ffffff' }).webp({ quality: 74 }).toBuffer();
    } catch (e) { out = await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer(); }
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    res.end(out);
  } catch (e) { res.statusCode = 502; res.setHeader('Cache-Control', 'no-store'); res.end('photo unavailable'); }
};
