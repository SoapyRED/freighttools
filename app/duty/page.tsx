import type { Metadata } from 'next';
import DutyCalc from './DutyCalc';
import RelatedTools from '@/app/components/RelatedTools';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';

const ogUrl = '/api/og?title=UK+Import+Duty+Calculator&desc=Estimate+duty+and+VAT+for+UK+imports&api=POST+/api/duty';

export const metadata: Metadata = {
  title: 'UK Import Duty & VAT Calculator — FreightUtils',
  description: 'Estimate UK import duty and VAT for any commodity code. Uses GOV.UK Trade Tariff data. Free calculator with REST API.',
  alternates: { canonical: 'https://www.freightutils.com/duty' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'UK Import Duty & VAT Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function DutyPage() {
  return (
    <>
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          UK Import Duty & VAT <span style={{ color: '#e87722' }}>Estimator</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 580, margin: '0 auto' }}>
          Estimate import duty and VAT for goods entering the United Kingdom. Uses live GOV.UK Trade Tariff data.
        </p>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>
          Source: GOV.UK Trade Tariff API (Open Government Licence v3)
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 48px' }}>
        <DutyCalc />

        <div style={{ maxWidth: 700, margin: '48px auto 0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            How UK import duty is calculated
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            UK customs duty is charged on the <strong>CIF value</strong> (Cost + Insurance + Freight) of imported goods. The duty rate depends on the commodity classification (HS/tariff code) and the country of origin. After duty is applied, <strong>VAT at 20%</strong> is charged on the combined CIF value plus duty amount.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            The UK has <strong>preferential trade agreements</strong> with many countries that reduce or eliminate duty. These require proof of origin documentation. This calculator shows the standard third-country duty rate by default and flags when a preference may be available.
          </p>

          <details style={{ marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <summary style={{ padding: '14px 18px', fontSize: 15, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
              REST API — POST /api/duty
            </summary>
            <div style={{ padding: '0 18px 18px', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 8 }}>Send a POST request with commodity code, origin country, and value:</p>
              <pre style={{ background: 'var(--navy)', color: '#f9913a', padding: 14, borderRadius: 8, fontSize: 12, overflow: 'auto' }}>
{`curl -X POST "https://www.freightutils.com/api/duty" \\
  -H "Content-Type: application/json" \\
  -d '{"commodityCode": "6204430000", "originCountry": "CN",
       "customsValue": 10000, "freightCost": 500, "insuranceCost": 50,
       "incoterm": "FOB"}'`}
              </pre>
            </div>
          </details>
        </div>

        <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
          <RelatedTools tools={[
            { href: '/hs', label: 'HS Code Lookup' },
            { href: '/incoterms', label: 'INCOTERMS 2020' },
            { href: '/chargeable-weight', label: 'Chargeable Weight' },
          ]} />
        </div>

        <div style={{ maxWidth: 700, margin: '24px auto 0' }}>
          <ToolDisclaimer text="Estimate only. Not for customs declaration purposes. Duty rates from GOV.UK Trade Tariff API. Verify with HMRC or a licensed customs broker before import. Does not include anti-dumping duties, quotas, or seasonal rates." />
        </div>
      </div>
    </>
  );
}
