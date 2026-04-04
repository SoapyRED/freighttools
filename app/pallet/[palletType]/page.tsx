import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import palletsData from '@/lib/data/pallets.json';
import PalletFittingCalc from '../PalletFittingCalc';

// ─────────────────────────────────────────────────────────────────
//  Static generation — 15 pages
// ─────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return palletsData.map(p => ({ palletType: p.slug }));
}

// ─────────────────────────────────────────────────────────────────
//  Dynamic metadata
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ palletType: string }> },
): Promise<Metadata> {
  const { palletType } = await params;
  const p = palletsData.find(x => x.slug === palletType);
  if (!p) return { title: 'Pallet Not Found | FreightUtils' };

  return {
    title: `${p.name} Fitting Calculator — How Many Boxes Fit? | FreightUtils`,
    description: `Calculate how many boxes fit on a ${p.name}. Dimensions: ${p.lengthCm}×${p.widthCm} cm, max height ${p.maxHeightCm} cm, max weight ${p.maxWeightKg} kg. Free tool with SVG layer diagram.`,
    alternates: { canonical: `https://www.freightutils.com/pallet/${p.slug}` },
  };
}

// ─────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────

export default async function PalletTypePage(
  { params }: { params: Promise<{ palletType: string }> },
) {
  const { palletType } = await params;
  const p = palletsData.find(x => x.slug === palletType);
  if (!p) notFound();

  const siblings = palletsData.filter(x => x.slug !== p.slug);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${p.name} Pallet Fitting Calculator`,
    description: `Calculate how many boxes fit on a ${p.name}. Dimensions: ${p.lengthCm}×${p.widthCm} cm, max height ${p.maxHeightCm} cm.`,
    url: `https://www.freightutils.com/pallet/${p.slug}`,
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
            { '@type': 'ListItem', position: 2, name: 'Pallet Fitting', item: 'https://www.freightutils.com/pallet' },
            { '@type': 'ListItem', position: 3, name: p.name },
          ],
        }) }}
      />

      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-faint)' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <Link href="/pallet" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Pallet Fitting Calculator</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: '#e87722' }}>{p.name}</span>
          </nav>

          <div>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.3px', marginBottom: 14 }}>
              {p.name} — Pallet Fitting Calculator
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ background: '#2e3d55', color: '#c8d0e0', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, fontFamily: 'monospace' }}>
                {p.lengthCm} × {p.widthCm} cm
              </span>
              <span style={{ background: '#2e3d55', color: '#c8d0e0', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                Max {p.maxHeightCm} cm
              </span>
              <span style={{ background: '#e87722', color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                {p.maxWeightKg.toLocaleString('en-GB')} kg max
              </span>
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
            { label: 'Length',       value: `${p.lengthCm} cm`,   sub: `${(p.lengthCm  / 100).toFixed(3)} m` },
            { label: 'Width',        value: `${p.widthCm} cm`,    sub: `${(p.widthCm   / 100).toFixed(3)} m` },
            { label: 'Board Height', value: `${p.heightCm} cm`,   sub: `pallet deck` },
            { label: 'Max Height',   value: `${p.maxHeightCm} cm`, sub: `floor to top of load` },
            { label: 'Max Weight',   value: `${p.maxWeightKg.toLocaleString('en-GB')} kg`, sub: `maximum payload` },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* About */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
          padding: '18px 20px', marginBottom: 28, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7,
        }}>
          <p style={{ margin: 0 }}>{p.description}</p>
          {p.notes && (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-faint)' }}>
              <strong>Standard:</strong> {p.notes}
            </p>
          )}
        </div>

        {/* Calculator */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.2px' }}>
          How Many Boxes Fit on a {p.name}?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          The calculator is pre-filled with the {p.name}&apos;s dimensions and weight rating.
          Enter your <strong>box dimensions</strong> below to see the fitting result and top-down layer diagram.
        </p>

        <PalletFittingCalc
          defaultPL={String(p.lengthCm)}
          defaultPW={String(p.widthCm)}
          defaultPMH={String(p.maxHeightCm)}
          defaultPH={String(p.heightCm)}
          defaultMaxW={String(p.maxWeightKg)}
          lockedDims={true}
        />

        {/* Other pallet types */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.2px' }}>
            Other Pallet Types
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {siblings.map(s => (
              <Link key={s.slug} href={`/pallet/${s.slug}`} style={{
                background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 14px', textDecoration: 'none',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>
                  {s.lengthCm} × {s.widthCm} cm · {s.maxWeightKg.toLocaleString('en-GB')} kg
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom links */}
        <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/pallet" style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
            padding: '10px 18px', textDecoration: 'none', color: 'var(--text)',
            fontSize: 13, fontWeight: 600,
          }}>
            ← All Pallet Types
          </Link>
          <Link href="/api-docs#pallet" style={{
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
