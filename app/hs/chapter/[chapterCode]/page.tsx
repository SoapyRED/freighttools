import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllChapterCodes, getCodeDetails, getHeadingsByChapter, formatHsCode } from '@/lib/calculations/hs';
import HsLinkCard from '@/app/hs/HsLinkCard';
import { getHsDgWarning, HS_DG_DISCLAIMER } from '@/lib/data/hs-dg-warnings';
import { SITE_STATS } from '@/lib/constants/siteStats';

export function generateStaticParams() {
  return getAllChapterCodes().map(c => ({ chapterCode: c }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ chapterCode: string }> }
): Promise<Metadata> {
  const { chapterCode } = await params;
  const details = getCodeDetails(chapterCode);
  if (!details) return { title: 'Chapter Not Found' };

  const ogUrl = `/api/og?title=${encodeURIComponent(`HS Chapter ${chapterCode}`)}&desc=${encodeURIComponent(details.description)}&badge=HS`;

  return {
    title: `HS Chapter ${chapterCode} — ${details.description.length > 40 ? details.description.slice(0, 37) + '…' : details.description}`,
    description: `HS Chapter ${chapterCode}: ${details.description}. Browse all headings and subheadings. Free HS code lookup with REST API.`,
    alternates: { canonical: `https://www.freightutils.com/hs/chapter/${chapterCode}` },
    openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: `HS Chapter ${chapterCode} — FreightUtils` }] },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
    other: { 'article:modified_time': SITE_STATS.dataModifiedIso },
  };
}

export default async function ChapterPage(
  { params }: { params: Promise<{ chapterCode: string }> }
) {
  const { chapterCode } = await params;
  const details = getCodeDetails(chapterCode);
  if (!details) notFound();

  const headings = getHeadingsByChapter(chapterCode);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FreightUtils', item: 'https://www.freightutils.com' },
      { '@type': 'ListItem', position: 2, name: 'HS Codes', item: 'https://www.freightutils.com/hs' },
      { '@type': 'ListItem', position: 3, name: `Section ${details.section}`, item: `https://www.freightutils.com/hs/section/${details.section.toLowerCase()}` },
      { '@type': 'ListItem', position: 4, name: `Chapter ${chapterCode}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: 'var(--bg-hero)', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <nav style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-faint)' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href="/hs" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>HS Codes</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href={`/hs/section/${details.section.toLowerCase()}`} style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Section {details.section}</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <span style={{ color: '#e87722' }}>Chapter {chapterCode}</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Chapter {chapterCode} &mdash; <span style={{ color: '#e87722' }}>{details.description}</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-faint)', marginTop: 8 }}>
            {headings.length} headings &middot; Section {details.section}: {details.sectionName}
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* DG Warning for specific chapters */}
        {(() => {
          const warning = getHsDgWarning(chapterCode);
          if (!warning || warning.type !== 'soft') return null;
          return (
            <div className="warning-badge info" style={{ marginBottom: 24 }}>
              <div>
                <div style={{ marginBottom: 6 }}>{warning.message}{' '}
                  <a href="/adr" style={{ color: '#1e40af', textDecoration: 'underline', fontWeight: 600 }}>
                    Search ADR dangerous goods &rarr;
                  </a>
                </div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{HS_DG_DISCLAIMER}</div>
              </div>
            </div>
          );
        })()}

        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Headings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
          {headings.map(h => (
            <HsLinkCard key={h.hscode} href={`/hs/heading/${h.hscode}`} code={formatHsCode(h.hscode)} description={h.description} />
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          <Link href={`/hs/section/${details.section.toLowerCase()}`} style={{ color: '#e87722', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            &larr; Section {details.section}: {details.sectionName}
          </Link>
        </div>

      </main>
    </>
  );
}
