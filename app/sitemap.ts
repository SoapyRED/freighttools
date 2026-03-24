import type { MetadataRoute } from 'next';
import { getAllUnNumbers } from '@/lib/calculations/adr';
import airlinesData from '@/lib/data/airlines.json';
import containersData from '@/lib/data/containers.json';
import palletsData from '@/lib/data/pallets.json';

const BASE = 'https://www.freightutils.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const unNumbers = getAllUnNumbers();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                  changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE}/ldm`,               changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/cbm`,               changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/adr`,               changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${BASE}/chargeable-weight`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/pallet`,            changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/airlines`,          changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/incoterms`,         changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/containers`,        changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/convert`,           changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/adr-calculator`,    changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/api-docs`,          changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`,             changeFrequency: 'monthly', priority: 0.5 },
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
    url: `${BASE}/containers/${c.slug}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  const palletRoutes: MetadataRoute.Sitemap = palletsData.map(p => ({
    url: `${BASE}/pallet/${p.slug}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...adrRoutes, ...airlineRoutes, ...containerRoutes, ...palletRoutes];
}
