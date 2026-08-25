import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site';

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

const entries: Entry[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/players', changeFrequency: 'daily', priority: 0.9 },
  { path: '/players/men', changeFrequency: 'daily', priority: 0.9 },
  { path: '/players/women', changeFrequency: 'daily', priority: 0.9 },
  { path: '/clubs', changeFrequency: 'daily', priority: 0.9 },
  { path: '/news', changeFrequency: 'daily', priority: 0.8 },
  { path: '/courts', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/volleyball-schweiz', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/volleyball-training', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/volleyball-clubs-schweiz', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/recruiters', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/player-requests', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return entries.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified,
    changeFrequency,
    priority,
  }));
}
