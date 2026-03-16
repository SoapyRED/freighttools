import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  lookupByUnNumber,
  getAllUnNumbers,
  type AdrEntry,
} from '@/lib/calculations/adr';

// ─────────────────────────────────────────────────────────────────
//  Static generation — 2,336 pages at build time
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
  const entry = lookupByUnNumber(unNumber);
  if (!entry) return { title: 'UN Number Not Found | FreightUtils' };

  const pg = entry.packing_group ? `, Packing Group ${entry.packing_group}` : '';
  const shortName = entry.proper_shipping_name.length > 60
    ? entry.proper_shipping_name.slice(0, 57) + '…'
    : entry.proper_shipping_name;

  return {
    title: `UN ${entry.un_number} — ${shortName} | ADR 2025 | FreightUtils`,
    description: `ADR 2025 dangerous goods data for UN ${entry.un_number} ${entry.proper_shipping_name}. Class ${entry.class}${pg}. Free lookup at FreightUtils.`,
    alternates: {
      canonical: `https://freightutils.com/adr/un/${entry.un_number}`,
    },
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
      border: '1px solid #d8dce6',
      borderRadius: 10,
      padding: '16px 18px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8f9ab0', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1a2332', lineHeight: 1.2 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 4 }}>{sub}</div>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #d8dce6',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      <div style={{
        background: '#f7f8fa',
        borderBottom: '1px solid #eef0f4',
        padding: '11px 18px',
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#5a6478',
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
//  Page
// ─────────────────────────────────────────────────────────────────

export default async function UnNumberPage(
  { params }: { params: Promise<{ unNumber: string }> }
) {
  const { unNumber } = await params;
  const entry = lookupByUnNumber(unNumber);
  if (!entry) notFound();

  const all = getAllUnNumbers();
  const { prev, next } = getAdjacentUn(entry.un_number, all);
  const cs = getClassStyle(entry.class);
  const className = CLASS_NAMES[entry.class.split('.')[0]] ?? `Class ${entry.class}`;

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `UN ${entry.un_number} — ${entry.proper_shipping_name}`,
    description: `ADR 2025 dangerous goods data for UN ${entry.un_number} ${entry.proper_shipping_name}. Hazard class ${entry.class}, packing group ${entry.packing_group ?? 'N/A'}.`,
    url: `https://freightutils.com/adr/un/${entry.un_number}`,
    keywords: [
      `UN${entry.un_number}`,
      `UN number ${entry.un_number}`,
      entry.proper_shipping_name,
      `ADR class ${entry.class}`,
      'dangerous goods',
      'ADR 2025',
      'hazmat',
    ],
    creator: {
      '@type': 'Organization',
      name: 'FreightUtils',
      url: 'https://freightutils.com',
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 20, fontSize: 13, color: '#8f9ab0' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none' }}>FreightUtils</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <Link href="/adr" style={{ color: '#8f9ab0', textDecoration: 'none' }}>ADR Lookup</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: '#e87722' }}>UN {entry.un_number}</span>
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
              UN{entry.un_number}
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(18px, 4vw, 28px)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.25,
                letterSpacing: '-0.3px',
              }}>
                {entry.proper_shipping_name}
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
                  Class {entry.class} — {className}
                </span>
                {entry.packing_group && (
                  <span style={{
                    background: '#2e3d55',
                    color: '#c8d0e0',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}>
                    Packing Group {entry.packing_group}
                  </span>
                )}
                {entry.transport_prohibited && (
                  <span style={{
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}>
                    Transport prohibited
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
          marginBottom: 24,
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
          {entry.transport_category !== null && (
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
        {entry.labels.length > 0 && (
          <Section title="Hazard Labels Required">
            <div>
              {entry.labels.map(label => (
                <Tag key={label} value={`Label ${label}`} colour="#1a2332" />
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#8f9ab0', marginTop: 10 }}>
              These labels must be displayed on packages and vehicle placards in accordance with ADR 2025.
            </p>
          </Section>
        )}

        {/* Special provisions */}
        {entry.special_provisions.length > 0 && (
          <Section title={`Special Provisions (${entry.special_provisions.length})`}>
            <div>
              {entry.special_provisions.map(sp => (
                <Tag key={sp} value={`SP ${sp}`} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#8f9ab0', marginTop: 10 }}>
              Special provisions may modify or add to the standard transport requirements for this substance.
              Refer to ADR 2025 Chapter 3.3 for full text of each provision.
            </p>
          </Section>
        )}

        {/* Quantities & categories */}
        <Section title="Quantity Limits & Transport">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}>
            {[
              { label: 'Limited Quantity', value: entry.limited_quantity ?? '—', sub: 'Max per inner package for LQ relief' },
              { label: 'Excepted Quantity', value: entry.excepted_quantity ?? '—', sub: 'EQ code for excepted quantity relief' },
              { label: 'Transport Category', value: entry.transport_category !== null ? String(entry.transport_category) : '—', sub: '0=highest, 4=lowest restriction' },
              { label: 'Tunnel Restriction', value: entry.tunnel_restriction_code ?? 'None', sub: 'Code governing tunnel passage' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#8f9ab0', marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1a2332', marginBottom: 2 }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 12, color: '#8f9ab0' }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </Section>

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
              GET /api/adr?un={entry.un_number}
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
              ← UN{prev}
            </Link>
          ) : <div />}

          <Link href="/adr" style={{
            background: '#fff',
            border: '1px solid #d8dce6',
            borderRadius: 8,
            padding: '11px 16px',
            textDecoration: 'none',
            color: '#5a6478',
            fontSize: 13,
            fontWeight: 600,
          }}>
            ↑ Back to search
          </Link>

          {next ? (
            <Link href={`/adr/un/${next}`} style={{
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
              UN{next} →
            </Link>
          ) : <div />}
        </div>

      </main>
    </>
  );
}
