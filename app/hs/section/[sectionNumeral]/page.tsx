import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSectionNumerals, getSectionByNumeral, getChaptersBySection, getAllSections } from '@/lib/calculations/hs';
import HsLinkCard from '@/app/hs/HsLinkCard';

export function generateStaticParams() {
  return getAllSectionNumerals().map(n => ({ sectionNumeral: n }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ sectionNumeral: string }> }
): Promise<Metadata> {
  const { sectionNumeral } = await params;
  const section = getSectionByNumeral(sectionNumeral);
  if (!section) return { title: 'Section Not Found | FreightUtils' };

  const chapters = getChaptersBySection(sectionNumeral);
  const first = chapters[0]?.hscode ?? '';
  const last = chapters[chapters.length - 1]?.hscode ?? '';
  const ogUrl = `/api/og?title=${encodeURIComponent(`HS Section ${section.numeral.toUpperCase()}`)}&desc=${encodeURIComponent(section.name)}&badge=HS`;

  return {
    title: `HS Section ${section.numeral.toUpperCase()} — ${section.name} | FreightUtils`,
    description: `Browse HS codes in Section ${section.numeral.toUpperCase()}: ${section.name}. Chapters ${first}–${last}. Free HS code lookup and REST API.`,
    alternates: { canonical: `https://www.freightutils.com/hs/section/${section.numeral}` },
    openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: `HS Section ${section.numeral.toUpperCase()} — FreightUtils` }] },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
  };
}

export default async function SectionPage(
  { params }: { params: Promise<{ sectionNumeral: string }> }
) {
  const { sectionNumeral } = await params;
  const section = getSectionByNumeral(sectionNumeral);
  if (!section) notFound();

  const chapters = getChaptersBySection(sectionNumeral);
  const allSections = getAllSections();
  const idx = allSections.findIndex(s => s.numeral === section.numeral);
  const prev = idx > 0 ? allSections[idx - 1] : null;
  const next = idx < allSections.length - 1 ? allSections[idx + 1] : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FreightUtils', item: 'https://www.freightutils.com' },
      { '@type': 'ListItem', position: 2, name: 'HS Codes', item: 'https://www.freightutils.com/hs' },
      { '@type': 'ListItem', position: 3, name: `Section ${section.numeral.toUpperCase()}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <nav style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-faint)' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <Link href="/hs" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>HS Codes</Link>
            <span style={{ margin: '0 8px' }}>&rsaquo;</span>
            <span style={{ color: '#e87722' }}>Section {section.numeral.toUpperCase()}</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            Section {section.numeral.toUpperCase()} &mdash; <span style={{ color: '#e87722' }}>{section.name}</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-faint)', marginTop: 8 }}>
            {chapters.length} chapters in this section
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Chapters list */}
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          Chapters
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
          {chapters.map(ch => (
            <HsLinkCard key={ch.hscode} href={`/hs/chapter/${ch.hscode}`} code={ch.hscode} description={ch.description} />
          ))}
        </div>

        {/* Back + prev/next */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/hs" style={{ color: '#e87722', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            &larr; All sections
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          {prev ? (
            <Link href={`/hs/section/${prev.numeral}`} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
              padding: '11px 16px', textDecoration: 'none', color: 'var(--text)', fontSize: 13, fontWeight: 600,
            }}>
              &larr; Section {prev.numeral.toUpperCase()}
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`/hs/section/${next.numeral}`} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
              padding: '11px 16px', textDecoration: 'none', color: 'var(--text)', fontSize: 13, fontWeight: 600,
            }}>
              Section {next.numeral.toUpperCase()} &rarr;
            </Link>
          ) : <div />}
        </div>

      </main>
    </>
  );
}
