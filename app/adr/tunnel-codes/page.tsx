import type { Metadata } from 'next';
import Link from 'next/link';
import EmailCapture from '@/app/components/EmailCapture';

const ogUrl = '/api/og?title=ADR+Tunnel+Codes+Explained&desc=Restriction+categories+A+to+E+for+dangerous+goods+road+transport';

export const metadata: Metadata = {
  title: 'ADR Tunnel Codes Explained — Restriction Categories A to E | FreightUtils',
  description:
    'Complete guide to ADR tunnel restriction codes A through E. Which dangerous goods classes are restricted, UK-specific tunnel rules (Dartford, Channel Tunnel, Tyne), and how to check tunnel codes using FreightUtils.',
  alternates: { canonical: 'https://www.freightutils.com/adr/tunnel-codes' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'ADR Tunnel Codes Explained' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function AdrTunnelCodesPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          ADR Tunnel Codes Explained — <span style={{ color: '#e87722' }}>Categories A to E</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 600, margin: '0 auto' }}>
          Understanding tunnel restriction codes is essential for planning dangerous goods routes through road tunnels across Europe and the UK.
        </p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>Last updated: March 2026</p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, fontSize: 13, color: '#8f9ab0' }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none' }}>FreightUtils</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <Link href="/adr" style={{ color: '#8f9ab0', textDecoration: 'none' }}>ADR Lookup</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#e87722' }}>Tunnel Codes</span>
        </nav>

        <article style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 0 }}>
            What Are Tunnel Restriction Codes?
          </h2>
          <p>
            ADR tunnel restriction codes determine whether a vehicle carrying dangerous goods is permitted to pass
            through a road tunnel. Tunnels present unique risks for dangerous goods incidents — confined space,
            limited ventilation, restricted evacuation routes, and the potential for catastrophic consequences
            from fires or toxic releases underground.
          </p>
          <p>
            Every road tunnel that applies dangerous goods restrictions is assigned a <strong>tunnel category</strong> (A through E),
            and every dangerous goods entry in the ADR list has a corresponding <strong>tunnel restriction code</strong> that
            determines which tunnel categories it may or may not pass through.
          </p>
          <p>
            You can see the tunnel restriction code for any UN number in the{' '}
            <Link href="/adr" style={{ color: '#e87722', textDecoration: 'underline' }}>ADR dangerous goods lookup</Link>.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            The Five Tunnel Categories
          </h2>
          <p>
            Tunnels are classified into five categories based on the level of restriction they impose. Category A
            is the least restrictive and Category E is the most restrictive:
          </p>

          <div style={{ marginTop: 16, marginBottom: 24 }}>
            {[
              {
                code: 'A',
                bg: '#dcfce7', border: '#86efac', text: '#166534',
                title: 'Category A — No Restrictions',
                desc: 'No restrictions on the transport of dangerous goods beyond the general ADR provisions. Most motorway tunnels and short tunnels fall into this category.',
              },
              {
                code: 'B',
                bg: '#dbeafe', border: '#93c5fd', text: '#1e40af',
                title: 'Category B — Restricted',
                desc: 'Restricts dangerous goods that could lead to a very large explosion. Affected: Class 1 goods in large quantities, certain explosives precursors, and some self-reactive substances.',
              },
              {
                code: 'C',
                bg: '#fef9c3', border: '#fde047', text: '#854d0e',
                title: 'Category C — More Restricted',
                desc: 'Restricts goods that could lead to a very large explosion, a large explosion, or a large toxic release. Includes all Category B restrictions plus certain toxic gases, flammable liquids in tanks, and toxic liquids.',
              },
              {
                code: 'D',
                bg: '#ffedd5', border: '#fdba74', text: '#9a3412',
                title: 'Category D — Highly Restricted',
                desc: 'Restricts goods that could lead to a very large explosion, a large explosion, a large toxic release, or a large fire. In addition to Category C restrictions, this includes most flammable liquids and flammable gases in significant quantities.',
              },
              {
                code: 'E',
                bg: '#fee2e2', border: '#fca5a5', text: '#991b1b',
                title: 'Category E — Most Restricted',
                desc: 'Restricts all dangerous goods other than those carried under exemptions (e.g., 1.1.3.6 small quantities, limited quantities, or excepted quantities). Essentially, only fully exempt loads may pass through Category E tunnels.',
              },
            ].map(cat => (
              <div key={cat.code} style={{
                background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: 10,
                padding: '16px 20px', marginBottom: 12, color: cat.text,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{cat.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{cat.desc}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            How Tunnel Codes Appear in the ADR List
          </h2>
          <p>
            In Table A of the ADR dangerous goods list (Column 15), each entry has a tunnel restriction code.
            These codes use the format of the letter(s) of the tunnel categories where the goods are restricted,
            sometimes with additional qualifiers in parentheses:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li><strong>(B)</strong> — Passage prohibited through Category B, C, D, and E tunnels</li>
            <li><strong>(B/D)</strong> — Prohibited through B, C, D, E tunnels when carried in tanks; prohibited through D, E tunnels in other cases</li>
            <li><strong>(B/E)</strong> — Prohibited through B, C, D, E tunnels when carried in tanks; prohibited through E tunnels in other cases</li>
            <li><strong>(C)</strong> — Prohibited through C, D, and E tunnels</li>
            <li><strong>(C/D)</strong> — Prohibited through C, D, E tunnels when in tanks; prohibited through D, E tunnels otherwise</li>
            <li><strong>(C/E)</strong> — Prohibited through C, D, E tunnels when in tanks; prohibited through E tunnels otherwise</li>
            <li><strong>(D)</strong> — Prohibited through D and E tunnels</li>
            <li><strong>(D/E)</strong> — Prohibited through D, E tunnels when in tanks; prohibited through E tunnels otherwise</li>
            <li><strong>(E)</strong> — Prohibited through E tunnels only</li>
            <li><strong>(—)</strong> — No tunnel restriction</li>
          </ul>
          <p>
            The slash notation (e.g., B/D) indicates different restrictions depending on whether goods are in
            bulk/tank or in packages. The first letter applies to tank transport; the second to packaged goods.
          </p>
          <div className="warning-badge info" style={{ marginTop: 16 }}>
            <span style={{ fontSize: 16 }}>&#8505;</span>
            <div>
              <strong>Note:</strong> The tunnel restriction code shown in the ADR dangerous goods list (e.g., &apos;D/E&apos;
              or &apos;B1000C&apos;) is not the same as the tunnel category (A through E). The restriction code determines
              which tunnel categories the goods are prohibited from. For example, a restriction code of &apos;(D/E)&apos;
              means the goods are prohibited from tunnels of category D and E.
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            UK-Specific Tunnel Restrictions
          </h2>
          <p>
            The UK has several major tunnels with dangerous goods restrictions. While the UK follows ADR tunnel
            categorisation, some tunnels have additional or specific rules:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>
              <strong>Dartford Crossing (Dartford Tunnel):</strong> Category E tunnel. Most dangerous goods loads must
              use the Queen Elizabeth II Bridge (eastbound). Westbound traffic through the tunnel has significant
              DG restrictions. Vehicles carrying dangerous goods must display appropriate orange plates and contact
              the tunnel operator.
            </li>
            <li>
              <strong>Channel Tunnel (Eurotunnel):</strong> Has its own comprehensive dangerous goods rules that go
              beyond standard ADR tunnel codes. A specific list of prohibited and restricted goods applies. Consignors
              must declare DG loads in advance, and certain classes (notably Class 1 and Class 7) are completely
              prohibited. Always check the current Eurotunnel dangerous goods policy before booking.
            </li>
            <li>
              <strong>Tyne Tunnel:</strong> Restrictions on dangerous goods transport, particularly for flammable
              liquids and gases. Category D applies to the older tunnel bore; check current restrictions for the
              new tunnel bore.
            </li>
          </ul>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            How to Check Tunnel Codes
          </h2>
          <p>
            Use the <Link href="/adr" style={{ color: '#e87722', textDecoration: 'underline' }}>FreightUtils ADR lookup</Link> to
            search any UN number and see its tunnel restriction code displayed on the detail page. The tunnel code
            is shown alongside the transport category, hazard class, and packing group.
          </p>
          <p>
            For mixed loads, you need to consider the tunnel codes for every item in the consignment. The most
            restrictive code applies to the whole vehicle. Use the{' '}
            <Link href="/adr-calculator" style={{ color: '#e87722', textDecoration: 'underline' }}>ADR 1.1.3.6 calculator</Link> to
            check whether your load qualifies for the small quantity exemption that permits passage through more
            restrictive tunnels.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Practical Tips for Route Planning
          </h2>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>Always check tunnel codes <strong>before</strong> planning a route, not after loading</li>
            <li>If a tunnel restricts your load, plan an alternative surface route in advance</li>
            <li>Night-time or weekend restrictions may apply — some tunnels only restrict DG during peak hours</li>
            <li>Mixed loads take the most restrictive tunnel code of all goods on board</li>
            <li>Exempted loads (1.1.3.6, LQ, EQ) can generally pass through all tunnel categories, but check local rules</li>
            <li>Keep tunnel restriction codes visible in your transport documentation</li>
          </ul>

          {/* Related tools */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
            padding: 24, marginTop: 36,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Related Tools
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link href="/adr" style={{ background: '#1a2332', color: '#EF9F27', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                ADR Lookup →
              </Link>
              <Link href="/adr-calculator" style={{ background: '#1a2332', color: '#EF9F27', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                1.1.3.6 Calculator →
              </Link>
              <Link href="/adr/changes-2025" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                ADR 2025 Changes →
              </Link>
              <Link href="/adr/limited-quantities" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Limited Quantities Guide →
              </Link>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 36, lineHeight: 1.6, fontStyle: 'italic' }}>
            ADR reference information only. Classification and compliance are the consignor&apos;s and carrier&apos;s
            legal responsibility. Always verify against the current ADR in force and consult a qualified DGSA where required.
          </p>

        </article>

        <EmailCapture />

      </main>
    </>
  );
}
