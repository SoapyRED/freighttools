import type { MetadataRoute } from 'next';
import { getAllUnNumbers } from '@/lib/calculations/adr';
import { getAllSectionNumerals, getAllChapterCodes, getAllHeadingCodes, getAllSubheadingCodes } from '@/lib/calculations/hs';
import airlinesData from '@/lib/data/airlines.json';
import containersData from '@/lib/data/containers.json';
import palletsData from '@/lib/data/pallets.json';

const BASE = 'https://www.freightutils.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const unNumbers = getAllUnNumbers();

  const staticRoutes: MetadataRoute.Sitemap = [
    // Core pages
    { url: `${BASE}/`,                        changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE}/api-docs`,                changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`,                   changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/pricing`,                 changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/changelog`,               changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${BASE}/privacy`,                 changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,                   changeFrequency: 'yearly',  priority: 0.3 },
    // Freight calculators
    { url: `${BASE}/ldm`,                     changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/cbm`,                     changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/chargeable-weight`,       changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/pallet`,                  changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/containers`,              changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/convert`,                 changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/consignment-calculator`,  changeFrequency: 'monthly', priority: 0.8 },
    // Dangerous goods
    { url: `${BASE}/adr`,                     changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${BASE}/adr-calculator`,          changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${BASE}/adr/changes-2025`,        changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${BASE}/adr/tunnel-codes`,        changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${BASE}/adr/limited-quantities`,  changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${BASE}/adr/training-guide`,      changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${BASE}/adr/lq-eq-checker`,      changeFrequency: 'monthly', priority: 0.8 },
    // Customs & trade
    { url: `${BASE}/hs`,                      changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/incoterms`,               changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/duty`,                    changeFrequency: 'monthly', priority: 0.8 },
    // Reference data
    { url: `${BASE}/airlines`,                changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/unlocode`,                changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/uld`,                     changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/vehicles`,                changeFrequency: 'monthly', priority: 0.8 },
    // Airports
    { url: `${BASE}/airports/lhr/sheds`,      changeFrequency: 'weekly',  priority: 0.8 },
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

  // Only sea freight containers — air/ULD items moved to /uld/ with different slugs
  const containerRoutes: MetadataRoute.Sitemap = containersData
    .filter(c => c.category === 'sea')
    .map(c => ({
      url: `${BASE}/containers/${c.slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }));

  const palletRoutes: MetadataRoute.Sitemap = palletsData.map(p => ({
    url: `${BASE}/pallet/${p.slug}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  // HS Code routes (~6,960)
  const hsSectionRoutes: MetadataRoute.Sitemap = getAllSectionNumerals().map(n => ({
    url: `${BASE}/hs/section/${n}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  const hsChapterRoutes: MetadataRoute.Sitemap = getAllChapterCodes().map(c => ({
    url: `${BASE}/hs/chapter/${c}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  const hsHeadingRoutes: MetadataRoute.Sitemap = getAllHeadingCodes().map(h => ({
    url: `${BASE}/hs/heading/${h}`,
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  const hsSubheadingRoutes: MetadataRoute.Sitemap = getAllSubheadingCodes().map(s => ({
    url: `${BASE}/hs/code/${s}`,
    changeFrequency: 'yearly' as const,
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...adrRoutes,
    ...airlineRoutes,
    ...containerRoutes,
    ...palletRoutes,
    ...hsSectionRoutes,
    ...hsChapterRoutes,
    ...hsHeadingRoutes,
    ...hsSubheadingRoutes,
  ];
}
