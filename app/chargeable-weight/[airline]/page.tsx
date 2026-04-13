import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import airlinesData from '@/lib/data/airlines.json';
import ChargeableWeightCalc from '../ChargeableWeightCalc';

// ─────────────────────────────────────────────────────────────────
//  Static generation — one page per airline slug
// ─────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return airlinesData.map(a => ({ airline: a.slug }));
}

// ─────────────────────────────────────────────────────────────────
//  Dynamic metadata
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ airline: string }> }
): Promise<Metadata> {
  const { airline } = await params;
  const data = airlinesData.find(a => a.slug === airline);
  if (!data) return { title: 'Airline Not Found' };

  return {
    title: `${data.name} Chargeable Weight Calculator`,
    description: `Calculate air freight chargeable weight for ${data.name} (${data.iata}). Volumetric factor: ${data.factor.toLocaleString()}. Free calculator at FreightUtils.`,
    alternates: {
      canonical: `https://www.freightutils.com/chargeable-weight/${data.slug}`,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────

export default async function AirlinePage(
  { params }: { params: Promise<{ airline: string }> }
) {
  const { airline } = await params;
  const data = airlinesData.find(a => a.slug === airline);
  if (!data) notFound();

  const isNonStandard = data.factor !== 6000;

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${data.name} Chargeable Weight Calculator`,
    description: `Calculate air freight chargeable weight for ${data.name} (${data.iata}). Uses volumetric factor ${data.factor}.`,
    url: `https://www.freightutils.com/chargeable-weight/${data.slug}`,
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
            { '@type': 'ListItem', position: 2, name: 'Chargeable Weight', item: 'https://www.freightutils.com/chargeable-weight' },
            { '@type': 'ListItem', position: 3, name: data.name },
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
            <Link href="/chargeable-weight" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Chargeable Weight</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: '#e87722' }}>{data.name}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              background: '#e87722', color: '#fff', fontFamily: 'monospace',
              fontSize: 15, fontWeight: 800, padding: '6px 14px', borderRadius: 8,
              flexShrink: 0, letterSpacing: 1,
            }}>
              {data.iata}
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                {data.name} — Chargeable Weight Calculator
              </h1>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span style={{
                  background: data.express ? '#ffedd5' : '#dcfce7',
                  color: data.express ? '#9a3412' : '#166534',
                  border: `1px solid ${data.express ? '#fdba74' : '#86efac'}`,
                  fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                }}>
                  Volumetric factor: {data.factor.toLocaleString()}
                </span>
                {data.express && (
                  <span style={{
                    background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d',
                    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  }}>
                    Express carrier
                  </span>
                )}
                {!isNonStandard && (
                  <span style={{
                    background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe',
                    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  }}>
                    IATA standard
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Non-standard factor callout */}
        {isNonStandard && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
            padding: '14px 18px', marginBottom: 24, fontSize: 14, color: '#92400e', lineHeight: 1.6,
          }}>
            <strong>{data.name} uses a volumetric factor of {data.factor.toLocaleString()}</strong> — lower than the IATA standard
            of 6,000. This means volumetric weight is proportionally <em>higher</em> relative to size, making it more
            likely your chargeable weight will be based on volume rather than actual weight.
            Always confirm the factor with {data.name} for your specific shipment, as rates can vary by lane and product type.
          </div>
        )}

        {/* Calculator pre-set to this airline's factor */}
        <ChargeableWeightCalc defaultFactor={data.factor} />

        {/* Content */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.3px' }}>
            How {data.name} Calculates Chargeable Weight
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            {data.name} ({data.iata}) uses a volumetric factor of <strong>{data.factor.toLocaleString()}</strong> to calculate
            dimensional weight. The formula is:
          </p>
          <div style={{ background: '#1a2332', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
            <code style={{ fontFamily: "'Courier New', monospace", fontSize: 14, color: '#f59e0b', lineHeight: 1.8, display: 'block' }}>
              Volumetric Weight (kg) = (L × W × H in cm) ÷ {data.factor.toLocaleString()}<br/>
              Chargeable Weight = MAX(Actual Gross Weight, Volumetric Weight)
            </code>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            {data.express
              ? `As an express carrier, ${data.name} applies a factor of ${data.factor.toLocaleString()} — which is lower than the IATA standard of 6,000. This means the volumetric weight will be higher relative to the same shipment dimensions, making it more common for volumetric weight to be the chargeable basis.`
              : `${data.name} follows the IATA standard volumetric factor of 6,000, meaning 1 cubic metre (1,000,000 cm³) of cargo is treated as 166.67 kg of chargeable weight. If your shipment weighs less than this, you will be charged on volume.`
            }
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>
            Always verify the exact rate basis with {data.name} or your freight forwarder before booking,
            as surcharges, fuel levies, and lane-specific tariffs may apply on top of the base chargeable weight rate.
          </p>
        </div>

        {/* Back link + API callout */}
        <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/chargeable-weight" style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
            padding: '10px 18px', textDecoration: 'none', color: 'var(--text)',
            fontSize: 13, fontWeight: 600,
          }}>
            ← All Airlines
          </Link>
          <Link href="/api-docs#chargeable-weight" style={{
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
