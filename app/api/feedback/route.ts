/**
 * POST /api/feedback
 *
 * Accepts user feedback from the floating widget, validates it,
 * rate-limits by IP (5/hour), and emails it to contact@freightutils.com
 * via Resend. No database — email-based log for MVP.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── Constants ────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const VALID_TYPES = ['bug', 'idea', 'data', 'other'] as const;
type FeedbackType = (typeof VALID_TYPES)[number];

const TYPE_LABELS: Record<FeedbackType, string> = {
  bug: '🐛 Bug',
  idea: '💡 Idea',
  data: '📊 Data Issue',
  other: '💬 Other',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Lazy inits ───────────────────────────────────────────────

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

let _rl: Ratelimit | null = null;
function getRatelimit(): Ratelimit | null {
  if (_rl) return _rl;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  _rl = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'feedback-rl',
  });
  return _rl;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

// ── CORS preflight ───────────────────────────────────────────

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── POST handler ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const h = { ...CORS, 'Content-Type': 'application/json' };

  try {
    const body = await req.json();

    // Honeypot — hidden field; bots fill it, humans don't
    if (body.website) {
      // Silently accept to not tip off the bot
      return NextResponse.json({ ok: true }, { headers: h });
    }

    // ── Validate ──────────────────────────────────────────

    const message = (body.message ?? '').trim();
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: 'Feedback must be at least 10 characters.' },
        { status: 400, headers: h },
      );
    }
    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Feedback must be under 2,000 characters.' },
        { status: 400, headers: h },
      );
    }

    const type: FeedbackType = VALID_TYPES.includes(body.type) ? body.type : 'other';

    const email = (body.email ?? '').trim();
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400, headers: h },
      );
    }

    const url = (body.url ?? '').slice(0, 500);
    const ua = (body.ua ?? '').slice(0, 500);
    const theme = body.theme === 'dark' ? 'dark' : 'light';
    const timestamp = new Date().toISOString();

    // ── Rate limit ────────────────────────────────────────

    const rl = getRatelimit();
    if (rl) {
      const ip = getClientIp(req);
      try {
        const { success } = await rl.limit(ip);
        if (!success) {
          console.warn(`[Feedback] Rate limited IP: ${ip}`);
          return NextResponse.json(
            { error: 'Too many submissions. Try again later.' },
            { status: 429, headers: { ...h, 'Retry-After': '3600' } },
          );
        }
      } catch (err) {
        console.error('[Feedback] Rate limit error:', err instanceof Error ? err.message : err);
        // Allow through if Redis fails
      }
    }

    // ── Send email ────────────────────────────────────────

    const resend = getResend();
    if (!resend) {
      console.error('[Feedback] RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Failed to send. Please try again.' },
        { status: 500, headers: h },
      );
    }

    const subjectPreview = message
      .replace(/\s+/g, ' ')  // collapse all whitespace (including newlines) to single spaces
      .trim()
      .slice(0, 60);
    const subject = `[FreightUtils Feedback] ${TYPE_LABELS[type]}: ${subjectPreview}${message.length > 60 ? '...' : ''}`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1E293B;">
        <div style="background: #1E293B; padding: 16px 24px; border-radius: 8px 8px 0 0;">
          <span style="color: #EF9F27; font-weight: 700; font-size: 16px;">FreightUtils</span>
          <span style="color: #94A3B8; font-size: 14px; margin-left: 8px;">Feedback</span>
        </div>
        <div style="padding: 24px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 6px 0; color: #64748B; width: 90px;">Type</td><td style="padding: 6px 0; font-weight: 600;">${TYPE_LABELS[type]}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">From</td><td style="padding: 6px 0;">${email || 'Anonymous'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Page</td><td style="padding: 6px 0; font-family: monospace; font-size: 12px;">${escapeHtml(url) || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Theme</td><td style="padding: 6px 0;">${theme}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Time</td><td style="padding: 6px 0;">${timestamp}</td></tr>
          </table>
          <div style="background: #F1F5F9; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
${escapeHtml(message)}
          </div>
          ${email ? `<p style="font-size: 12px; color: #94A3B8; margin-top: 16px;">Reply directly to this email to respond to the user.</p>` : ''}
        </div>
      </div>
    `;

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: 'FreightUtils Feedback <feedback@freightutils.com>',
      to: 'contact@freightutils.com',
      ...(email ? { replyTo: email } : {}),
      subject,
      html: htmlBody,
    });

    if (sendError) {
      console.error('[Feedback] Resend error:', JSON.stringify(sendError, null, 2));
      return NextResponse.json(
        { error: 'Failed to send. Please try again.' },
        { status: 500, headers: h },
      );
    }

    if (!sendData?.id) {
      console.error('[Feedback] Resend returned no ID — possible silent failure');
    }

    console.log(`[Feedback] Sent: type=${type}, page=${url}, length=${message.length}`);
    return NextResponse.json({ ok: true }, { headers: h });

  } catch (err) {
    console.error('[Feedback] Unexpected error:', err instanceof Error ? err.message : JSON.stringify(err));
    return NextResponse.json(
      { error: 'Failed to send. Please try again.' },
      { status: 500, headers: h },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
