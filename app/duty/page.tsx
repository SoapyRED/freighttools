import ErrorBoundary from '@/app/components/ErrorBoundary';
import type { Metadata } from 'next';
import { breadcrumbSchema } from '@/lib/schema/breadcrumbs';
import DutyCalc from './DutyCalc';
import RelatedTools from '@/app/components/RelatedTools';
import ToolDisclaimer from '@/app/components/ToolDisclaimer';
import PageHero from '@/app/components/PageHero';
import ApiCallout from '@/app/components/ApiCallout';
import NewsletterCapture from '@/app/components/NewsletterCapture';

const ogUrl = '/api/og?title=UK+Import+Duty+Calculator&desc=Estimate+duty+and+VAT+for+UK+imports&api=POST+/api/duty';

export const metadata: Metadata = {
  title: 'UK Import Duty & VAT Calculator',
  description: 'Estimate UK import duty, VAT and total landed cost for any commodity code. Live GOV.UK tariff data, preference rates. Free tool with REST API.',
  alternates: { canonical: 'https://www.freightutils.com/duty' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'UK Import Duty & VAT Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function DutyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema([{ name: 'UK Import Duty & VAT', path: '/duty' }]) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"UK Import Duty & VAT Calculator","description":"Free UK Import Duty & VAT Calculator. Estimate duty and VAT for any commodity code using GOV.UK Trade Tariff data. REST API available.","url":"https://www.freightutils.com/duty","applicationCategory":"UtilityApplication","operatingSystem":"All","offers":{"@type":"Offer","price":"0","priceCurrency":"GBP"},"author":{"@type":"Person","name":"Marius Cristoiu","url":"https://www.linkedin.com/in/marius-cristoiu-a853812a2/"}}) }} />
      <PageHero title="UK Import Duty &" titleAccent="VAT" subtitle="Estimate import duty and VAT for any commodity code using live GOV.UK Trade Tariff data" differentiators={['Live GOV.UK tariff data', 'Preferential rates', 'Free API']} category="customs">
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>
          Source: GOV.UK Trade Tariff API (Open Government Licence v3)
        </div>
      </PageHero>

      <div data-category="customs" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 48px' }}>
        <ErrorBoundary><DutyCalc /></ErrorBoundary>

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

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            Understanding CIF value
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            HMRC calculates duty on the <strong>CIF value</strong> of your goods &mdash; the cost of the goods plus insurance and freight to the UK port of entry. If you&apos;re buying on an EXW or FOB basis, you need to add the freight and insurance costs to arrive at the CIF value. If the price already includes delivery (CIF, CIP, DAP, DDP terms), the customs value is typically the invoice value. Getting this wrong is one of the most common causes of unexpected duty bills.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            How duty rates are determined
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            The UK Global Tariff replaced the EU Common External Tariff after Brexit. Duty rates depend on two factors: the <strong>commodity code</strong> (a 10-digit classification that identifies exactly what you&apos;re importing) and the <strong>country of origin</strong> (where the goods were manufactured, not where they were shipped from). Electronics like laptops (8471) are 0% duty under the Information Technology Agreement. Clothing (6204) carries 12% duty from most countries. Food products can have complex duty structures including specific duties (per kg) alongside ad valorem rates.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            Preferential trade agreements
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            The UK has free trade agreements with the EU (TCA), Japan (CEPA), Australia, New Zealand, Canada, South Korea, Singapore, Vietnam, and many others through the DCTS (Developing Countries Trading Scheme). These can reduce or eliminate duty entirely, but you need valid proof of origin documentation &mdash; typically a supplier&apos;s declaration or an origin statement on the invoice. Without proof of origin, the standard third-country duty rate applies even if an FTA exists.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            VAT on imports
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            Import VAT is charged at the UK standard rate of 20% on most goods (5% reduced rate on some items like children&apos;s car seats, 0% on certain foods, books, and children&apos;s clothing). The VAT is calculated on the CIF value <strong>plus</strong> the duty amount &mdash; so you pay VAT on the duty itself. VAT-registered businesses can reclaim import VAT on their VAT return, making the effective cost just the duty. The Postponed VAT Accounting (PVA) scheme allows UK VAT-registered importers to account for import VAT on their return without paying it at the border.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 10 }}>
            When to use this tool vs a customs broker
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
            This calculator gives you a reliable estimate for standard imports. Use it for budgeting, quoting landed costs to customers, or checking whether an import is commercially viable. For actual customs declarations, you should use a licensed customs broker or freight forwarder &mdash; they handle classification, preferential origin claims, trade remedies, and compliance requirements that go beyond a simple duty/VAT calculation. For complex goods (chemicals, dual-use items, food products), professional classification advice is essential. For official rates, check the{' '}
            <a href="https://www.trade-tariff.service.gov.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722', textDecoration: 'underline' }}>GOV.UK Trade Tariff</a> directly.
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
          <ApiCallout method="POST" endpoint="/api/duty" />
        </div>

        <div style={{ maxWidth: 700, margin: '24px auto 0' }}>
          <ToolDisclaimer text="Estimate only. Not for customs declaration purposes. Duty rates from GOV.UK Trade Tariff API. Verify with HMRC or a licensed customs broker before import. Does not include anti-dumping duties, quotas, or seasonal rates." />
        </div>

        <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
          <NewsletterCapture />
        </div>

        <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
          <RelatedTools tools={[
            { href: '/hs', label: 'HS Code Lookup' },
            { href: '/incoterms', label: 'INCOTERMS 2020' },
            { href: '/chargeable-weight', label: 'Chargeable Weight' },
          ]} />
        </div>
      </div>
    </>
  );
}
