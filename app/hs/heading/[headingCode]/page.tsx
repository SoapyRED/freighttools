import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllHeadingCodes, getCodeDetails, getSubheadingsByHeading, formatHsCode } from '@/lib/calculations/hs';
import HsLinkCard from '@/app/hs/HsLinkCard';
import AdUnit from '@/app/components/AdUnit';

export function generateStaticParams() {
  return getAllHeadingCodes().map(h => ({ headingCode: h }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ headingCode: string }> }
): Promise<Metadata> {
  const { headingCode } = await params;
  const details = getCodeDetails(headingCode);
  if (!details) return { title: 'Heading Not Found | FreightUtils' };

  const ogUrl = `/api/og?title=${encodeURIComponent(`HS ${formatHsCode(headingCode)}`)}&desc=${encodeURIComponent(details.description)}&badge=HS`;

  return {
    title: `HS ${formatHsCode(headingCode)} — ${details.description} | FreightUtils`,
    description: `HS code ${formatHsCode(headingCode)}: ${details.description}. View all 6-digit subheadings. Free lookup and API at FreightUtils.`,
    alternates: { canonical: `https://www.freightutils.com/hs/heading/${headingCode}` },
    openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: `HS ${formatHsCode(headingCode)} — FreightUtils` }] },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
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
          <nav style={{ marginBottom: 20, fontSize: 13, color: '#8f9ab0' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href="/hs" style={{ color: '#8f9ab0', textDecoration: 'none' }}>HS Codes</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href={`/hs/section/${details.section.toLowerCase()}`} style={{ color: '#8f9ab0', textDecoration: 'none' }}>Section {details.section}</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href={`/hs/chapter/${details.parent}`} style={{ color: '#8f9ab0', textDecoration: 'none' }}>Chapter {details.parent}</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <span style={{ color: '#e87722' }}>{formatHsCode(headingCode)}</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            HS {formatHsCode(headingCode)} &mdash; <span style={{ color: '#e87722' }}>{details.description}</span>
          </h1>
          <p style={{ fontSize: 15, color: '#8f9ab0', marginTop: 8 }}>
            {subheadings.length} subheadings &middot; Chapter {details.parent}: {chapter?.description ?? ''}
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Subheadings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
          {subheadings.map(sh => (
            <HsLinkCard key={sh.hscode} href={`/hs/code/${sh.hscode}`} code={formatHsCode(sh.hscode)} description={sh.description} />
          ))}
          {subheadings.length === 0 && (
            <p style={{ color: '#8f9ab0', fontSize: 14, padding: '16px 0' }}>
              No 6-digit subheadings listed for this heading in the HS 2022 data.
            </p>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <Link href={`/hs/chapter/${details.parent}`} style={{ color: '#e87722', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            &larr; Chapter {details.parent}: {chapter?.description ?? ''}
          </Link>
        </div>

        <AdUnit format="auto" />
      </main>
    </>
  );
}
