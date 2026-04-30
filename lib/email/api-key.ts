import { Resend } from 'resend';

let _resend: Resend | null = null;
export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendApiKeyEmail(resend: Resend, email: string, apiKey: string): Promise<void> {
  await resend.emails.send({
    from: 'FreightUtils <noreply@freightutils.com>',
    to: email,
    subject: 'Your FreightUtils API Key',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2332;">
        <div style="background: #1a2332; padding: 24px 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; font-size: 20px; margin: 0;">FreightUtils</h1>
        </div>
        <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Here's your free API key:
          </p>
          <div style="background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; font-family: 'Courier New', monospace; font-size: 15px; font-weight: 600; color: #1a2332; word-break: break-all; margin-bottom: 20px;">
            ${apiKey}
          </div>
          <p style="font-size: 14px; color: #5a6478; line-height: 1.6; margin: 0 0 8px;">
            <strong>Rate limit:</strong> 100 requests/day
          </p>
          <p style="font-size: 14px; color: #5a6478; line-height: 1.6; margin: 0 0 20px;">
            <strong>Usage:</strong> Add as a header (<code>X-API-Key: ${apiKey}</code>) or query parameter (<code>?apiKey=${apiKey}</code>).
          </p>
          <a href="https://www.freightutils.com/api-docs"
             style="display: inline-block; background: #e87722; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View API Documentation
          </a>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 13px; color: #9ca3af; margin: 0;">
            Need higher limits? Pro tier (50,000/month) at
            <a href="https://www.freightutils.com/pricing" style="color: #e87722;">freightutils.com/pricing</a>.
          </p>
          <p style="font-size: 13px; color: #9ca3af; margin: 12px 0 0;">
            Over the next few days, we'll send you a couple of tips to get the most from FreightUtils. Reply anytime &mdash; we read every email.
          </p>
        </div>
      </div>
    `,
  });
}
