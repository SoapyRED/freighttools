import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  robots: 'noindex, follow',
};

export default function AdrCalculatorRedirect() {
  redirect('/adr');
}
