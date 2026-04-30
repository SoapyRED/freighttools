import { NextResponse } from 'next/server';

/**
 * Temporary diagnostic route used by the Sentry hardening sprint to verify
 * symbolication + beforeSend redaction round-trip on prod.
 *
 * Will be removed in the next commit once the round-trip event has been
 * verified in Sentry. Gated by a query secret so a casual visitor can't
 * spam Sentry with synthetic errors.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const expected = process.env.SENTRY_TEST_SECRET ?? 'sprint-verify';
  if (url.searchParams.get('secret') !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Inject PII patterns into the thrown error so we can verify the
  // beforeSend redactor strips them before the event leaves Vercel.
  const fakeKey = 'fu_live_smoketestabc123def456';
  const fakeStripeCustomer = 'cus_QSmokeTest123';
  const fakeStripeSub = 'sub_OrSmoke9TEST';

  throw new Error(
    `Deliberate Sentry hardening test — key ${fakeKey} customer ${fakeStripeCustomer} subscription ${fakeStripeSub}`,
  );
}
