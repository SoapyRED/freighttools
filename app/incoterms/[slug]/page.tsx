import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSlugs, lookupBySlug, getAllIncoterms, type Incoterm } from '@/lib/calculations/incoterms';
import AdUnit from '@/app/components/AdUnit';

// ─────────────────────────────────────────────────────────────────
//  Static generation — one page per INCOTERM
// ─────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

// ─────────────────────────────────────────────────────────────────
//  Dynamic metadata per term
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const term = lookupBySlug(slug);
  if (!term) return { title: 'INCOTERM Not Found | FreightUtils' };

  const ogUrl = `/api/og?title=${encodeURIComponent(term.code + ' — ' + term.name)}&desc=INCOTERMS+2020&badge=INCOTERMS`;

  return {
    title: `${term.code} (${term.name}) — INCOTERMS 2020 | FreightUtils`,
    description: `${term.code} (${term.name}) — ${term.summary} Free INCOTERMS 2020 reference at FreightUtils.`,
    alternates: {
      canonical: `https://www.freightutils.com/incoterms/${term.slug}`,
    },
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${term.code} — ${term.name} — INCOTERMS 2020` }],
    },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
  };
}

// ─────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────

function getAdjacent(currentSlug: string): { prev: Incoterm | null; next: Incoterm | null } {
  const all = getAllIncoterms();
  const idx = all.findIndex(t => t.slug === currentSlug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      gap: 16,
      padding: '14px 18px',
      borderBottom: '1px solid #eef0f4',
      flexWrap: 'wrap',
    }}>
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        color: '#8f9ab0',
        minWidth: 160,
        flexShrink: 0,
        paddingTop: 2,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#1a2332', lineHeight: 1.6, flex: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────

export default async function IncotermDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const term = lookupBySlug(slug);
  if (!term) notFound();

  const { prev, next } = getAdjacent(slug);
  const isSea = term.category === 'sea_only';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: `${term.code} — ${term.name}`,
    description: term.summary,
    url: `https://www.freightutils.com/incoterms/${term.slug}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'INCOTERMS 2020',
      url: 'https://www.freightutils.com/incoterms',
    },
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
            { '@type': 'ListItem', position: 2, name: 'INCOTERMS', item: 'https://www.freightutils.com/incoterms' },
            { '@type': 'ListItem', position: 3, name: `${term.code} (${term.name})` },
          ],
        }) }}
      />

      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 20, fontSize: 13, color: '#8f9ab0' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href="/incoterms" style={{ color: '#8f9ab0', textDecoration: 'none' }}>INCOTERMS</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <span style={{ color: '#e87722' }}>{term.code}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              background: '#e87722',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: 22,
              fontWeight: 800,
              padding: '8px 16px',
              borderRadius: 8,
              flexShrink: 0,
              letterSpacing: 1,
            }}>
              {term.code}
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(18px, 4vw, 28px)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.25,
                letterSpacing: '-0.3px',
              }}>
                {term.name}
              </h1>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {isSea ? (
                  <span style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    border: '1px solid #93c5fd',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}>
                    Sea and Inland Waterway Only
                  </span>
                ) : (
                  <span style={{
                    background: '#fff7ed',
                    color: '#9a3412',
                    border: '1px solid #fdba74',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}>
                    Any Mode of Transport
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Summary */}
        <p style={{
          fontSize: 16,
          color: '#5a6478',
          lineHeight: 1.7,
          marginBottom: 28,
          padding: '16px 20px',
          background: '#f7f8fa',
          borderRadius: 10,
          border: '1px solid #eef0f4',
        }}>
          {term.summary}
        </p>

        {/* Detail card */}
        <div style={{
          background: '#fff',
          border: '1px solid #d8dce6',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <div style={{
            background: '#1a2332',
            padding: '14px 18px',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#fff',
          }}>
            {term.code} — Responsibilities &amp; Risk
          </div>
          <div>
            <DetailRow label="Seller's Responsibility" value={term.seller_responsibility} />
            <DetailRow label="Buyer's Responsibility" value={term.buyer_responsibility} />
            <DetailRow label="Risk Transfer Point" value={term.risk_transfer} />
            <DetailRow label="Cost Transfer Point" value={term.cost_transfer} />
            <DetailRow label="Insurance Obligation" value={term.insurance} />
            <DetailRow label="Export Clearance" value={term.export_clearance} />
            <DetailRow label="Import Clearance" value={term.import_clearance} />
          </div>
        </div>

        {/* Best For */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 12,
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            color: '#166534',
            marginBottom: 6,
          }}>
            Best For
          </div>
          <div style={{ fontSize: 14, color: '#166534', lineHeight: 1.6 }}>
            {term.best_for}
          </div>
        </div>

        {/* Watch Out */}
        <div style={{
          background: '#fff7ed',
          border: '1px solid #fdba74',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 32,
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            color: '#9a3412',
            marginBottom: 6,
          }}>
            Watch Out
          </div>
          <div style={{ fontSize: 14, color: '#9a3412', lineHeight: 1.6 }}>
            {term.watch_out}
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/incoterms" style={{
            color: '#e87722',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}>
            ← Back to all INCOTERMS
          </Link>
        </div>

        {/* Ad unit */}
        <AdUnit format="auto" />

        {/* Prev / Next navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 24,
        }}>
          {prev ? (
            <Link href={`/incoterms/${prev.slug}`} style={{
              background: '#fff',
              border: '1px solid #d8dce6',
              borderRadius: 8,
              padding: '11px 16px',
              textDecoration: 'none',
              color: '#1a2332',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              &larr; {prev.code}
            </Link>
          ) : <div />}

          <Link href="/incoterms" style={{
            background: '#fff',
            border: '1px solid #d8dce6',
            borderRadius: 8,
            padding: '11px 16px',
            textDecoration: 'none',
            color: '#5a6478',
            fontSize: 13,
            fontWeight: 600,
          }}>
            &uarr; All INCOTERMS
          </Link>

          {next ? (
            <Link href={`/incoterms/${next.slug}`} style={{
              background: '#fff',
              border: '1px solid #d8dce6',
              borderRadius: 8,
              padding: '11px 16px',
              textDecoration: 'none',
              color: '#1a2332',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {next.code} &rarr;
            </Link>
          ) : <div />}
        </div>

      </main>
    </>
  );
}
