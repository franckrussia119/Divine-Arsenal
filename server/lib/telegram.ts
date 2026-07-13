const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

/** Sends a plain-text message to the configured admin chat. Never throws — a
 * failed notification should never break signup for the actual user. */
export async function notifyTelegram(text: string) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_ADMIN_CHAT_ID not set, skipping notification.');
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('[telegram] Failed to send notification:', err);
  }
}

export function newUserTelegramMessage(opts: {
  name: string;
  email: string;
  whatsapp: string;
  homeChurch?: string;
}) {
  return [
    '🆕 <b>New Divine Arsenal signup</b>',
    `Name: ${opts.name}`,
    `Email: ${opts.email}`,
    `WhatsApp: ${opts.whatsapp || '—'}`,
    opts.homeChurch ? `Home church: ${opts.homeChurch}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}
