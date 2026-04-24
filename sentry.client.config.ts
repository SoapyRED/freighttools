import * as Sentry from '@sentry/nextjs';
import { redactSentryEvent } from './lib/sentry-redact';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 0.1,
  beforeSend(event) {
    return redactSentryEvent(event);
  },
});
