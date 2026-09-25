// Serves /img/<SKU>.webp from gunranking.com. On first request it copies the photo from GrabAGun's export link
// (tokens stay here, server-side), then Vercel's CDN keeps the copy for a year, so GrabAGun is only hit once per photo.
const T = require('./_img-tokens.json');
module.exports = async (req, res) => {
  const k = String(req.query.sku || '').replace(/[^A-Za-z0-9_-]/g, '_'), t = T[k];
  if (!t) { res.statusCode = 404; return res.end('not found'); }
  const [token, sku] = t.split('|');
  try {
    const r = await fetch('https://nip.grabagun.org/GAG_NIP/GAGv2/ProductsFilterExport/getImage.php?token=' + token + '&sku=' + sku, { headers: { 'User-Agent': 'GunRanking image copy' } });
    const type = r.headers.get('content-type') || '';
    if (!r.ok || !/^image\//.test(type)) throw new Error('upstream ' + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.end(buf);
  } catch (e) { res.statusCode = 502; res.setHeader('Cache-Control', 'no-store'); res.end('photo unavailable'); }
};
