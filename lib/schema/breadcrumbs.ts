/**
 * Generate BreadcrumbList JSON-LD schema for SEO.
 *
 * Usage:
 *   <script type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: breadcrumbSchema([
 *       { name: 'LDM Calculator', path: '/ldm' }
 *     ]) }}
 *   />
 */

const BASE = 'https://www.freightutils.com';

export function breadcrumbSchema(
  items: { name: string; path: string }[],
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'FreightUtils',
        item: BASE,
      },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.name,
        item: `${BASE}${item.path}`,
      })),
    ],
  });
}
