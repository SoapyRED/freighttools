import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CONVERSION_PAIRS, lookupConversionPair, getAllConversionSlugs, UNITS, generateConversionTable } from '@/lib/calculations/converter';
import AdUnit from '@/app/components/AdUnit';
import ConvertTool from '../ConvertTool';

// ─────────────────────────────────────────────────────────────────
//  Static generation — one page per conversion pair
// ─────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllConversionSlugs().map(slug => ({ conversionType: slug }));
}

// ─────────────────────────────────────────────────────────────────
//  Dynamic metadata per pair
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ conversionType: string }> }
): Promise<Metadata> {
  const { conversionType } = await params;
  const pair = lookupConversionPair(conversionType);
  if (!pair) return { title: 'Conversion Not Found | FreightUtils' };

  const ogUrl = `/api/og?title=${encodeURIComponent(pair.title + ' Converter')}&desc=${encodeURIComponent(pair.description)}&badge=Converter`;

  return {
    title: `${pair.title} Converter | FreightUtils`,
    description: pair.description,
    alternates: {
      canonical: `https://www.freightutils.com/convert/${pair.slug}`,
    },
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${pair.title} Converter — FreightUtils` }],
    },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
  };
}

// ─────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────

export default async function ConversionTypePage(
  { params }: { params: Promise<{ conversionType: string }> }
) {
  const { conversionType } = await params;
  const pair = lookupConversionPair(conversionType);
  if (!pair) notFound();

  const fromUnit = UNITS[pair.from];
  const toUnit = UNITS[pair.to];
  const table = generateConversionTable(pair.from, pair.to);

  // Build formula string
  const factor = table[0].output; // factor for 1 unit
  const formulaText = `1 ${fromUnit.name} = ${factor} ${toUnit.name}`;

  return (
    <>
      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 20, fontSize: 13, color: '#8f9ab0' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href="/convert" style={{ color: '#8f9ab0', textDecoration: 'none' }}>Converter</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <span style={{ color: '#e87722' }}>{pair.title}</span>
          </nav>

          <h1 style={{
            fontSize: 'clamp(22px, 5vw, 32px)',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
          }}>
            {pair.title} <span style={{ color: '#e87722' }}>Converter</span>
          </h1>
          <p style={{ fontSize: 15, color: '#8f9ab0', marginTop: 8, maxWidth: 560 }}>
            {pair.description}
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Interactive converter, pre-filled */}
        <ConvertTool defaultFrom={pair.from} defaultTo={pair.to} />

        {/* Conversion table */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, marginTop: 40, letterSpacing: '-0.3px' }}>
          {fromUnit.name} to {toUnit.name} Table
        </h2>
        <div className="ref-table-wrap" style={{ marginBottom: 32 }}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>{fromUnit.name} ({fromUnit.symbol})</th>
                <th>{toUnit.name} ({toUnit.symbol})</th>
              </tr>
            </thead>
            <tbody>
              {table.map(row => (
                <tr key={row.input}>
                  <td>{row.input.toLocaleString('en-GB')}</td>
                  <td>{row.output.toLocaleString('en-GB', { maximumFractionDigits: 6 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formula explanation */}
        <div style={{
          background: '#f7f8fa',
          border: '1px solid #eef0f4',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 32,
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            color: '#8f9ab0',
            marginBottom: 6,
          }}>
            Formula
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1a2332', fontFamily: 'monospace' }}>
            {formulaText}
          </div>
          <p style={{ fontSize: 14, color: '#5a6478', lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>
            Multiply the value in {fromUnit.name.toLowerCase()} by {factor} to get the equivalent in {toUnit.name.toLowerCase()}.
          </p>
        </div>

        {/* Back link */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/convert" style={{
            color: '#e87722',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}>
            &larr; Back to all conversions
          </Link>
        </div>

        {/* Ad unit */}
        <AdUnit format="auto" />

      </main>
    </>
  );
}
