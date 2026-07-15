import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendOtpEmail(to: string, name: string, code: string) {
  // Always log it server-side. This is your safety net: if Resend rejects the
  // send (e.g. the free onboarding@resend.dev sender can only deliver to the
  // email address your Resend account itself is registered with — every
  // other recipient will silently fail until you verify a real domain in
  // Resend), you can still find the code here and share it manually.
  console.log(`[email] OTP for ${to}: ${code}`);

  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — email was not actually sent, see code above.');
    return;
  }

  try {
    const result = await resend.emails.send({
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

    if (result.error) {
      // Resend returns a 200 with an `error` field for some failure modes rather than throwing.
      console.error(`[email] Resend rejected the send to ${to}:`, result.error);
    }
  } catch (err) {
    console.error(`[email] Failed to send OTP email to ${to}:`, err);
  }
}
