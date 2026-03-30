import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import containersData from '@/lib/data/containers.json';
import CbmCalc from '../CbmCalc';

// ─────────────────────────────────────────────────────────────────
//  Static generation — 20 pages
// ─────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return containersData.map(c => ({ containerType: c.slug }));
}

// ─────────────────────────────────────────────────────────────────
//  Dynamic metadata
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ containerType: string }> }
): Promise<Metadata> {
  const { containerType } = await params;
  const c = containersData.find(x => x.slug === containerType);
  if (!c) return { title: 'Container Not Found | FreightUtils' };

  return {
    title: `${c.name} CBM Calculator — Volume & Dimensions | FreightUtils`,
    description: `Calculate CBM for ${c.name}. Internal dimensions: ${c.lengthCm}×${c.widthCm}×${c.heightCm} cm. Max capacity: ${c.capacityCbm} CBM. Free calculator at FreightUtils.`,
    alternates: { canonical: `https://www.freightutils.com/cbm/${c.slug}` },
  };
}

// ─────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  sea: 'Sea Freight Container',
  air: 'Air Freight ULD',
};

// ─────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────

export default async function ContainerPage(
  { params }: { params: Promise<{ containerType: string }> }
) {
  const { containerType } = await params;
  const c = containersData.find(x => x.slug === containerType);
  if (!c) notFound();

  const siblings = containersData.filter(x => x.category === c.category && x.slug !== c.slug);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${c.name} CBM Calculator`,
    description: `Calculate CBM for ${c.name}. Internal dimensions: ${c.lengthCm}×${c.widthCm}×${c.heightCm} cm. Max capacity: ${c.capacityCbm} m³.`,
    url: `https://www.freightutils.com/cbm/${c.slug}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
    publisher: { '@type': 'Organization', name: 'FreightUtils', url: 'https://www.freightutils.com' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'FreightUtils', item: 'https://www.freightutils.com' },
            { '@type': 'ListItem', position: 2, name: 'CBM Calculator', item: 'https://www.freightutils.com/cbm' },
            { '@type': 'ListItem', position: 3, name: c.name },
          ],
        }) }}
      />

      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 16, fontSize: 13, color: '#8f9ab0' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <Link href="/cbm" style={{ color: '#8f9ab0', textDecoration: 'none' }}>CBM Calculator</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: '#e87722' }}>{c.name}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            {/* Category badge */}
            <div style={{
              background: c.category === 'air' ? '#1e40af' : '#0f766e',
              color: '#fff', fontSize: 12, fontWeight: 700,
              padding: '6px 14px', borderRadius: 8, flexShrink: 0, letterSpacing: 0.5,
              alignSelf: 'flex-start', marginTop: 4,
            }}>
              {CATEGORY_LABEL[c.category]}
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                {c.name} CBM Calculator
              </h1>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ background: '#2e3d55', color: '#c8d0e0', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, fontFamily: 'monospace' }}>
                  {c.lengthCm} × {c.widthCm} × {c.heightCm} cm
                </span>
                <span style={{ background: '#e87722', color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  {c.capacityCbm} m³ max
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Dimension stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12, marginBottom: 28,
        }}>
          {[
            { label: 'Internal Length', value: `${c.lengthCm} cm`, sub: `${(c.lengthCm / 100).toFixed(2)} m` },
            { label: 'Internal Width',  value: `${c.widthCm} cm`,  sub: `${(c.widthCm  / 100).toFixed(2)} m` },
            { label: 'Internal Height', value: `${c.heightCm} cm`, sub: `${(c.heightCm / 100).toFixed(2)} m` },
            { label: 'Max Capacity',    value: `${c.capacityCbm} m³`, sub: `${(c.capacityCbm * 35.3147).toFixed(1)} ft³` },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#fff', border: '1px solid #d8dce6', borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8f9ab0', marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1a2332' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 2 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* About this container */}
        <div style={{
          background: '#fff', border: '1px solid #d8dce6', borderRadius: 10,
          padding: '18px 20px', marginBottom: 28, fontSize: 15, color: '#5a6478', lineHeight: 1.7,
        }}>
          {c.description}
        </div>

        {/* Calculator — pre-filled, dims locked, with fill bar */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.2px' }}>
          How Many of Your Items Fit?
        </h2>
        <p style={{ color: '#5a6478', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          The calculator below is pre-filled with the {c.name}&apos;s internal dimensions.
          Change <strong>Pieces</strong> to calculate total CBM and see what percentage of the container you&apos;d fill.
          To calculate a different box size, adjust the dimensions freely.
        </p>

        <CbmCalc
          defaultL={String(c.lengthCm)}
          defaultW={String(c.widthCm)}
          defaultH={String(c.heightCm)}
          lockedDims={false}
          capacityCbm={c.capacityCbm}
        />

        {/* Other containers of same type */}
        {siblings.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2332', marginBottom: 14, letterSpacing: '-0.2px' }}>
              Other {CATEGORY_LABEL[c.category]} Types
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {siblings.map(s => (
                <Link key={s.slug} href={`/cbm/${s.slug}`} style={{
                  background: '#fff', border: '1px solid #d8dce6', borderRadius: 8,
                  padding: '8px 14px', textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2332' }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: '#8f9ab0', fontFamily: 'monospace' }}>{s.capacityCbm} m³</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom links */}
        <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/cbm" style={{
            background: '#fff', border: '1px solid #d8dce6', borderRadius: 8,
            padding: '10px 18px', textDecoration: 'none', color: '#1a2332',
            fontSize: 13, fontWeight: 600,
          }}>
            ← All Container Types
          </Link>
          <Link href="/api-docs#cbm" style={{
            background: '#1a2332', borderRadius: 8, padding: '10px 18px',
            textDecoration: 'none', color: '#e87722', fontSize: 13, fontWeight: 600,
          }}>
            Use the API →
          </Link>
        </div>

      </main>
    </>
  );
}
