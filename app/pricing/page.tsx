import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/app/components/PageHero';

export const metadata: Metadata = {
  title: 'Pricing — Free & Pro API Plans',
  description: 'Free freight calculation API with 25 requests/day. Pro plan: £19/month for 50,000 requests, priority support, and all 19 endpoints. No contracts.',
  alternates: { canonical: 'https://www.freightutils.com/pricing' },
};

const tiers = [
  {
    name: 'Free',
    subtitle: 'Anonymous',
    price: '£0',
    period: 'forever',
    highlight: false,
    features: [
      '25 requests/day',
      'All 19 endpoints',
      'No signup required',
      'JSON + CORS',
      'Community support',
    ],
    cta: 'Start Using →',
    ctaHref: '/api-docs',
    ctaStyle: 'outline' as const,
  },
  {
    name: 'Free',
    subtitle: 'API Key',
    price: '£0',
    period: 'forever',
    highlight: true,
    badge: 'Recommended',
    features: [
      '100 requests/day',
      'All 19 endpoints',
      'Email support',
      'Usage tracking',
      'MCP server access',
    ],
    cta: 'Get Free Key →',
    ctaHref: '/api-docs#signup',
    ctaStyle: 'filled' as const,
  },
  {
    name: 'Pro',
    subtitle: '',
    price: '£19',
    period: '/month',
    highlight: false,
    features: [
      '50,000 requests/month',
      'All 19 endpoints',
      'Priority email support',
      'Higher rate limits',
      'No contracts',
    ],
    cta: 'Subscribe →',
    ctaHref: 'mailto:contact@freightutils.com?subject=Pro%20API%20Key%20%E2%80%94%20FreightUtils&body=I%27d%20like%20to%20subscribe%20to%20FreightUtils%20Pro.%20My%20use%20case%3A%20%5Bplease%20describe%20briefly%5D',
    ctaStyle: 'outline' as const,
    ctaNote: "We'll set up your Pro key within 24 hours",
  },
];

const allPlansInclude = [
  'CORS enabled for all origins',
  'JSON responses on every endpoint',
  'OpenAPI 3.0 spec included',
  'Postman collection available',
  'MCP server for AI agents',
  'No contracts or minimum term',
];

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Is the FreightUtils API really free?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Anonymous access gives you 25 requests/day with no signup. Register a free API key for 100 requests/day — no credit card required.' },
            },
            {
              '@type': 'Question',
              name: 'What happens if I exceed my API rate limit?',
              acceptedAnswer: { '@type': 'Answer', text: "You'll receive a 429 response with a message about upgrading. Your access resumes the next day (or next month for Pro). No data is lost." },
            },
            {
              '@type': 'Question',
              name: 'Can I cancel the Pro plan anytime?',
              acceptedAnswer: { '@type': 'Answer', text: "Yes. No contracts, no minimum term. Cancel anytime and you'll keep access until the end of your billing period." },
            },
            {
              '@type': 'Question',
              name: 'Do you offer enterprise API plans?',
              acceptedAnswer: { '@type': 'Answer', text: 'For custom rate limits, SLA requirements, or dedicated support, email contact@freightutils.com.' },
            },
          ],
        }) }}
      />

      <PageHero
        title="API"
        titleAccent="Pricing"
        subtitle="Simple, transparent pricing. Start free — upgrade when you need more."
      />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Tier cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 56,
        }} className="pricing-grid">
          {tiers.map(tier => (
            <div
              key={tier.name + tier.subtitle}
              className={`pricing-card${tier.highlight ? ' pricing-card--recommended' : ''}`}
              tabIndex={0}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {tier.badge && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent)',
                  color: '#000',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 16px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {tier.badge}
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                  {tier.name}
                  {tier.subtitle && (
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {tier.subtitle}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: tier.highlight ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>
                    {tier.price}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {tier.period}
                  </span>
                </div>
              </div>

              <ul style={{
                listStyle: 'none', padding: 0, margin: '0 0 24px',
                display: 'flex', flexDirection: 'column', gap: 10, flex: 1,
              }}>
                {tier.features.map(f => (
                  <li key={f} style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent)', fontSize: 14, lineHeight: '20px', flexShrink: 0 }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>

              {tier.ctaHref.startsWith('mailto:') ? (
                <a href={tier.ctaHref} className="pricing-card__cta" style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                  ...(tier.ctaStyle === 'filled'
                    ? { background: 'var(--accent)', color: '#000', border: 'none' }
                    : { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }),
                }}>
                  {tier.cta}
                </a>
              ) : (
                <Link href={tier.ctaHref} className="pricing-card__cta" style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                  ...(tier.ctaStyle === 'filled'
                    ? { background: 'var(--accent)', color: '#000', border: 'none' }
                    : { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }),
                }}>
                  {tier.cta}
                </Link>
              )}

              {'ctaNote' in tier && tier.ctaNote && (
                <div style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', marginTop: 8 }}>
                  {tier.ctaNote}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* All plans include */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '28px 32px',
          marginBottom: 48,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 16,
          }}>
            All plans include
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 10,
          }}>
            {allPlansInclude.map(item => (
              <div key={item} style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>&#10003;</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* What people build */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
            What people build with FreightUtils
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              {
                title: 'TMS Integration',
                desc: 'Freight forwarders embed LDM and chargeable weight calculations directly into their transport management systems. One API call replaces manual spreadsheet work.',
              },
              {
                title: 'DG Compliance Checks',
                desc: 'Logistics companies automate ADR 1.1.3.6 exemption checks before dispatch. The API validates mixed loads in seconds instead of minutes with the ADR book.',
              },
              {
                title: 'AI Agent Workflows',
                desc: 'Developers connect the MCP server to Claude, GPT, and other AI agents for freight planning automation. The only freight-native MCP server available.',
              },
            ].map(c => (
              <div key={c.title} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '24px 20px',
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
            Frequently Asked Questions
          </h2>
          {[
            { q: 'Is the API really free?', a: 'Yes. Anonymous access gives you 25 requests/day with no signup. Register a free API key for 100 requests/day — no credit card required.' },
            { q: 'What happens if I exceed my limit?', a: "You'll receive a 429 response with a message about upgrading. Your access resumes the next day (or next month for Pro). No data is lost." },
            { q: 'Can I cancel Pro anytime?', a: "Yes. No contracts, no minimum term. Cancel anytime and you'll keep access until the end of your billing period." },
            { q: 'Do you offer enterprise plans?', a: 'For custom rate limits, SLA requirements, or dedicated support, email contact@freightutils.com.' },
          ].map(faq => (
            <details key={faq.q} className="faq-item" style={{ marginBottom: 8 }}>
              <summary>{faq.q}</summary>
              <div className="faq-answer">{faq.a}</div>
            </details>
          ))}
        </div>

        {/* Contact */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Questions?
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Email{' '}
            <a href="mailto:contact@freightutils.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              contact@freightutils.com
            </a>
            {' '}&mdash; we typically reply within 1 business day.
          </div>
        </div>

      </main>

      <style>{`
        @media (max-width: 768px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
