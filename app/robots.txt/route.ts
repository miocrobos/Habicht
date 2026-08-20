export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /settings/
Disallow: /dashboard

Sitemap: https://www.habicht-volleyball.ch/sitemap.xml
Host: https://www.habicht-volleyball.ch
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
