import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  lookupByUnNumber,
  getAllUnNumbers,
  type AdrEntry,
} from '@/lib/calculations/adr';
import AdUnit from '@/app/components/AdUnit';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';

// ─────────────────────────────────────────────────────────────────
//  Static generation — one page per unique UN number
// ─────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllUnNumbers().map(un => ({ unNumber: un }));
}

// ─────────────────────────────────────────────────────────────────
//  Dynamic metadata per entry
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ unNumber: string }> }
): Promise<Metadata> {
  const { unNumber } = await params;
  const entries = lookupByUnNumber(unNumber);
  if (entries.length === 0) return { title: 'UN Number Not Found | FreightUtils' };

  const entry = entries[0];
  const pg = entry.packing_group ? `, Packing Group ${entry.packing_group}` : '';
  const shortName = entry.proper_shipping_name.length > 60
    ? entry.proper_shipping_name.slice(0, 57) + '…'
    : entry.proper_shipping_name;
  const variantNote = entries.length > 1 ? ` (${entries.length} variants)` : '';

  const ogUrl = `/api/og?badge=UN${entry.un_number}&title=${encodeURIComponent(shortName)}&desc=${encodeURIComponent(`Class ${entry.class}${pg} — ADR 2025`)}&api=GET+/api/adr%3Fun%3D${entry.un_number}`;

  return {
    title: `UN ${entry.un_number} — ${shortName}${variantNote} | ADR 2025 | FreightUtils`,
    description: `ADR 2025 dangerous goods data for UN ${entry.un_number} ${entry.proper_shipping_name}. Class ${entry.class}${pg}. Free lookup at FreightUtils.`,
    alternates: {
      canonical: `https://www.freightutils.com/adr/un/${entry.un_number}`,
    },
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `UN ${entry.un_number} — ${shortName}` }],
    },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
  };
}

// ─────────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────────

const CLASS_COLOURS: Record<string, { bg: string; border: string; text: string }> = {
  '1': { bg: '#fef9c3', border: '#fde047', text: '#854d0e' },
  '2': { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  '3': { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  '4': { bg: '#ffedd5', border: '#fdba74', text: '#9a3412' },
  '5': { bg: '#ede9fe', border: '#c4b5fd', text: '#5b21b6' },
  '6': { bg: '#dcfce7', border: '#86efac', text: '#166534' },
  '7': { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  '8': { bg: '#f1f5f9', border: '#cbd5e1', text: '#334155' },
  '9': { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' },
};

function getClassStyle(cls: string) {
  const key = cls.split('.')[0];
  return CLASS_COLOURS[key] ?? { bg: '#f1f5f9', border: '#d8dce6', text: '#334155' };
}

const CLASS_NAMES: Record<string, string> = {
  '1': 'Explosives',
  '2': 'Gases',
  '3': 'Flammable Liquids',
  '4': 'Flammable Solids',
  '5': 'Oxidising Substances & Organic Peroxides',
  '6': 'Toxic & Infectious Substances',
  '7': 'Radioactive Material',
  '8': 'Corrosive Substances',
  '9': 'Miscellaneous Dangerous Substances',
};

// ─────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
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
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function Tag({ value, colour }: { value: string; colour?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: colour ?? '#eef0f4',
      color: colour ? '#fff' : '#5a6478',
      fontSize: 12,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 20,
      marginRight: 6,
      marginBottom: 6,
      fontFamily: 'monospace',
    }}>
      {value}
    </span>
  );
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 16,
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
        {title}
      </div>
      <div style={{ padding: '16px 18px' }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Prev / Next navigation helpers
// ─────────────────────────────────────────────────────────────────

function getAdjacentUn(current: string, all: string[]): { prev: string | null; next: string | null } {
  const idx = all.indexOf(current);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Variant card — displays all fields for a single variant
// ─────────────────────────────────────────────────────────────────

function VariantCard({ entry, showHeader }: { entry: AdrEntry; showHeader: boolean }) {
  const cs = getClassStyle(entry.class);
  const className = CLASS_NAMES[entry.class.split('.')[0]] ?? `Class ${entry.class}`;

  return (
    <div style={{ marginBottom: showHeader ? 32 : 0 }}>
      {showHeader && (
        <div style={{
          background: '#e87722',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          padding: '6px 14px',
          borderRadius: '8px 8px 0 0',
          display: 'inline-block',
          marginBottom: 0,
        }}>
          Variant {entry.variant_index + 1} of {entry.variant_count}
        </div>
      )}

      <div style={{
        border: showHeader ? '2px solid #e87722' : 'none',
        borderRadius: showHeader ? '0 8px 8px 8px' : 0,
        padding: showHeader ? 20 : 0,
      }}>
        {/* PSN if multi-variant (different names per variant) */}
        {showHeader && (
          <h3 style={{
            fontSize: 16, fontWeight: 700, color: 'var(--text)',
            marginBottom: 16, lineHeight: 1.4,
          }}>
            {entry.proper_shipping_name}
          </h3>
        )}

        {/* Key stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}>
          <StatCard
            label="Hazard Class"
            value={entry.class}
            sub={className}
          />
          <StatCard
            label="Classification Code"
            value={entry.classification_code || '—'}
          />
          <StatCard
            label="Packing Group"
            value={entry.packing_group ?? 'N/A'}
            sub={entry.packing_group ? { I: 'High danger', II: 'Medium danger', III: 'Low danger' }[entry.packing_group] : 'Not applicable'}
          />
          <StatCard
            label="Hazard ID No."
            value={entry.hazard_identification_number ?? '—'}
            sub="Kemler code"
          />
          {entry.transport_category != null && (
            <StatCard
              label="Transport Category"
              value={String(entry.transport_category)}
              sub="For 1,000-point rule"
            />
          )}
          {entry.tunnel_restriction_code && (
            <StatCard
              label="Tunnel Code"
              value={entry.tunnel_restriction_code}
              sub="Tunnel restriction"
            />
          )}
        </div>

        {/* Labels */}
        {entry.labels && (
          <SectionBox title="Hazard Labels Required">
            <div>
              {entry.labels.split(/[+,]+/).map(l => l.trim()).filter(Boolean).map(label => (
                <Tag key={label} value={`Label ${label}`} colour="#1a2332" />
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 10 }}>
              These labels must be displayed on packages and vehicle placards in accordance with ADR 2025.
            </p>
          </SectionBox>
        )}

        {/* Special provisions */}
        {entry.special_provisions && (
          <SectionBox title="Special Provisions">
            <div>
              {entry.special_provisions.split(/[\s,]+/).filter(Boolean).map(sp => (
                <Tag key={sp} value={`SP ${sp}`} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 10 }}>
              Refer to ADR 2025 Chapter 3.3 for full text of each provision.
            </p>
          </SectionBox>
        )}

        {/* Quantities & categories */}
        <SectionBox title="Quantity Limits & Transport">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}>
            {[
              { label: 'Limited Quantity', value: entry.limited_quantity ?? '—', sub: 'Max per inner package for LQ relief' },
              { label: 'Excepted Quantity', value: entry.excepted_quantity ?? '—', sub: 'EQ code for excepted quantity relief' },
              { label: 'Transport Category', value: entry.transport_category ?? '—', sub: '0=highest, 4=lowest restriction' },
              { label: 'Tunnel Restriction', value: entry.tunnel_restriction_code ?? 'None', sub: 'Code governing tunnel passage' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-faint)', marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </SectionBox>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────

export default async function UnNumberPage(
  { params }: { params: Promise<{ unNumber: string }> }
) {
  const { unNumber } = await params;
  const entries = lookupByUnNumber(unNumber);
  if (entries.length === 0) notFound();

  const primary = entries[0];
  const hasVariants = entries.length > 1;
  const all = getAllUnNumbers();
  const { prev, next } = getAdjacentUn(primary.un_number, all);
  const cs = getClassStyle(primary.class);
  const className = CLASS_NAMES[primary.class.split('.')[0]] ?? `Class ${primary.class}`;

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `UN ${primary.un_number} — ${primary.proper_shipping_name}`,
    description: `ADR 2025 dangerous goods data for UN ${primary.un_number} ${primary.proper_shipping_name}. Hazard class ${primary.class}, packing group ${primary.packing_group ?? 'N/A'}.${hasVariants ? ` ${entries.length} classification variants.` : ''}`,
    url: `https://www.freightutils.com/adr/un/${primary.un_number}`,
    keywords: [
      `UN${primary.un_number}`,
      `UN number ${primary.un_number}`,
      primary.proper_shipping_name,
      `ADR class ${primary.class}`,
      'dangerous goods',
      'ADR 2025',
      'hazmat',
    ],
    creator: {
      '@type': 'Organization',
      name: 'FreightUtils',
      url: 'https://www.freightutils.com',
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
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
            { '@type': 'ListItem', position: 2, name: 'ADR Dangerous Goods', item: 'https://www.freightutils.com/adr' },
            { '@type': 'ListItem', position: 3, name: `UN ${primary.un_number}` },
          ],
        }) }}
      />

      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-faint)' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <Link href="/adr" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>ADR Lookup</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: '#e87722' }}>UN {primary.un_number}</span>
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
              UN{primary.un_number}
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(18px, 4vw, 28px)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.25,
                letterSpacing: '-0.3px',
              }}>
                {primary.proper_shipping_name}
              </h1>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  background: cs.bg,
                  color: cs.text,
                  border: `1px solid ${cs.border}`,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                }}>
                  Class {primary.class} — {className}
                </span>
                {primary.packing_group && (
                  <span style={{
                    background: '#2e3d55',
                    color: '#c8d0e0',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}>
                    Packing Group {primary.packing_group}
                  </span>
                )}
                {hasVariants && (
                  <span style={{
                    background: '#e87722',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}>
                    {entries.length} variants
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Variant notice */}
        {hasVariants && (
          <div style={{
            background: '#fff7ed',
            border: '1px solid #fdba74',
            borderRadius: 10,
            padding: '14px 18px',
            marginBottom: 24,
            fontSize: 14,
            color: '#9a3412',
            lineHeight: 1.6,
          }}>
            <strong>UN {primary.un_number}</strong> has <strong>{entries.length} classification variants</strong> in ADR 2025 — different hazard divisions or descriptions for the same UN number.
            Each variant may have different transport requirements.
          </div>
        )}

        {/* Render all variants */}
        {entries.map((entry) => (
          <VariantCard
            key={entry.variant_index}
            entry={entry}
            showHeader={hasVariants}
          />
        ))}

        {/* API callout */}
        <div style={{
          background: '#1a2332',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 6 }}>
              Use this data programmatically
            </div>
            <code style={{ color: '#e87722', fontSize: 13 }}>
              GET /api/adr?un={primary.un_number}
            </code>
          </div>
          <Link
            href="/api-docs#adr"
            style={{
              background: '#e87722',
              color: '#fff',
              textDecoration: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            View API Docs →
          </Link>
        </div>

        <ToolDisclaimer text="ADR reference data only. Classification is the consignor's legal responsibility. Consult a DGSA for compliance decisions." />

        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 20, lineHeight: 1.6 }}>
          Found an error?{' '}
          <a href="mailto:contact@freightutils.com?subject=Data%20correction%20—%20ADR" style={{ color: 'var(--text-faint)', textDecoration: 'underline' }}>
            Let us know &rarr; contact@freightutils.com
          </a>
        </p>

        {/* Ad unit */}
        <AdUnit format="auto" />

        {/* Prev / Next navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          {prev ? (
            <Link href={`/adr/un/${prev}`} style={{
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
              ← UN{prev}
            </Link>
          ) : <div />}

          <Link href="/adr" style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '11px 16px',
            textDecoration: 'none',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 600,
          }}>
            ↑ Back to search
          </Link>

          {next ? (
            <Link href={`/adr/un/${next}`} style={{
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
              UN{next} →
            </Link>
          ) : <div />}
        </div>

      </main>
    </>
  );
}
