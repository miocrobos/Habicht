const baseUrl = 'https://www.habicht-volleyball.ch';

const pages = [
  '/',
  '/about',
  '/clubs',
  '/players',
  '/news',
  '/contact',
  '/faq',
  '/volleyball-schweiz',
  '/volleyball-training',
  '/volleyball-clubs-schweiz',
  '/privacy',
  '/terms',
];

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (path) => `
    <url>
      <loc>${baseUrl}${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${path === '/' ? 'weekly' : path === '/news' || path === '/clubs' || path === '/players' ? 'daily' : 'monthly'}</changefreq>
      <priority>${path === '/' ? '1.0' : path === '/clubs' || path === '/players' || path === '/news' ? '0.9' : path === '/about' ? '0.8' : path === '/contact' ? '0.7' : '0.6'}</priority>
    </url>`
    )
    .join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
