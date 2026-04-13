import type { Metadata } from 'next';
import LdmCalc from './LdmCalc';
import NewsletterCapture from '@/app/components/NewsletterCapture';

const ogUrl = '/api/og?title=Loading+Metres+Calculator&desc=Calculate+LDM+for+European+and+North+American+trailers&api=GET+/api/ldm';

export const metadata: Metadata = {
  title: 'Loading Metres Calculator — Free LDM Tool',
  description:
    'Calculate loading metres instantly — Euro pallets, UK standards, US trailers. Free LDM tool with groupage pricing examples. No signup needed.',
  alternates: { canonical: 'https://www.freightutils.com/ldm' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Loading Metres Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function LdmPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"Loading Metres Calculator","description":"Free Loading Metres Calculator. Calculate LDM for European and North American trailers with pallet presets and weight warnings. REST API available.","url":"https://www.freightutils.com/ldm","applicationCategory":"UtilityApplication","operatingSystem":"All","offers":{"@type":"Offer","price":"0","priceCurrency":"GBP"},"author":{"@type":"Person","name":"Marius Cristoiu","url":"https://www.linkedin.com/in/marius-cristoiu-a853812a2/"}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I calculate loading metres?","acceptedAnswer":{"@type":"Answer","text":"Loading metres are calculated using: LDM = (Length × Width × Quantity) ÷ Trailer Width. The trailer width is 2.4m for EU/UK or 2.59m for US/Canada. For a single Euro pallet: LDM = (1.2 × 0.8 × 1) ÷ 2.4 = 0.4 LDM."}},{"@type":"Question","name":"What is 1 LDM?","acceptedAnswer":{"@type":"Answer","text":"One loading metre represents a strip of trailer floor 1 metre long and 2.4 metres wide — the full internal width of a standard European trailer. About 2.5 Euro pallets side-by-side equal 1 LDM."}},{"@type":"Question","name":"How many Euro pallets fit in a 13.6m trailer?","acceptedAnswer":{"@type":"Answer","text":"A standard 13.6m trailer carries 33 Euro pallets in a single floor layer. Double-stacked: up to 66, subject to height and weight limits."}},{"@type":"Question","name":"What is the difference between LDM and CBM?","acceptedAnswer":{"@type":"Answer","text":"LDM measures floor space in a trailer (road freight). CBM measures total volume (air and sea freight). For European road freight, LDM is the standard pricing unit."}}]}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Calculate Loading Metres","step":[{"@type":"HowToStep","name":"Select pallet type","text":"Select your pallet type or enter custom dimensions"},{"@type":"HowToStep","name":"Enter quantity and weight","text":"Enter the number of pallets and weight per pallet"},{"@type":"HowToStep","name":"Set stackability","text":"Choose whether pallets are stackable"},{"@type":"HowToStep","name":"Select vehicle","text":"Select your vehicle type"},{"@type":"HowToStep","name":"Read results","text":"Read the loading metres result and vehicle utilisation"}]}) }} />
      <LdmCalc />
      <NewsletterCapture />
    </>
  );
}
