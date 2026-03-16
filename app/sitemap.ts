import type { MetadataRoute } from 'next';
import { getAllUnNumbers } from '@/lib/calculations/adr';
import airlinesData from '@/lib/data/airlines.json';
import containersData from '@/lib/data/containers.json';

const BASE = 'https://freightutils.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const unNumbers = getAllUnNumbers();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                  changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE}/cbm`,               changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/adr`,               changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${BASE}/chargeable-weight`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/api-docs`,          changeFrequency: 'monthly', priority: 0.7 },
  ];

  const adrRoutes: MetadataRoute.Sitemap = unNumbers.map(un => ({
    url: `${BASE}/adr/un/${un}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  const airlineRoutes: MetadataRoute.Sitemap = airlinesData.map(a => ({
    url: `${BASE}/chargeable-weight/${a.slug}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  const containerRoutes: MetadataRoute.Sitemap = containersData.map(c => ({
    url: `${BASE}/cbm/${c.slug}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...adrRoutes, ...airlineRoutes, ...containerRoutes];
}
