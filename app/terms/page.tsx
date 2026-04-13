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
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 8 }}>Last updated: April 2026</p>
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

        <h2 style={h2}>API Terms</h2>
        <p style={p}>
          The FreightUtils REST API is provided free of charge with no authentication required. There is <strong>no service level agreement (SLA)</strong> and no guarantee of uptime or availability. We reserve the right to introduce rate limiting, modify API response formats, or discontinue API endpoints at any time without prior notice.
        </p>
        <p style={p}>
          As a courtesy, please keep API requests under 100 per day per IP address. Excessive usage may result in temporary or permanent blocking.
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
