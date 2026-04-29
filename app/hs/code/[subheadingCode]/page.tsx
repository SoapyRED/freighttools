import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCodeDetails, getSubheadingsByHeading, formatHsCode } from '@/lib/calculations/hs';
import { HsSmallCard } from '@/app/hs/HsLinkCard';
import { getHsDgWarning, HS_DG_DISCLAIMER } from '@/lib/data/hs-dg-warnings';
import { buildHsCodeMetadata } from '@/lib/seo/page-metadata';

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata(
  { params }: { params: Promise<{ subheadingCode: string }> }
): Promise<Metadata> {
  const { subheadingCode } = await params;
  const details = getCodeDetails(subheadingCode);
  if (!details) return { title: 'HS Code Not Found' };

  return buildHsCodeMetadata({
    code: subheadingCode,
    formattedCode: formatHsCode(subheadingCode),
    description: details.description,
    parentFormatted: details.parent ? formatHsCode(details.parent) : undefined,
  });
}

export default async function SubheadingPage(
  { params }: { params: Promise<{ subheadingCode: string }> }
) {
  const { subheadingCode } = await params;
  const details = getCodeDetails(subheadingCode);
  if (!details) notFound();

  const heading = details.ancestors.find(a => a.level === 4);
  const chapter = details.ancestors.find(a => a.level === 2);
  const siblings = getSubheadingsByHeading(details.parent).filter(s => s.hscode !== subheadingCode);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FreightUtils', item: 'https://www.freightutils.com' },
      { '@type': 'ListItem', position: 2, name: 'HS Codes', item: 'https://www.freightutils.com/hs' },
      { '@type': 'ListItem', position: 3, name: `Section ${details.section}`, item: `https://www.freightutils.com/hs/section/${details.section.toLowerCase()}` },
      ...(chapter ? [{ '@type': 'ListItem' as const, position: 4, name: `Chapter ${chapter.hscode}`, item: `https://www.freightutils.com/hs/chapter/${chapter.hscode}` }] : []),
      ...(heading ? [{ '@type': 'ListItem' as const, position: 5, name: formatHsCode(heading.hscode), item: `https://www.freightutils.com/hs/heading/${heading.hscode}` }] : []),
      { '@type': 'ListItem', position: 6, name: formatHsCode(subheadingCode) },
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
            {chapter && (
              <>
                <Link href={`/hs/chapter/${chapter.hscode}`} style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Ch. {chapter.hscode}</Link>
                <span style={{ margin: '0 8px' }}>&rsaquo;</span>
              </>
            )}
            {heading && (
              <>
                <Link href={`/hs/heading/${heading.hscode}`} style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>{formatHsCode(heading.hscode)}</Link>
                <span style={{ margin: '0 8px' }}>&rsaquo;</span>
              </>
            )}
            <span style={{ color: '#e87722' }}>{formatHsCode(subheadingCode)}</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            HS {formatHsCode(subheadingCode)}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-faint)', marginTop: 8, maxWidth: 700 }}>
            {details.description}
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* DG Warning */}
        {(() => {
          const warning = getHsDgWarning(subheadingCode);
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

        {/* Hierarchy card */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
          overflow: 'hidden', marginBottom: 32,
        }}>
          <div style={{ background: 'var(--bg-card)', padding: '14px 18px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
            Classification Hierarchy
          </div>
          <div>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #eef0f4', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', minWidth: 80 }}>SECTION</span>
              <Link href={`/hs/section/${details.section.toLowerCase()}`} style={{ fontSize: 14, color: '#e87722', textDecoration: 'none', fontWeight: 600 }}>
                {details.section}: {details.sectionName}
              </Link>
            </div>
            {chapter && (
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #eef0f4', display: 'flex', gap: 12, alignItems: 'center', paddingLeft: 36 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', minWidth: 80 }}>CHAPTER</span>
                <Link href={`/hs/chapter/${chapter.hscode}`} style={{ fontSize: 14, color: '#e87722', textDecoration: 'none', fontWeight: 600 }}>
                  {chapter.hscode}: {chapter.description}
                </Link>
              </div>
            )}
            {heading && (
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #eef0f4', display: 'flex', gap: 12, alignItems: 'center', paddingLeft: 54 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', minWidth: 80 }}>HEADING</span>
                <Link href={`/hs/heading/${heading.hscode}`} style={{ fontSize: 14, color: '#e87722', textDecoration: 'none', fontWeight: 600 }}>
                  {formatHsCode(heading.hscode)}: {heading.description}
                </Link>
              </div>
            )}
            <div style={{ padding: '12px 18px', display: 'flex', gap: 12, alignItems: 'center', paddingLeft: 72, background: '#fff7ed' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#e87722', minWidth: 80 }}>CODE</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                {formatHsCode(subheadingCode)}: {details.description}
              </span>
            </div>
          </div>
        </div>

        {/* National tariff note */}
        <div style={{
          background: 'var(--bg)', border: '1px solid #eef0f4', borderRadius: 10,
          padding: '16px 20px', marginBottom: 32,
        }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 0 }}>
            This is the international 6-digit HS code. Your country may use additional digits for national tariff purposes.
            For UK tariff and duty rates, check the{' '}
            <a href="https://www.trade-tariff.service.gov.uk/find_commodity" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722', textDecoration: 'underline' }}>UK Trade Tariff</a>.
            For US rates, check the{' '}
            <a href="https://hts.usitc.gov/" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722', textDecoration: 'underline' }}>USITC HTS</a>.
          </p>
        </div>

        {/* Sibling codes */}
        {siblings.length > 0 && (
          <>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.3px' }}>
              Related Codes Under {formatHsCode(details.parent)}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {siblings.map(s => (
                <HsSmallCard key={s.hscode} href={`/hs/code/${s.hscode}`} code={formatHsCode(s.hscode)} description={s.description} />
              ))}
            </div>
          </>
        )}

        <div style={{ marginBottom: 24 }}>
          {heading && (
            <Link href={`/hs/heading/${heading.hscode}`} style={{ color: '#e87722', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              &larr; Heading {formatHsCode(heading.hscode)}: {heading.description}
            </Link>
          )}
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
