import type { Metadata } from 'next';
import LdmCalc from './LdmCalc';

const ogUrl = '/api/og?title=Loading+Metres+Calculator&desc=Calculate+LDM+for+UK+road+freight+trailers&api=GET+/api/ldm';

export const metadata: Metadata = {
  title: 'Loading Metres Calculator — Free LDM Tool for UK Freight',
  description:
    'Calculate loading metres (LDM) instantly for UK road freight. Free tool with Euro pallet presets, UK vehicle types, stackable options, and weight warnings.',
  alternates: { canonical: 'https://freightutils.com/ldm' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Loading Metres Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function LdmPage() {
  return <LdmCalc />;
}
