#!/usr/bin/env node
/**
 * Smoke test for lib/sentry-redact.ts.
 *
 * Constructs Sentry-shaped events with every PII pattern the redactor is
 * supposed to handle, runs them through `redactSentryEvent`, asserts that
 * the originals are gone and the redacted markers are present.
 *
 * Run with: node --experimental-strip-types --no-warnings scripts/sentry-redact-smoke.mjs
 * (Same pattern as lint:seo-titles. Hooked into `npm run lint`.)
 */

import { redactSentryEvent } from '../lib/sentry-redact.ts';

let failed = 0;
function assert(cond, label, detail) {
  if (cond) {
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}\n     ${detail ?? ''}`);
  }
}

// ── Test 1: user.email + ip_address scrubbed (UK GDPR Art 32)
{
  const e = redactSentryEvent({
    user: { email: 'mcristoiu@gmail.com', ip_address: '203.0.113.45', id: 'abc', username: 'mc' },
  });
  assert(e.user.email === '[redacted]', 'user.email redacted', `got: ${e.user.email}`);
  assert(e.user.ip_address === null, 'user.ip_address nulled', `got: ${e.user.ip_address}`);
  assert(e.user.username === '[redacted]', 'user.username redacted');
  assert(e.user.id === 'abc', 'user.id preserved (not PII)');
}

// ── Test 2: fu_live_/fu_test_ substrings in message + exception
{
  const e = redactSentryEvent({
    message: 'Auth failed for fu_live_abc123def456ghi789 — tier=pro',
    exception: { values: [{ value: 'Bearer fu_test_xyz789 was rejected' }] },
  });
  assert(!e.message.includes('fu_live_abc123def456ghi789'), 'fu_live_* removed from message', e.message);
  assert(e.message.includes('fu_live_[redacted]'), 'fu_live_[redacted] marker in message', e.message);
  assert(e.exception.values[0].value.includes('fu_test_[redacted]'), 'fu_test_[redacted] marker in exception');
}

// ── Test 3: Stripe IDs collapsed
{
  const e = redactSentryEvent({
    message: 'Customer cus_QabcDEFghi failed payment pi_3M4XYZ for sub_OrCD9test',
    exception: { values: [{ value: 'Charge ch_3LpAbcXyz refunded; invoice in_1MnoPqr' }] },
  });
  assert(e.message.includes('cus_[redacted]'), 'cus_ → cus_[redacted]');
  assert(e.message.includes('sub_[redacted]'), 'sub_ → sub_[redacted]');
  assert(e.message.includes('pi_[redacted]'), 'pi_ → pi_[redacted]');
  assert(e.exception.values[0].value.includes('ch_[redacted]'), 'ch_ → ch_[redacted]');
  assert(e.exception.values[0].value.includes('in_[redacted]'), 'in_ → in_[redacted]');
  assert(!e.message.includes('cus_QabcDEFghi'), 'original cus_ id removed', e.message);
}

// ── Test 4: Authorization + Cookie headers dropped
{
  const e = redactSentryEvent({
    request: {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer fu_live_xyz',
        Cookie: 'session=abc',
      },
    },
  });
  assert(!('Authorization' in e.request.headers), 'Authorization header deleted');
  assert(!('Cookie' in e.request.headers), 'Cookie header deleted');
  assert(e.request.headers['Content-Type'] === 'application/json', 'non-sensitive header preserved');
}

// ── Test 5: query_string + cookies wiped, URL truncated
{
  const e = redactSentryEvent({
    request: {
      url: 'https://example.com/api/x?api_key=fu_live_xyz',
      query_string: 'api_key=fu_live_xyz',
      cookies: 'session=abc',
    },
  });
  assert(e.request.url === 'https://example.com/api/x', 'query string truncated from URL', e.request.url);
  assert(e.request.query_string === undefined, 'query_string undefined');
  assert(e.request.cookies === undefined, 'cookies undefined');
}

// ── Test 6: nested extra/contexts walked, key-based + substring-based both fire
{
  const e = redactSentryEvent({
    extra: {
      user_email: 'a@b.com',
      api_key: 'fu_live_xyz',
      nested: { token: 'sk_live_x', message: 'Charged cus_AbcDEF' },
    },
    contexts: { stripe: { customer: 'cus_QabcDEF', note: 'pi_3M4XYZ failed' } },
  });
  assert(e.extra.api_key === '[REDACTED]', 'extra.api_key redacted by key name');
  assert(e.extra.nested.token === '[REDACTED]', 'nested token redacted by key name');
  assert(e.extra.nested.message.includes('cus_[redacted]'), 'string-value Stripe ID redacted by substring');
  assert(e.contexts.stripe.customer.includes('cus_[redacted]'), 'contexts.stripe.customer redacted');
  assert(e.contexts.stripe.note.includes('pi_[redacted]'), 'contexts.stripe.note pi_ redacted');
}

// ── Test 7: benign message untouched
{
  const e = redactSentryEvent({ message: 'KV connection timeout after 30s' });
  assert(e.message === 'KV connection timeout after 30s', 'benign message unchanged');
}

console.log('');
if (failed > 0) {
  console.error(`sentry-redact-smoke: ${failed} assertion(s) failed`);
  process.exit(1);
}
console.log(`sentry-redact-smoke: all 7 test groups passed`);
