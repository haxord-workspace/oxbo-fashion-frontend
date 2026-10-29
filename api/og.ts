// Vercel serverless function: serves real Open Graph / Twitter Card meta tags for a
// single product, for social-media link-preview crawlers only (see vercel.json — only
// requests whose User-Agent matches a known bot are rewritten here; everything else
// still gets the normal SPA). Those crawlers don't execute JS, so the client-side React
// app can never give them per-product metadata — this is the smallest way to give it to
// them without migrating off Vite/CSR.

const API_BASE =
  process.env.VITE_API_URL || 'https://oxboecombackendserver-lkf1.onrender.com/api/v1';
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '');
const SITE_NAME = 'Oxbo Fashion';
const DEFAULT_IMAGE = 'https://oxbo-fashion-frontend.vercel.app/images/Oxbo1.png';

const escapeHtml = (value: string) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;

const toAbsoluteUrl = (url: string | undefined | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Mirrors the same response-shape normalization ProductDetail.tsx uses, since the
// backend wraps the product payload differently depending on the endpoint/version.
const normalizeProduct = (payload: any, id: string) => {
  let product = payload?.data?.product || payload?.data || payload;
  if (product?.products && Array.isArray(product.products)) {
    product = product.products.find((p: any) => p._id === id || p.id === id) || product.products[0];
  } else if (Array.isArray(product)) {
    product = product.find((p: any) => p._id === id || p.id === id) || product[0];
  }
  return product;
};

export default async function handler(req: any, res: any) {
  const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const canonicalUrl = `${proto}://${host}/products/${id || ''}`;

  let title = SITE_NAME;
  let description = 'Shop the latest fashion at Oxbo.';
  let image = DEFAULT_IMAGE;
  let price: number | null = null;

  try {
    if (id) {
      const apiRes = await fetch(`${API_BASE}/products/${id}`);
      if (apiRes.ok) {
        const payload = await apiRes.json();
        const product = normalizeProduct(payload, id);
        if (product) {
          title = product.name ? `${product.name} | ${SITE_NAME}` : title;
          if (product.description) {
            description = truncate(String(product.description).replace(/\s+/g, ' ').trim(), 200);
          }
          const rawImage = product.thumbnail || (product.gallery && product.gallery[0]) || product.imageUrl;
          image = toAbsoluteUrl(rawImage) || DEFAULT_IMAGE;
          const numericPrice = Number(product.price);
          price = Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : null;
        }
      }
    }
  } catch (error) {
    console.error('[og] Failed to fetch product for preview metadata:', error);
    // fall through and serve the generic site metadata defined above
  }

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(canonicalUrl);

  const priceTags = price
    ? `
    <meta property="product:price:amount" content="${price}" />
    <meta property="product:price:currency" content="INR" />`
    : '';

  const html = `<!doctype html>
<html lang="en" xmlns:og="http://ogp.me/ns#" xmlns:product="http://ogp.me/ns/product#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <link rel="canonical" href="${safeUrl}" />

  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:url" content="${safeUrl}" />${priceTags}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
</head>
<body>
  <a href="${safeUrl}">${safeTitle}</a>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
