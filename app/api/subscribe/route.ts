import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lazy-init to avoid build-time crash when env var is missing
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const h = CORS_HEADERS;
  try {
    const body = await req.json();
    const email = (body?.email ?? '').trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400, headers: h });
    }

    const resend = getResend();
    if (!resend) {
      // No Resend key configured — fall back to logging only
      console.log('NEW_SUBSCRIBER:', email, new Date().toISOString());
      return NextResponse.json({ success: true }, { headers: h });
    }

    // Add contact to Resend audience (idempotent — duplicates are ignored)
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      }).catch(() => {/* audience add is best-effort */});
    }

    // Send welcome email with PDF download link
    await resend.emails.send({
      from: 'FreightUtils <noreply@freightutils.com>',
      to: email,
      subject: 'Your ADR 2025 Quick Reference Guide',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2332;">
          <div style="background: #1a2332; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; font-size: 20px; margin: 0;">FreightUtils</h1>
          </div>
          <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Thanks for subscribing! Here's your ADR 2025 Quick Reference Guide:
            </p>
            <a href="https://www.freightutils.com/ADR-2025-Quick-Reference-Guide.pdf"
               style="display: inline-block; background: #e87722; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Download PDF Guide
            </a>
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 24px 0 0;">
              This 2-page guide covers the key changes in ADR 2025 including new UN numbers,
              updated tunnel codes, and revised limited quantity thresholds.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 13px; color: #9ca3af; margin: 0;">
              Free freight calculation tools at
              <a href="https://www.freightutils.com" style="color: #e87722;">freightutils.com</a>
            </p>
          </div>
        </div>
      `,
    });

    // Also log for backup visibility
    console.log('NEW_SUBSCRIBER:', email, new Date().toISOString());

    return NextResponse.json({ success: true }, { headers: h });
  } catch (err) {
    console.error('Subscribe error:', err);
    // Still return success to the user even if Resend fails —
    // the PDF is available via direct download anyway
    return NextResponse.json({ success: true }, { headers: h });
  }
}
