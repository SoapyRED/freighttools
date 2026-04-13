import type { Metadata } from 'next';
import LdmCalc from './LdmCalc';

const ogUrl = '/api/og?title=Loading+Metres+Calculator&desc=Calculate+LDM+for+European+and+North+American+trailers&api=GET+/api/ldm';

export const metadata: Metadata = {
  title: 'LDM Calculator — Loading Metres for Road Freight',
  description:
    'Calculate loading metres (LDM) for Euro and US trailers. Pallet presets, stackable loads, weight warnings. Instant results, free, no signup.',
  alternates: { canonical: 'https://www.freightutils.com/ldm' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Loading Metres Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function LdmPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How do I calculate loading metres?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Loading metres are calculated using: LDM = (Length x Width x Quantity) / Trailer Width, where Length and Width are in metres. The trailer width is 2.4m for EU/UK trailers (EN 283) or 2.59m for US/Canada 53ft/48ft trailers. For a single Euro pallet (1.2m x 0.8m): LDM = (1.2 x 0.8 x 1) / 2.4 = 0.4 LDM."
              }
            },
            {
              "@type": "Question",
              "name": "What is 1 LDM?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "One loading metre (1 LDM) represents a strip of trailer floor that is exactly 1 metre long and 2.4 metres wide — the full internal width of a standard European trailer. To put it in context: 2.5 Euro pallets side-by-side equal approximately 1 LDM."
              }
            },
            {
              "@type": "Question",
              "name": "How many Euro pallets fit in a 13.6m trailer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A standard 13.6m articulated trailer can carry 33 Euro pallets (1200 x 800mm) in a single floor layer. If double-stacked, up to 66 Euro pallets can be carried, subject to height and weight limits."
              }
            },
            {
              "@type": "Question",
              "name": "What is the difference between LDM and CBM?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "LDM (Loading Metres) measures the floor space a consignment occupies in a trailer — used for European road freight. CBM (Cubic Metres) measures total volume and is used in air and sea freight. For road freight across the UK and EU, LDM is the standard pricing unit."
              }
            }
          ]
        }) }}
      />
      <LdmCalc />
    </>
  );
}
