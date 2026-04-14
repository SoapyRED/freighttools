import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCodeDetails, getSubheadingsByHeading, formatHsCode } from '@/lib/calculations/hs';
import HsLinkCard from '@/app/hs/HsLinkCard';
import { getHsDgWarning, HS_DG_DISCLAIMER } from '@/lib/data/hs-dg-warnings';

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata(
  { params }: { params: Promise<{ headingCode: string }> }
): Promise<Metadata> {
  const { headingCode } = await params;
  const details = getCodeDetails(headingCode);
  if (!details) return { title: 'Heading Not Found' };

  const ogUrl = `/api/og?title=${encodeURIComponent(`HS ${formatHsCode(headingCode)}`)}&desc=${encodeURIComponent(details.description)}&badge=HS`;

  return {
    title: `HS ${formatHsCode(headingCode)} — ${details.description.length > 40 ? details.description.slice(0, 37) + '…' : details.description}`,
    description: `HS code ${formatHsCode(headingCode)}: ${details.description}. View all 6-digit subheadings. Free lookup and API at FreightUtils.`,
    alternates: { canonical: `https://www.freightutils.com/hs/heading/${headingCode}` },
    openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: `HS ${formatHsCode(headingCode)} — FreightUtils` }] },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
    other: { 'article:modified_time': '2026-04-01T00:00:00Z' },
  };
}

export default async function HeadingPage(
  { params }: { params: Promise<{ headingCode: string }> }
) {
  const { headingCode } = await params;
  const details = getCodeDetails(headingCode);
  if (!details) notFound();

  const subheadings = getSubheadingsByHeading(headingCode);
  const chapter = details.ancestors.find(a => a.level === 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FreightUtils', item: 'https://www.freightutils.com' },
      { '@type': 'ListItem', position: 2, name: 'HS Codes', item: 'https://www.freightutils.com/hs' },
      { '@type': 'ListItem', position: 3, name: `Section ${details.section}`, item: `https://www.freightutils.com/hs/section/${details.section.toLowerCase()}` },
      { '@type': 'ListItem', position: 4, name: `Chapter ${details.parent}`, item: `https://www.freightutils.com/hs/chapter/${details.parent}` },
      { '@type': 'ListItem', position: 5, name: formatHsCode(headingCode) },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: '#1a2332', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <nav style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-faint)' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href="/hs" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>HS Codes</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href={`/hs/section/${details.section.toLowerCase()}`} style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Section {details.section}</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href={`/hs/chapter/${details.parent}`} style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Chapter {details.parent}</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <span style={{ color: '#e87722' }}>{formatHsCode(headingCode)}</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            HS {formatHsCode(headingCode)} &mdash; <span style={{ color: '#e87722' }}>{details.description}</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-faint)', marginTop: 8 }}>
            {subheadings.length} subheadings &middot; Chapter {details.parent}: {chapter?.description ?? ''}
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* DG Warning */}
        {(() => {
          const warning = getHsDgWarning(headingCode);
          if (!warning) return null;
          const isHard = warning.type === 'hard';
          return (
            <div className={`warning-badge ${isHard ? 'warn' : 'info'}`} style={{ marginBottom: 24 }}>
              <div>
                <div style={{ marginBottom: 6 }}>{warning.message}{' '}
                  <a href="/adr" style={{ color: isHard ? '#92400e' : '#1e40af', textDecoration: 'underline', fontWeight: 600 }}>
                    Check ADR classification &rarr;
                  </a>
                </div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{HS_DG_DISCLAIMER}</div>
              </div>
            </div>
          );
        })()}

        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Subheadings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
          {subheadings.map(sh => (
            <HsLinkCard key={sh.hscode} href={`/hs/code/${sh.hscode}`} code={formatHsCode(sh.hscode)} description={sh.description} />
          ))}
          {subheadings.length === 0 && (
            <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '16px 0' }}>
              No 6-digit subheadings listed for this heading in the HS 2022 data.
            </p>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <Link href={`/hs/chapter/${details.parent}`} style={{ color: '#e87722', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            &larr; Chapter {details.parent}: {chapter?.description ?? ''}
          </Link>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 20, lineHeight: 1.6 }}>
          Found an error?{' '}
          <a href="mailto:contact@freightutils.com?subject=Data%20correction%20—%20HS%20codes" style={{ color: 'var(--text-faint)', textDecoration: 'underline' }}>
            Let us know &rarr; contact@freightutils.com
          </a>
        </p>

      </main>
    </>
  );
}
