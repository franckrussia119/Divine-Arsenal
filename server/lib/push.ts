import webpush from 'web-push';
import { prisma } from './prisma.js';

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

const enabled = Boolean(publicKey && privateKey);

if (enabled) {
  webpush.setVapidDetails(subject, publicKey!, privateKey!);
} else {
  console.warn('[push] VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY not set — device push notifications are disabled (in-app notifications still work).');
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

async function sendToSubscription(sub: { id: string; endpoint: string; p256dh: string; auth: string }, payload: PushPayload) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    );
  } catch (err: any) {
    // 404/410 means the browser unsubscribed or the subscription expired — clean it up.
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
    } else {
      console.error('[push] Failed to send to a subscription:', err?.message || err);
    }
  }
}

export async function sendPushToUser(userId: string | null | undefined, payload: PushPayload) {
  if (!enabled || !userId) return;
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  await Promise.all(subs.map((s) => sendToSubscription(s, payload)));
}

export async function sendPushToRole(role: 'Student' | 'Counselor' | 'Admin', payload: PushPayload) {
  if (!enabled) return;
  const subs = await prisma.pushSubscription.findMany({ where: { user: { role } } });
  await Promise.all(subs.map((s) => sendToSubscription(s, payload)));
}

export function getVapidPublicKey() {
  return publicKey ?? null;
}
