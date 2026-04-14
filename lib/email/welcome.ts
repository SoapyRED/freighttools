/**
 * Welcome email drip sequence for new API key signups.
 *
 * Email 1: Key confirmation (sent immediately by registration route)
 * Email 2: "3 things to try" (sent 2 days after registration)
 * Email 3: Founder note from Marius (sent 5 days after registration)
 *
 * KV key: welcome:{email} → { registeredAt, step }
 * Step 1 = key email sent, 2 = tips sent, 3 = founder note sent (then deleted)
 */
import { kv } from '@vercel/kv';
import { Resend } from 'resend';

// ─── Types ───────────────────────────────────────────────────

export interface WelcomeState {
  registeredAt: string;
  step: number; // 1 | 2 | 3
}

// ─── Constants ───────────────────────────────────────────────

const WELCOME_TTL = 864_000; // 10 days in seconds
const STEP_2_DELAY_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const STEP_3_DELAY_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const FROM = 'FreightUtils <noreply@freightutils.com>';
const BASE = 'https://www.freightutils.com';

// ─── Resend (lazy init) ─────────────────────────────────────

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Called from the registration route after the initial key email is sent.
 * Starts the welcome drip sequence for this email address.
 */
export async function initWelcomeSequence(email: string): Promise<void> {
  const state: WelcomeState = {
    registeredAt: new Date().toISOString(),
    step: 1,
  };
  await kv.set(`welcome:${email}`, state, { ex: WELCOME_TTL });
}

/**
 * Called by the cron job. Scans KV for pending welcome sequences
 * and sends emails at the correct intervals.
 */
export async function processWelcomeSequences(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const resend = getResend();
  const keys = await kv.keys('welcome:*');

  let processed = 0;
  let sent = 0;
  let errors = 0;

  for (const key of keys) {
    processed++;
    const state = await kv.get<WelcomeState>(key);
    if (!state) {
      await kv.del(key);
      continue;
    }

    const email = key.replace('welcome:', '');
    const elapsed = Date.now() - new Date(state.registeredAt).getTime();

    try {
      if (state.step === 1 && elapsed >= STEP_2_DELAY_MS) {
        // Update step first (idempotent — prevents duplicate sends on cron overlap)
        await kv.set(key, { ...state, step: 2 }, { ex: WELCOME_TTL });
        if (resend) {
          await sendTipsEmail(resend, email);
          await logEmailSend(email, 2, '3 things to try with your FreightUtils API key');
          sent++;
          console.log(`[Welcome] Email 2 (tips) sent to ${email}`);
        }
      } else if (state.step === 2 && elapsed >= STEP_3_DELAY_MS) {
        // Send founder email, then delete — sequence complete
        await kv.set(key, { ...state, step: 3 }, { ex: WELCOME_TTL });
        if (resend) {
          await sendFounderEmail(resend, email);
          await logEmailSend(email, 3, 'What are you building with FreightUtils?');
          sent++;
          console.log(`[Welcome] Email 3 (founder) sent to ${email}`);
        }
        await kv.del(key);
      } else if (state.step >= 3) {
        // Defensive cleanup — shouldn't happen with TTL but be safe
        await kv.del(key);
      }
    } catch (err) {
      errors++;
      console.error(`[Welcome] Error processing ${email}:`, err);
    }
  }

  return { processed, sent, errors };
}

// ─── KV Logging ──────────────────────────────────────────────

async function logEmailSend(email: string, emailNumber: number, subject: string): Promise<void> {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  await kv.set(`welcome-log:${ts}:${email}`, {
    email,
    emailNumber,
    subject,
    sentAt: new Date().toISOString(),
  }, { ex: 2_592_000 }); // 30-day TTL for log entries
}

// ─── Email wrapper ───────────────────────────────────────────

function emailWrapper(body: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2332;">
      <div style="background: #1a2332; padding: 24px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">FreightUtils</h1>
      </div>
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        ${body}
      </div>
    </div>
  `;
}

// ─── Email 2: Tips ───────────────────────────────────────────

async function sendTipsEmail(resend: Resend, email: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '3 things to try with your FreightUtils API key',
    html: emailWrapper(`
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Your API key has been active for a couple of days. Here are three powerful things to try:
      </p>

      <div style="margin-bottom: 20px;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 6px;">
          <strong>1. Composite shipment summary</strong>
        </p>
        <p style="font-size: 14px; color: #5a6478; line-height: 1.5; margin: 0;">
          Chain CBM + weight + LDM + ADR compliance + duty estimates in a single POST request.
          <a href="${BASE}/api-docs#shipment-summary" style="color: #e87722; text-decoration: none; font-weight: 600;">Try it &rarr;</a>
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 6px;">
          <strong>2. ADR dangerous goods lookup</strong>
        </p>
        <p style="font-size: 14px; color: #5a6478; line-height: 1.5; margin: 0;">
          Search 2,939 ADR 2025 entries by UN number or substance name.
          <a href="${BASE}/api-docs#adr" style="color: #e87722; text-decoration: none; font-weight: 600;">Try it &rarr;</a>
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 6px;">
          <strong>3. MCP server for AI agents</strong>
        </p>
        <p style="font-size: 14px; color: #5a6478; line-height: 1.5; margin: 0;">
          Connect FreightUtils to Claude, Cursor, or any MCP-compatible AI agent.
          <a href="${BASE}/api-docs#mcp-server" style="color: #e87722; text-decoration: none; font-weight: 600;">Set up &rarr;</a>
        </p>
      </div>

      <a href="${BASE}/api-docs"
         style="display: inline-block; background: #e87722; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        View Full API Docs
      </a>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 13px; color: #9ca3af; margin: 0;">
        Need more than 100 requests/day?
        <a href="${BASE}/pricing" style="color: #e87722; text-decoration: none;">See our Pro plan &rarr;</a>
      </p>
    `),
  });
}

// ─── Email 3: Founder note ───────────────────────────────────

async function sendFounderEmail(resend: Resend, email: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'What are you building with FreightUtils?',
    html: emailWrapper(`
      <p style="font-size: 16px; line-height: 1.7; margin: 0 0 16px;">
        I'm Marius, the developer behind FreightUtils.
      </p>
      <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 16px;">
        I built these tools because I needed them myself, working night shifts at Heathrow.
        I'm curious &mdash; what are you using the API for?
      </p>
      <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 24px;">
        Whether it's a TMS integration, a quoting tool, or something I haven't thought of, I'd genuinely
        love to hear about it. If you need higher limits or have feature requests, hit reply and let me know.
      </p>

      <a href="mailto:contact@freightutils.com?subject=What%20I'm%20building%20with%20FreightUtils"
         style="display: inline-block; background: #e87722; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Reply to Marius
      </a>

      <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 24px 0 0;">
        Thanks for giving FreightUtils a try.<br />
        &mdash; Marius
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 13px; color: #9ca3af; margin: 0;">
        Pro plan: &pound;19/month for 50,000 requests &mdash;
        <a href="${BASE}/pricing" style="color: #e87722; text-decoration: none;">See pricing &rarr;</a>
      </p>
    `),
  });
}
