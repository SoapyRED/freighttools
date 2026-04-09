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
  return <LdmCalc />;
}
