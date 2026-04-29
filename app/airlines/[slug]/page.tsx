import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lookupBySlug, getAllCargoSlugs, type Airline } from '@/lib/calculations/airlines';
import { buildAirlineMetadata } from '@/lib/seo/page-metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCargoSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const airline = lookupBySlug(slug);
  if (!airline) return { title: 'Airline Not Found' };

  return buildAirlineMetadata({
    slug,
    airlineName: airline.airline_name,
    iataCode: airline.iata_code,
    icaoCode: airline.icao_code,
    awbPrefix: airline.awb_prefix,
    country: airline.country,
  });
}

// ─────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '16px 18px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{
        fontSize: 22,
        fontWeight: 700,
        color: highlight ? '#EF9F27' : 'var(--text)',
        lineHeight: 1.2,
        fontFamily: 'monospace',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────

export default async function AirlineDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const airline = lookupBySlug(slug);
  if (!airline) notFound();

  const exampleAwb = airline.awb_prefix
    ? `${airline.awb_prefix[0]}-12345678`
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Airline',
    name: airline.airline_name,
    iataCode: airline.iata_code,
    icaoCode: airline.icao_code,
    url: `https://www.freightutils.com/airlines/${slug}`,
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
            { '@type': 'ListItem', position: 2, name: 'Airlines', item: 'https://www.freightutils.com/airlines' },
            { '@type': 'ListItem', position: 3, name: airline.airline_name },
          ],
        }) }}
      />

      {/* Hero */}
      <div style={{ background: 'var(--bg-hero)', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-faint)' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <Link href="/airlines" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Airlines</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: '#e87722' }}>{airline.airline_name}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(20px, 4vw, 32px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                letterSpacing: '-0.3px',
                marginBottom: 10,
              }}>
                {airline.airline_name}
              </h1>

              {airline.country && (
                <div style={{ fontSize: 14, color: '#c8d0e0', marginBottom: 12 }}>
                  {airline.country}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {airline.iata_code && (
                  <span style={{
                    background: '#2e3d55',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontFamily: 'monospace',
                  }}>
                    IATA {airline.iata_code}
                  </span>
                )}
                {airline.icao_code && (
                  <span style={{
                    background: '#2e3d55',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontFamily: 'monospace',
                  }}>
                    ICAO {airline.icao_code}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Key stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}>
          <StatCard
            label="IATA Code"
            value={airline.iata_code ?? '—'}
            sub="2-letter airline designator"
          />
          <StatCard
            label="ICAO Code"
            value={airline.icao_code ?? '—'}
            sub="3-letter airline designator"
          />
          {airline.awb_prefix && airline.awb_prefix.map(prefix => (
            <StatCard
              key={prefix}
              label="AWB Prefix"
              value={prefix}
              sub="Air Waybill number prefix"
              highlight
            />
          ))}
          {airline.callsign && (
            <StatCard
              label="Callsign"
              value={airline.callsign}
              sub="Radio telephony callsign"
            />
          )}
          {airline.country && (
            <StatCard
              label="Country"
              value={airline.country}
            />
          )}
        </div>

        {/* AWB Prefix section */}
        {airline.has_cargo && airline.awb_prefix && (
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
            marginBottom: 28,
          }}>
            <div style={{
              background: 'var(--bg)',
              borderBottom: '1px solid #eef0f4',
              padding: '11px 18px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
            }}>
              Air Waybill Prefix
            </div>
            <div style={{ padding: '20px 18px' }}>
              <div style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}>
                {airline.awb_prefix.map(prefix => (
                  <span key={prefix} style={{
                    fontSize: 32,
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: '#EF9F27',
                    letterSpacing: 2,
                  }}>
                    {prefix}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                Air Waybill numbers issued by {airline.airline_name} begin with{' '}
                <strong style={{ fontFamily: 'monospace' }}>{airline.awb_prefix[0]}</strong>.
                {exampleAwb && (
                  <> For example, a typical AWB number would be{' '}
                    <strong style={{ fontFamily: 'monospace' }}>{exampleAwb}</strong>.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Related links */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 28,
        }}>
          <div style={{
            background: 'var(--bg)',
            borderBottom: '1px solid #eef0f4',
            padding: '11px 18px',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
          }}>
            Related
          </div>
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {airline.country && (
              <Link
                href={`/airlines?q=${encodeURIComponent(airline.country)}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '8px 0',
                  borderBottom: '1px solid #eef0f4',
                }}
              >
                <span style={{ color: '#e87722' }}>›</span>
                Other {airline.country} airlines
              </Link>
            )}
            <Link
              href="/chargeable-weight"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 0',
                borderBottom: '1px solid #eef0f4',
              }}
            >
              <span style={{ color: '#e87722' }}>›</span>
              Calculate chargeable weight
            </Link>
            <Link
              href="/airlines"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 0',
              }}
            >
              <span style={{ color: '#e87722' }}>›</span>
              All airline codes
            </Link>
          </div>
        </div>

        {/* Bottom navigation */}
        <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/airlines" style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 18px',
            textDecoration: 'none',
            color: 'var(--text)',
            fontSize: 13,
            fontWeight: 600,
          }}>
            ← All Airlines
          </Link>
          <Link href="/chargeable-weight" style={{
            background: 'var(--accent)',
            borderRadius: 8,
            padding: '10px 18px',
            textDecoration: 'none',
            color: 'var(--text-on-orange)',
            fontSize: 13,
            fontWeight: 600,
          }}>
            Chargeable Weight Calculator →
          </Link>
        </div>

      </main>
    </>
  );
}
