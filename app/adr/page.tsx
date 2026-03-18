import type { Metadata } from 'next';
import Link from 'next/link';
import { getSlimIndex, ENTRY_COUNT } from '@/lib/calculations/adr';
import AdrSearch from './AdrSearch';
import AdUnit from '@/app/components/AdUnit';

export const metadata: Metadata = {
  title: 'ADR Dangerous Goods Lookup | FreightUtils',
  description: `Search ${ENTRY_COUNT.toLocaleString()} ADR 2025 dangerous goods entries by UN number or substance name. Free lookup tool for UK and European road freight.`,
  alternates: { canonical: 'https://freightutils.com/adr' },
};

export default function AdrPage() {
  // Build slim index server-side — passed to Client Component as prop
  // (~120 KB raw / ~30 KB gzipped — safe to embed)
  const index = getSlimIndex();

  return (
    <>
      {/* Hero */}
      <div style={{
        background: '#1a2332',
        padding: '40px 20px 48px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          ADR Dangerous Goods <span style={{ color: '#e87722' }}>Lookup</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 500, margin: '0 auto' }}>
          Search {ENTRY_COUNT.toLocaleString()} UN numbers from the ADR 2025 dangerous goods list — free, instant, no signup
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Search */}
        <AdrSearch index={index} />

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: '#8f9ab0', marginTop: 12, lineHeight: 1.6 }}>
          Data sourced from the official UNECE ADR 2025 publication (ECE/TRANS/352). For operational use, always verify against the{' '}
          <a href="https://unece.org/transport/dangerous-goods/adr-2025" target="_blank" rel="noopener noreferrer" style={{ color: '#8f9ab0', textDecoration: 'underline' }}>
            current ADR in force
          </a>.
        </p>

        {/* Ad unit */}
        <AdUnit format="auto" />

        {/* API callout */}
        <div style={{
          marginTop: 48,
          background: '#1a2332',
          borderRadius: 12,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 4 }}>
              Building something? Use the API.
            </div>
            <code style={{ color: '#e87722', fontSize: 13 }}>
              GET /api/adr?un=1203
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
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            View API Docs →
          </Link>
        </div>

        {/* SEO content */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
            What is ADR?
          </h2>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            <strong>ADR</strong> (Accord Dangereux Routier) is the European Agreement concerning the International
            Carriage of Dangerous Goods by Road. It governs how hazardous materials must be classified,
            packaged, labelled, and transported across road networks in the UK, EU, and 50 other signatory countries.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            Each dangerous substance is assigned a <strong>UN number</strong> — a 4-digit code that
            uniquely identifies it across all transport modes (road, rail, sea, and air). The ADR
            Dangerous Goods List (Table A) sets out the rules for each UN number: which hazard class
            it belongs to, what labels must be displayed, packing group requirements, quantity limits,
            and tunnel restrictions.
          </p>
          <p style={{ color: '#5a6478', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
            ADR is updated every two years. This tool uses the <strong>ADR 2025</strong> dataset,
            published by the United Nations Economic Commission for Europe (UNECE).
          </p>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', margin: '40px 0 16px', letterSpacing: '-0.3px' }}>
            How to read an ADR entry
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #d8dce6' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a2332', color: '#fff' }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Field</th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>What it means</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['UN Number', 'Unique 4-digit identifier for the substance (e.g. 1203 = Petrol/Gasoline)'],
                  ['Proper Shipping Name', 'The official name that must appear on packages and transport documents'],
                  ['Class', 'Primary hazard category (1=Explosives, 2=Gases, 3=Flammable liquids, 4=Flammable solids, 5=Oxidising, 6=Toxic, 7=Radioactive, 8=Corrosive, 9=Miscellaneous)'],
                  ['Classification Code', 'Sub-category within the class (e.g. F1 = flammable liquid without subsidiary hazard)'],
                  ['Packing Group', 'Degree of danger: I (high), II (medium), III (low). Some substances have no packing group.'],
                  ['Labels', 'Hazard warning labels that must be displayed on packages and vehicles'],
                  ['Special Provisions', 'Numbered exemptions or additional requirements that modify the standard rules'],
                  ['Limited Quantity', 'Maximum net quantity per inner packaging for limited quantity relief from full ADR requirements'],
                  ['Transport Category', 'Determines quantity thresholds for the 1,000-point rule (exemptions from full ADR for small shipments)'],
                  ['Tunnel Restriction Code', 'Which road tunnels the substance may pass through (A=no restriction, B/C/D/E = increasing restrictions)'],
                  ['Hazard ID Number', 'The Kemler code displayed on orange plates on vehicles — first digit indicates primary hazard, second subsidiary'],
                ].map(([field, desc]) => (
                  <tr key={field} style={{ borderBottom: '1px solid #eef0f4' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, color: '#1e2535', whiteSpace: 'nowrap' }}>{field}</td>
                    <td style={{ padding: '11px 16px', color: '#5a6478', lineHeight: 1.5 }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  );
}
