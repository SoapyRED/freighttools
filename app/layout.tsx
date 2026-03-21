import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import NavLinks from './components/NavLinks';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.freightutils.com'),
  title: {
    default: 'FreightUtils — Free Freight Calculators & APIs',
    template: '%s | FreightUtils.com',
  },
  description:
    'Free freight calculators with open REST APIs. Loading metres, CBM, chargeable weight, pallet fitting, and ADR dangerous goods lookup. No signup required.',
  robots: 'index, follow',
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

const footerToolLinks = [
  { href: '/ldm', label: 'LDM Calculator' },
  { href: '/cbm', label: 'CBM Calculator' },
  { href: '/adr', label: 'ADR Lookup' },
  { href: '/adr-calculator', label: 'ADR Exemption Calc' },
  { href: '/chargeable-weight', label: 'Chargeable Weight' },
  { href: '/pallet', label: 'Pallet Fitting' },
  { href: '/airlines', label: 'Airline Codes' },
  { href: '/api-docs', label: 'API Docs' },
  { href: '/about', label: 'About' },
];

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
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3441075477232453"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>

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
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              textDecoration: 'none', color: '#fff', flexShrink: 0,
            }}>
              <div style={{
                width: 32, height: 32, background: '#EF9F27', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: '#412402',
              }}>
                /
              </div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                <span style={{ color: '#9CA3AF' }}>Freight</span><span style={{ color: '#EF9F27' }}>Utils</span>
                <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>.com</span>
              </span>
            </Link>

            {/* Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'auto' }}>
              <NavLinks />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {children}

        {/* ── FOOTER ── */}
        <footer style={{
          background: 'var(--navy)',
          color: 'var(--text-faint)',
          padding: '36px 20px 28px',
          marginTop: 60,
          borderTop: '2px solid var(--navy-border)',
        }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            {/* Top row: brand + nav */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 20,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 6 }}>
                  <span style={{ color: '#9CA3AF' }}>Freight</span><span style={{ color: '#EF9F27' }}>Utils</span>
                  <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>.com</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.6 }}>
                  Built by UK freight industry professionals.
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {footerToolLinks.map(l => (
                  <Link key={l.href} href={l.href} style={{
                    color: 'var(--text-faint)', textDecoration: 'none', fontSize: 13,
                  }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom row */}
            <div style={{
              fontSize: 12, color: 'var(--navy-border)',
              borderTop: '1px solid var(--navy-border)', paddingTop: 16, lineHeight: 1.6,
            }}>
              © 2026 FreightUtils.com. All figures are indicative. Always confirm specifications with your carrier.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
