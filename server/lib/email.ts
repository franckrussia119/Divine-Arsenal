import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendOtpEmail(to: string, name: string, code: string) {
  if (!resend) {
    // No key configured yet — log it so local/dev setups still work without Resend.
    console.warn(`[email] RESEND_API_KEY not set. OTP for ${to} is: ${code}`);
    return;
  }

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Your Divine Arsenal verification code',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0f172a;">Welcome, ${name}!</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color:#b8860b;">${code}</p>
        <p style="color:#64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}
