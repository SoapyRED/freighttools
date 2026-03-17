import type { Metadata } from 'next';
import LdmCalc from './LdmCalc';

export const metadata: Metadata = {
  title: 'Loading Metres Calculator — Free LDM Tool for UK Freight',
  description:
    'Calculate loading metres (LDM) instantly for UK road freight. Free tool with Euro pallet presets, UK vehicle types, stackable options, and weight warnings.',
  alternates: { canonical: 'https://freightutils.com/ldm' },
};

export default function LdmPage() {
  return <LdmCalc />;
}
