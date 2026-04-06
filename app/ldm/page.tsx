import type { Metadata } from 'next';
import LdmCalc from './LdmCalc';
import ErrorBoundary from '@/app/components/ErrorBoundary';

const ogUrl = '/api/og?title=Loading+Metres+Calculator&desc=Calculate+LDM+for+European+and+North+American+trailers&api=GET+/api/ldm';

export const metadata: Metadata = {
  title: 'Loading Metres Calculator — Free LDM Tool | FreightUtils',
  description:
    'Calculate loading metres (LDM) for road freight — European and North American trailer standards. Free calculator with Euro pallet presets, stackable options, weight warnings, and REST API.',
  alternates: { canonical: 'https://www.freightutils.com/ldm' },
  openGraph: {
    images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Loading Metres Calculator — FreightUtils' }],
  },
  twitter: { card: 'summary_large_image', images: [ogUrl] },
};

export default function LdmPage() {
  return <ErrorBoundary><LdmCalc /></ErrorBoundary>;
}
