import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/', '/settings/', '/dashboard'],
    },
    sitemap: 'https://www.habicht-volleyball.ch/sitemap.xml',
    host: 'https://www.habicht-volleyball.ch',
  };
}
