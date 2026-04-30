import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * Temporary diagnostic route — Sentry hardening sprint round-trip verify.
 *
 * Removed in the next commit once the event has been confirmed in Sentry
 * with (a) a symbolicated stack frame and (b) PII redaction on the
 * fu_live_* / cus_* / sub_* substrings injected into the error message.
 *
 * Gated by a query secret so casual visitors can't spam Sentry with
 * synthetic errors during the live window.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const expected = process.env.SENTRY_TEST_SECRET ?? 'sprint-verify';
  if (url.searchParams.get('secret') !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const fakeKey = 'fu_live_smoketestabc123def456';
  const fakeStripeCustomer = 'cus_QSmokeTest123';
  const fakeStripeSub = 'sub_OrSmoke9TEST';

  const err = new Error(
    `Deliberate Sentry hardening test — key ${fakeKey} customer ${fakeStripeCustomer} subscription ${fakeStripeSub}`,
  );

  Sentry.captureException(err);
  await Sentry.flush(2000);

  return NextResponse.json(
    { ok: true, captured: 'error sent to Sentry; check beforeSend redaction' },
    { status: 200 },
  );
}
