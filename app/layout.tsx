import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://freighttools.co.uk'),
  title: {
    default: 'FreightTools — Free UK Freight Calculators',
    template: '%s | FreightTools.co.uk',
  },
  description: 'Free freight tools for UK logistics professionals — LDM calculator, CBM calculator, ADR lookup and more.',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Outfit', sans-serif", background: '#f7f8fa', margin: 0 }}>
        <header style={{
          background: '#1a2332',
          borderBottom: '2px solid #e87722',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff' }}>
              <div style={{
                width: 32, height: 32, background: '#e87722', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14, color: '#fff',
              }}>FT</div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                Freight<span style={{ color: '#e87722' }}>Tools</span>.co.uk
              </span>
            </Link>
            <nav style={{ display: 'flex', gap: 4 }}>
              <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none', fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 6 }}>
                LDM Calc
              </Link>
              <Link href="/api-docs" style={{ color: '#8f9ab0', textDecoration: 'none', fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 6 }}>
                API Docs
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer style={{ background: '#1a2332', color: '#8f9ab0', padding: '32px 20px', marginTop: 60, borderTop: '2px solid #2e3d55' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>
                Freight<span style={{ color: '#e87722' }}>Tools</span>.co.uk
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none', fontSize: 13 }}>LDM Calculator</Link>
                <Link href="/api-docs" style={{ color: '#8f9ab0', textDecoration: 'none', fontSize: 13 }}>API Docs</Link>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#2e3d55', borderTop: '1px solid #2e3d55', paddingTop: 16, lineHeight: 1.6 }}>
              © {new Date().getFullYear()} FreightTools.co.uk. All figures are indicative. Always confirm vehicle specifications and weight limits with your carrier before booking.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
