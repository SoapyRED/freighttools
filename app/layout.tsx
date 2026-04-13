import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import NavLinks from './components/NavLinks';
import SiteSearch from './components/SiteSearch';
import AnnounceBanner from './components/AnnounceBanner';
import BrandLogo from './components/BrandLogo';
import CookieConsent from './components/CookieConsent';
import ScrollToTop from './components/ScrollToTop';
import HydrationCheck from './components/HydrationCheck';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.freightutils.com'),
  title: {
    default: 'FreightUtils — Free Freight Calculators & APIs',
    template: '%s | FreightUtils.com',
  },
  description:
    'Free freight calculators with open REST APIs. Loading metres, CBM, chargeable weight, pallet fitting, and ADR dangerous goods lookup. No signup required.',
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'FreightUtils',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'FreightUtils — Free Freight Calculators & APIs' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/api/og'],
  },
};

const footerColumns = {
  calculators: [
    { href: '/ldm', label: 'LDM Calculator' },
    { href: '/cbm', label: 'CBM Calculator' },
    { href: '/chargeable-weight', label: 'Chargeable Weight' },
    { href: '/pallet', label: 'Pallet Fitting' },
    { href: '/containers', label: 'Container Capacity' },
    { href: '/convert', label: 'Unit Converter' },
    { href: '/consignment-calculator', label: 'Consignment Calculator' },
  ],
  reference: [
    { href: '/adr', label: 'ADR Dangerous Goods' },
    { href: '/airlines', label: 'Airline Codes' },
    { href: '/incoterms', label: 'INCOTERMS 2020' },
    { href: '/hs', label: 'HS Code Lookup' },
    { href: '/duty', label: 'UK Import Duty & VAT' },
    { href: '/unlocode', label: 'UN/LOCODE Lookup' },
    { href: '/uld', label: 'ULD Types' },
    { href: '/vehicles', label: 'Vehicle Types' },
  ],
  guides: [
    { href: '/adr/lq-eq-checker', label: 'LQ/EQ Checker' },
    { href: '/adr/changes-2025', label: 'ADR 2025 Changes' },
    { href: '/adr/tunnel-codes', label: 'Tunnel Codes' },
    { href: '/adr/limited-quantities', label: 'Limited Quantities' },
    { href: '/adr/training-guide', label: 'ADR Training' },
  ],
  developers: [
    { href: '/api-docs', label: 'API Docs' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/changelog', label: 'Changelog' },
    { href: '/about', label: 'About' },
  ],
};

/* Inline script that runs before first paint to prevent dark mode flash */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.setAttribute('data-theme','dark')}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "FreightUtils",
      "url": "https://www.freightutils.com",
      "description": "Free freight calculators and dangerous goods reference data with open REST APIs"
    },
    {
      "@type": "Organization",
      "name": "FreightUtils",
      "url": "https://www.freightutils.com",
      "email": "contact@freightutils.com",
      "sameAs": [
        "https://x.com/FreightUtils",
        "https://www.linkedin.com/company/freightutils"
      ]
    }
  ]
}`
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>

        {/* Visible only when JS is disabled or blocked */}
        <noscript>
          <div style={{
            background: '#ef9f27',
            color: '#000',
            padding: '12px 20px',
            textAlign: 'center' as const,
            fontWeight: 700,
            fontSize: 14,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Interactive features require JavaScript. If calculators aren&apos;t responding, please check your browser settings or try a different network.
          </div>
          <style dangerouslySetInnerHTML={{ __html: '.fade-in-section { opacity: 1 !important; transform: none !important; }' }} />
        </noscript>

        {/* ── ANNOUNCEMENT BANNER ── */}
        <AnnounceBanner />

        {/* ── HEADER ── */}
        <header style={{
          background: 'var(--navy)',
          borderBottom: '2px solid #EF9F27',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{
            maxWidth: 1080,
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
          }}>
            {/* Brand */}
            <BrandLogo />

            {/* Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
              <SiteSearch />
              <NavLinks />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <ScrollToTop />
        <HydrationCheck />
        {children}

        {/* ── FOOTER ── */}
        <div className="footer-gradient-border" style={{ marginTop: 60 }} />
        <footer style={{
          background: 'var(--navy)',
          color: 'var(--text-faint)',
          padding: '40px 20px 32px',
        }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            {/* Column grid */}
            <div className="footer-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 32,
              marginBottom: 28,
            }}>
              {([
                { title: 'Calculators', links: footerColumns.calculators },
                { title: 'Reference', links: footerColumns.reference },
                { title: 'Guides', links: footerColumns.guides },
                { title: 'Developers', links: footerColumns.developers },
              ] as const).map(col => (
                <div key={col.title}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px', color: '#6b7280', marginBottom: 10,
                  }}>
                    {col.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {col.links.map(l => (
                      <Link key={l.href} href={l.href} className="footer-link" style={{
                        color: 'var(--text-faint)', textDecoration: 'none', fontSize: 13,
                      }}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Brand line */}
            <div style={{
              borderTop: '1px solid var(--navy-border)', paddingTop: 16,
              marginBottom: 8, fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.6,
            }}>
              Built by{' '}
              <a href="https://www.linkedin.com/in/marius-cristoiu-a853812a2/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Marius Cristoiu
              </a>, ADR-certified freight transport planner.{' '}
              <a href="mailto:contact@freightutils.com" style={{ color: '#EF9F27', textDecoration: 'underline' }}>
                contact@freightutils.com
              </a>
              {' '}
              <span style={{ display: 'inline-flex', gap: 10, verticalAlign: 'middle', marginLeft: 8 }}>
                <a href="https://x.com/FreightUtils" target="_blank" rel="noopener noreferrer" aria-label="FreightUtils on X" style={{ display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF9F27">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/freightutils" target="_blank" rel="noopener noreferrer" aria-label="FreightUtils on LinkedIn" style={{ display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF9F27">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </span>
            </div>

            {/* Legal line */}
            <div style={{
              fontSize: 12, color: 'var(--navy-border)', lineHeight: 1.6,
            }}>
              © 2026 FreightUtils.com · Reference tool only. Does not replace DGSA, customs broker, or carrier verification.
              {' · '}
              <Link href="/privacy" style={{ color: 'var(--navy-border)', textDecoration: 'underline' }}>Privacy</Link>
              {' · '}
              <Link href="/terms" style={{ color: 'var(--navy-border)', textDecoration: 'underline' }}>Terms</Link>
            </div>
          </div>
        </footer>

        {/* Vercel Analytics */}
        <Analytics />

        {/* Cookie consent — GDPR compliance */}
        <CookieConsent />
      </body>
    </html>
  );
}
