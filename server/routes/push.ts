import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';
import { getVapidPublicKey } from '../lib/push.js';

const router = Router();

router.get('/vapid-public-key', requireAuth, (_req, res) => {
  const key = getVapidPublicKey();
  if (!key) return res.status(503).json({ error: 'Push notifications are not configured on this server' });
  res.json({ publicKey: key });
});

router.post('/subscribe', requireAuth, async (req: AuthedRequest, res) => {
  const { endpoint, keys } = req.body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'A valid push subscription is required' });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: req.userId!, p256dh: keys.p256dh, auth: keys.auth },
    create: { userId: req.userId!, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  });

  res.status(201).json({ ok: true });
});

router.post('/unsubscribe', requireAuth, async (req: AuthedRequest, res) => {
  const { endpoint } = req.body ?? {};
  if (!endpoint) return res.status(400).json({ error: 'endpoint is required' });

  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: req.userId } });
  res.json({ ok: true });
});

router.post('/test', requireAuth, async (req: AuthedRequest, res) => {
  const count = await prisma.pushSubscription.count({ where: { userId: req.userId } });
  if (count === 0) {
    return res.status(400).json({ error: 'No devices are enabled for notifications yet on this account.' });
  }
  const { sendPushToUser } = await import('../lib/push.js');
  await sendPushToUser(req.userId, { title: 'Divine Arsenal', body: 'This is a test notification — it works! 🎉', url: '/' });
  res.json({ ok: true, devices: count });
});

export default router;
