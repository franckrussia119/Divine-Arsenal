import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// SMTP (e.g. Gmail with an App Password) — set SMTP_USER + SMTP_PASS to use this instead.
// Defaults to Gmail's SMTP server; override SMTP_HOST/SMTP_PORT for another provider.
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpFrom = process.env.SMTP_FROM_EMAIL || smtpUser;

const smtpTransport = smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

function otpEmailHtml(name: string, code: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#0f172a;">Welcome, ${name}!</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color:#b8860b;">${code}</p>
      <p style="color:#64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}

export async function sendOtpEmail(to: string, name: string, code: string) {
  // Always log it server-side. This is your safety net: if email delivery
  // fails for any reason, you can still find the code here and share it
  // manually with whoever is testing.
  console.log(`[email] OTP for ${to}: ${code}`);

  // SMTP takes priority if configured — it's the more reliable option since
  // it doesn't require domain verification and works with any Gmail account.
  if (smtpTransport) {
    try {
      await smtpTransport.sendMail({
        from: smtpFrom,
        to,
        subject: 'Your Divine Arsenal verification code',
        html: otpEmailHtml(name, code),
      });
      return;
    } catch (err) {
      console.error(`[email] SMTP failed to send OTP to ${to}:`, err);
      return;
    }
  }

  if (resend) {
    try {
      const result = await resend.emails.send({
        from: resendFromEmail,
        to,
        subject: 'Your Divine Arsenal verification code',
        html: otpEmailHtml(name, code),
      });
      if (result.error) {
        // Resend returns 200 with an `error` field for some failure modes rather than throwing.
        console.error(`[email] Resend rejected the send to ${to}:`, result.error);
      }
    } catch (err) {
      console.error(`[email] Resend failed to send OTP to ${to}:`, err);
    }
    return;
  }

  console.warn('[email] No email provider configured (SMTP_USER/SMTP_PASS or RESEND_API_KEY) — email was not sent, see code above.');
}
