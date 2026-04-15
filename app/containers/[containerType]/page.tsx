import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllContainerSlugs, getContainerSpec, getAllContainerSpecs, type ContainerSpec } from '@/lib/calculations/container-capacity';

// ─────────────────────────────────────────────────────────────────
//  Static generation — one page per container type
// ─────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllContainerSlugs().map(containerType => ({ containerType }));
}

// ─────────────────────────────────────────────────────────────────
//  Dynamic metadata per container
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ containerType: string }> }
): Promise<Metadata> {
  const { containerType } = await params;
  const spec = getContainerSpec(containerType);
  if (!spec) return { title: 'Container Not Found' };

  const ogUrl = `/api/og?title=${encodeURIComponent(spec.name + ' Container')}&desc=${encodeURIComponent(`${spec.internalLengthCm}\u00d7${spec.internalWidthCm}\u00d7${spec.internalHeightCm}cm \u2022 ${spec.capacityCbm} CBM \u2022 ${spec.maxPayloadKg.toLocaleString()} kg`)}&badge=Containers`;

  return {
    title: `${spec.name} Container Dimensions, Weight & Capacity`,
    description: `${spec.name} container specs \u2014 internal dimensions ${spec.internalLengthCm}\u00d7${spec.internalWidthCm}\u00d7${spec.internalHeightCm} cm, ${spec.capacityCbm} CBM capacity, ${spec.maxPayloadKg.toLocaleString()} kg max payload, ${spec.euroPallets} euro pallets. Free reference at FreightUtils.`,
    alternates: {
      canonical: `https://www.freightutils.com/containers/${spec.slug}`,
    },
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${spec.name} Container \u2014 FreightUtils` }],
    },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
  };
}

// ─────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────

function getAdjacent(currentSlug: string): { prev: ContainerSpec | null; next: ContainerSpec | null } {
  const all = getAllContainerSpecs();
  const idx = all.findIndex(c => c.slug === currentSlug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

function SpecRow({ label, value }: { label: string; value: string }) {
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
        color: 'var(--text-faint)',
        minWidth: 170,
        flexShrink: 0,
        paddingTop: 2,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, flex: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────

export default async function ContainerDetailPage(
  { params }: { params: Promise<{ containerType: string }> }
) {
  const { containerType } = await params;
  const spec = getContainerSpec(containerType);
  if (!spec) notFound();

  const { prev, next } = getAdjacent(containerType);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${spec.name} Shipping Container`,
    description: spec.description,
    url: `https://www.freightutils.com/containers/${spec.slug}`,
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
            { '@type': 'ListItem', position: 2, name: 'Container Specs', item: 'https://www.freightutils.com/containers' },
            { '@type': 'ListItem', position: 3, name: spec.name },
          ],
        }) }}
      />

      {/* Hero */}
      <div style={{ background: 'var(--bg-hero)', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-faint)' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href="/containers" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Container Specs</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <span style={{ color: '#e87722' }}>{spec.name}</span>
          </nav>

          <h1 style={{
            fontSize: 'clamp(22px, 5vw, 32px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.25,
            letterSpacing: '-0.3px',
          }}>
            {spec.name}
          </h1>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Spec card */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '14px 18px',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-primary)',
            borderBottom: '1px solid var(--border)',
          }}>
            {spec.name} &mdash; Specifications
          </div>
          <div>
            <SpecRow label="Internal Dimensions" value={`${spec.internalLengthCm} \u00d7 ${spec.internalWidthCm} \u00d7 ${spec.internalHeightCm} cm`} />
            <SpecRow label="External Dimensions" value={`${spec.externalLengthCm} \u00d7 ${spec.externalWidthCm} \u00d7 ${spec.externalHeightCm} cm`} />
            <SpecRow label="Door Opening" value={spec.doorWidthCm && spec.doorHeightCm ? `${spec.doorWidthCm} \u00d7 ${spec.doorHeightCm} cm` : 'N/A (open structure)'} />
            <SpecRow label="Tare Weight" value={`${spec.tareWeightKg.toLocaleString()} kg`} />
            <SpecRow label="Max Gross Weight" value={`${spec.maxGrossKg.toLocaleString()} kg`} />
            <SpecRow label="Max Payload" value={`${spec.maxPayloadKg.toLocaleString()} kg`} />
            <SpecRow label="CBM Capacity" value={`${spec.capacityCbm} m\u00b3`} />
            <SpecRow label="EUR Pallets (1200×800mm)" value={spec.euroPallets} />
            <SpecRow label="GMA Pallets (48×40in)" value={spec.gmaPallets} />
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 15,
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: 14,
        }}>
          {spec.description}
        </p>

        {/* Notes */}
        <p style={{
          fontSize: 14,
          color: 'var(--text-faint)',
          lineHeight: 1.6,
          marginBottom: 28,
          padding: '14px 18px',
          background: 'var(--bg)',
          borderRadius: 10,
          border: '1px solid #eef0f4',
        }}>
          {spec.notes}
        </p>

        {/* Cross-link to CBM calculator */}
        <div style={{ marginBottom: 24 }}>
          <Link href={`/cbm/${spec.slug}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff7ed',
            border: '1px solid #fdba74',
            borderRadius: 8,
            padding: '11px 18px',
            textDecoration: 'none',
            color: '#9a3412',
            fontSize: 14,
            fontWeight: 600,
          }}>
            Calculate CBM for this container &rarr;
          </Link>
        </div>

        {/* Back link */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/containers" style={{
            color: '#e87722',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}>
            &larr; Back to all containers
          </Link>
        </div>

        {/* Prev / Next navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 24,
        }}>
          {prev ? (
            <Link href={`/containers/${prev.slug}`} style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '11px 16px',
              textDecoration: 'none',
              color: 'var(--text)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              &larr; {prev.name}
            </Link>
          ) : <div />}

          <Link href="/containers" style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '11px 16px',
            textDecoration: 'none',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 600,
          }}>
            &uarr; All Containers
          </Link>

          {next ? (
            <Link href={`/containers/${next.slug}`} style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '11px 16px',
              textDecoration: 'none',
              color: 'var(--text)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {next.name} &rarr;
            </Link>
          ) : <div />}
        </div>

      </main>
    </>
  );
}
