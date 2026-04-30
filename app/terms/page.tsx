import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'FreightUtils terms of service — tools and data provided for informational purposes only.',
  alternates: { canonical: 'https://www.freightutils.com/terms' },
  robots: 'noindex, follow',
};

const h2 = { fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800 as const, color: 'var(--text)', margin: '36px 0 12px', letterSpacing: '-0.3px' };
const p = { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 };

export default function TermsPage() {
  return (
    <>
      <div style={{ background: 'var(--bg-hero)', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 8 }}>Last updated: May 2026</p>
      </div>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '32px 20px 80px' }}>

        <h2 style={h2}>Acceptance of Terms</h2>
        <p style={p}>
          By accessing and using FreightUtils (<a href="https://www.freightutils.com" style={{ color: '#e87722' }}>www.freightutils.com</a>), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the site.
        </p>

        <h2 style={h2}>Informational Purposes Only</h2>
        <p style={p}>
          All tools, calculators, data, and information provided on FreightUtils are for <strong>informational and reference purposes only</strong>. While we strive to ensure accuracy, no guarantee is made that the information is complete, current, or free from error.
        </p>
        <p style={p}>
          Calculations, conversion results, and reference data should be <strong>independently verified</strong> before use in any commercial, regulatory, or operational context. Do not rely solely on FreightUtils output for business decisions, customs declarations, or compliance purposes.
        </p>

        <h2 style={h2}>Data Accuracy &mdash; Safety-Critical Domains</h2>
        <p style={p}>
          FreightUtils data is best-effort and provided as a reference only. It is not legal, regulatory, or compliance advice. Users are responsible for verifying outputs against authoritative sources before acting on them. We accept no liability for decisions made based on FreightUtils data, particularly for safety-critical domains including <strong>ADR dangerous goods</strong>, <strong>HS code classification</strong>, <strong>customs duty calculation</strong>, and <strong>VAT determination</strong>.
        </p>

        <h2 style={h2}>Data Sources</h2>
        <p style={p}>
          FreightUtils sources data from official standards bodies and public domain datasets including UNECE (ADR 2025 dangerous goods), ISO (container and pallet standards), ICC (INCOTERMS 2020), IATA (air freight standards), and UN Comtrade (Harmonized System HS 2022). While these sources are authoritative, FreightUtils is not affiliated with or endorsed by any of these organisations.
        </p>
        <p style={p}>
          Data may not reflect the most recent amendments, corrections, or national variations. Always consult the original source publication and your relevant national authority for definitive information.
        </p>

        <h2 style={h2}>ADR Dangerous Goods Disclaimer</h2>
        <p style={p}>
          The ADR dangerous goods lookup is a <strong>reference aid only</strong>. It is not a substitute for the full text of the ADR agreement, and should not be used as the sole basis for classification, packaging, labelling, or routing decisions. Operational decisions involving dangerous goods must be made in consultation with the full ADR regulations and, where required, a qualified <strong>Dangerous Goods Safety Adviser (DGSA)</strong> as mandated by ADR Chapter 1.8.3.
        </p>

        <h2 style={h2}>HS Code Disclaimer</h2>
        <p style={p}>
          The HS code lookup provides the internationally harmonised 6-digit Harmonized System classification maintained by the World Customs Organization (WCO). This is a <strong>reference tool only</strong> and does not constitute an official tariff classification. For binding tariff information, duty rates, and national tariff extensions (e.g., UK 10-digit commodity codes, US HTS 10-digit codes, EU 8-digit CN codes), consult your national customs authority.
        </p>

        <h2 style={h2}>No Warranty</h2>
        <p style={p}>
          FreightUtils is provided <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as available&rdquo;</strong> without any warranty of any kind, whether express, implied, or statutory. We disclaim all warranties including, without limitation, warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement.
        </p>

        <h2 style={h2}>Limitation of Liability</h2>
        <p style={p}>
          To the fullest extent permitted by law, FreightUtils and its operators shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or in connection with the use of, or inability to use, this site or its tools. This includes, without limitation, damages arising from incorrect calculations, misclassification of goods, customs delays, duty miscalculations, or any other decisions made based on information provided by FreightUtils.
        </p>
        <p style={p}>
          Where liability cannot be excluded under applicable law, our total aggregate liability to you in connection with FreightUtils &mdash; whether in contract, tort, or otherwise &mdash; is capped at the total fees you have paid us in the twelve months preceding the event giving rise to the claim. For users on the Free tier this cap is <strong>&pound;0</strong>. For Pro subscribers this cap will not exceed <strong>&pound;228</strong> (twelve monthly subscriptions at &pound;19/month).
        </p>

        <h2 style={h2}>UK Consumer Law &mdash; Cooling-Off and Cancellation</h2>
        <p style={p}>
          Pro subscriptions are digital services that begin delivery immediately on payment. By starting to use the API after subscribing (sending any request with your Pro-tier API key), you waive the 14-day cooling-off period normally provided under UK consumer law for digital services. This is standard practice for instantly-delivered digital services and is disclosed both at checkout (via the Stripe payment page) and on our{' '}
          <a href="/refund-policy" style={{ color: '#e87722' }}>refund policy</a> page.
        </p>
        <p style={p}>
          You can cancel your Pro subscription at any time. Full cancellation, refund, and pro-rata terms are at{' '}
          <a href="/refund-policy" style={{ color: '#e87722' }}>/refund-policy</a>.
        </p>

        <h2 style={h2}>API Terms</h2>
        <p style={p}>
          The FreightUtils REST API is available on three tiers: <strong>Anonymous</strong> (25 requests/day, no signup), <strong>Free with API key</strong> (100 requests/day, email signup), and <strong>Pro</strong> (50,000 requests/month, &pound;19/month). Free tiers have <strong>no service level agreement (SLA)</strong> and no guarantee of uptime or availability. Pro subscriptions include best-effort priority support but no contractual SLA.
        </p>
        <p style={p}>
          We reserve the right to modify rate limits, response formats, or endpoint availability. Material changes affecting Pro subscribers will be notified by email at least 30 days before they take effect. Excessive or abusive usage on any tier may result in temporary or permanent blocking.
        </p>

        <h2 style={h2}>Data Processing</h2>
        <p style={p}>
          For data processing relating to API key signups and Pro subscriptions, see our{' '}
          <a href="/privacy" style={{ color: '#e87722' }}>privacy policy</a> and{' '}
          <a href="/dpa" style={{ color: '#e87722' }}>data processing agreement</a>.
        </p>

        <h2 style={h2}>Intellectual Property</h2>
        <p style={p}>
          ADR 2025 data: licensed from Labeline.com, sourced from the official UNECE ADR publication. HS 2022 data: UN Comtrade dataset, published under the Public Domain Dedication and License (PDDL). Airline data: compiled from public IATA/ICAO sources. INCOTERMS 2020: referenced from ICC official publications and trade.gov guidance. Container and pallet specifications: based on ISO 668, ISO 1496, ISO 6780, and EPAL published standards. Site design, code, and original content: &copy; 2026 FreightUtils.com.
        </p>

        <h2 style={h2}>Changes to Terms</h2>
        <p style={p}>
          We may update these Terms of Service at any time. Changes will be posted on this page with an updated revision date. Continued use of FreightUtils after changes constitutes acceptance of the revised terms.
        </p>

        <h2 style={h2}>Governing Law</h2>
        <p style={p}>
          These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          For questions about these terms, contact us at{' '}
          <a href="mailto:contact@freightutils.com" style={{ color: '#e87722' }}>contact@freightutils.com</a>.
        </p>

      </main>
    </>
  );
}
