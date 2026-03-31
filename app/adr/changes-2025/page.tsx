import type { Metadata } from 'next';
import Link from 'next/link';

const ogUrl = '/api/og?title=ADR+2025+Changes&desc=Complete+summary+of+what+changed+in+ADR+2025';

export const metadata: Metadata = {
  title: 'ADR 2025: What Changed — Complete Summary | FreightUtils',
  description:
    'Full summary of ADR 2025 changes effective 1 January 2025. New UN numbers for sodium-ion batteries, updated waste transport provisions, mandatory LQ training from July 2025, and documentation changes.',
  alternates: { canonical: 'https://www.freightutils.com/adr/changes-2025' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'ADR 2025: What Changed' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function AdrChanges2025Page() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
          ADR 2025: What Changed — <span style={{ color: '#e87722' }}>Complete Summary</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 600, margin: '0 auto' }}>
          The ADR 2025 edition entered into force on 1 January 2025, with a mandatory transition date of 1 July 2025.
          Here is everything that changed.
        </p>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, fontSize: 13, color: '#8f9ab0' }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: '#8f9ab0', textDecoration: 'none' }}>FreightUtils</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <Link href="/adr" style={{ color: '#8f9ab0', textDecoration: 'none' }}>ADR Lookup</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#e87722' }}>ADR 2025 Changes</span>
        </nav>

        <article style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 0 }}>
            Transition Timeline
          </h2>
          <p>
            ADR 2025 is the latest edition of the European Agreement concerning the International Carriage of
            Dangerous Goods by Road. It was published by the United Nations Economic Commission for Europe (UNECE)
            and applies to all ADR contracting parties, including the UK (which continues to align with ADR through
            domestic regulation).
          </p>
          <p>
            The new edition entered into force on <strong>1 January 2025</strong>. During the transitional period,
            consignments could still be transported under ADR 2023 rules until <strong>30 June 2025</strong>.
            From <strong>1 July 2025</strong>, compliance with ADR 2025 is mandatory for all road transport of
            dangerous goods.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            New UN Numbers: Sodium-Ion Batteries
          </h2>
          <p>
            ADR 2025 introduces new UN numbers specifically for sodium-ion batteries, reflecting the rapid growth
            of this battery chemistry as an alternative to lithium-ion. The new entries are:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li><strong>UN 3551</strong> — Sodium-ion batteries</li>
            <li><strong>UN 3552</strong> — Sodium-ion batteries contained in equipment</li>
            <li><strong>UN 3558</strong> — Sodium-ion batteries packed with equipment</li>
          </ul>
          <p>
            These entries are classified as Class 9 miscellaneous dangerous goods, similar to their lithium-ion
            counterparts (UN 3480/3481). Sodium-ion batteries generally present lower thermal runaway risk than
            lithium-ion, but ADR still requires proper classification, packaging, and labelling.
            You can look up these new entries in the{' '}
            <Link href="/adr" style={{ color: '#e87722', textDecoration: 'underline' }}>ADR dangerous goods lookup</Link>.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Battery-Powered Vehicles
          </h2>
          <p>
            New UN numbers have been added for the transport of battery-powered vehicles and equipment:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li><strong>UN 3556</strong> — Vehicle, battery-powered</li>
            <li><strong>UN 3557</strong> — Vehicle, battery-powered (flammable gas or flammable liquid powered)</li>
          </ul>
          <p>
            These entries clarify the classification of electric vehicles being transported as cargo — an increasingly
            common scenario in logistics. The provisions address the hazards presented by large traction batteries
            installed in vehicles.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Waste Transport Provisions
          </h2>
          <p>
            ADR 2025 includes several new provisions for transporting waste materials:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>
              <strong>Waste paints and coatings:</strong> New special provision SP 650 allows simplified classification
              of waste paint and coating materials, reducing the burden on waste carriers who often transport mixed loads
              of unknown composition.
            </li>
            <li>
              <strong>Waste asbestos in bulk:</strong> Updated provisions for the carriage of waste asbestos in bulk
              containers, reflecting modern waste handling practices.
            </li>
            <li>
              <strong>Laboratory small quantities:</strong> New paragraph 4.1.1.5.3 provides packaging provisions
              for small quantities of dangerous goods from laboratory waste, acknowledging that labs generate diverse
              small-volume waste streams that need practical transport solutions.
            </li>
          </ul>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Documentation Changes
          </h2>
          <p>
            A significant practical change from July 2025: dangerous goods transport documents must now be kept
            <strong> in the driver&apos;s cab</strong>, not attached to packages or stored elsewhere in the vehicle.
            This ensures that in an emergency, first responders can immediately access the documentation identifying
            what dangerous goods are on board, without having to open cargo compartments.
          </p>
          <p>
            This change affects carriers, drivers, and consignors who prepare DG documentation. Ensure your
            procedures are updated to reflect this requirement.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Limited Quantities: Mandatory Training
          </h2>
          <p>
            From <strong>1 July 2025</strong>, all staff handling limited quantity (LQ) dangerous goods must have
            completed <strong>Chapter 1.3 awareness training</strong>. Previously, LQ shipments benefited from
            broad exemptions that often meant warehouse staff and drivers handling LQ goods received no formal
            dangerous goods training.
          </p>
          <p>
            This is a significant change for many businesses. LQ covers a huge range of everyday products — aerosols,
            perfumes, paint samples, cleaning chemicals, nail polish, and more. Any warehouse, distribution centre,
            or transport company handling these items must now ensure their staff are trained. Read more in our{' '}
            <Link href="/adr/limited-quantities" style={{ color: '#e87722', textDecoration: 'underline' }}>
              guide to ADR limited quantities
            </Link>.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Molten Aluminium & De-Energising Provisions
          </h2>
          <p>
            ADR 2025 includes updated provisions for the bulk transport of molten aluminium, addressing the
            specific hazards of transporting molten metal at extremely high temperatures. New requirements cover
            tank design, filling procedures, and emergency response.
          </p>
          <p>
            Additionally, new provisions address the de-energising of electrical circuits in vehicles and equipment
            being transported. This is particularly relevant when transporting hybrid or electric vehicles that
            have high-voltage battery systems that must be made safe before transport.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Other Notable Changes
          </h2>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>Updated tank code assignments for several UN numbers</li>
            <li>Revised special provisions affecting classification of articles containing dangerous goods</li>
            <li>Clarifications to the 1.1.3.6 exemption thresholds for mixed loads — check your loads with the{' '}
              <Link href="/adr-calculator" style={{ color: '#e87722', textDecoration: 'underline' }}>
                ADR 1.1.3.6 calculator
              </Link>
            </li>
            <li>Updated packing instructions for several Class 1 entries</li>
            <li>Amendments to Chapter 8.5 additional requirements for certain classes</li>
          </ul>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12, marginTop: 36 }}>
            Sources
          </h2>
          <p>
            This summary is compiled from the official UNECE ADR 2025 publication (ECE/TRANS/352), the Health
            and Safety Authority (Ireland) ADR 2025 overview, and BENS Consulting ADR 2025 technical briefings.
            For the full legal text, refer to the{' '}
            <a href="https://unece.org/transport/dangerous-goods/adr-2025" target="_blank" rel="noopener noreferrer" style={{ color: '#e87722', textDecoration: 'underline' }}>
              UNECE ADR 2025 publication
            </a>.
          </p>

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
              <Link href="/adr/tunnel-codes" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Tunnel Codes Guide →
              </Link>
              <Link href="/adr/limited-quantities" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Limited Quantities Guide →
              </Link>
            </div>
          </div>

        </article>

        {/* Email capture */}
        <div style={{
          background: '#1a2332', borderRadius: 12, padding: '24px 28px',
          marginTop: 40, textAlign: 'center',
        }}>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
            Get notified when ADR 2027 changes are published
          </p>
          <form action="mailto:contact@freightutils.com" method="GET" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              name="subject"
              placeholder="Enter your email"
              required
              style={{
                padding: '10px 16px', borderRadius: 8, border: '1px solid #374151',
                background: '#0f1724', color: '#fff', fontSize: 14, minWidth: 240,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#e87722', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Notify Me
            </button>
          </form>
          <p style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>
            No spam. One email when the next ADR edition is published.
          </p>
        </div>

      </main>
    </>
  );
}
