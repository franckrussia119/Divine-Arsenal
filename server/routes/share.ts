import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';
import { notifyUser } from '../lib/notifications.js';

const router = Router();

// Search platform members to share with (excludes yourself).
router.get('/users', requireAuth, async (req: AuthedRequest, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
  if (query.length < 2) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      id: { not: req.userId },
      emailVerified: true,
      name: { contains: query, mode: 'insensitive' },
    },
    select: { id: true, name: true, avatar: true, role: true },
    take: 10,
  });

  res.json({ users });
});

// Share a piece of content with another platform member — delivered as a notification.
router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const { toUserId, title, url } = req.body ?? {};
  if (!toUserId || !title || !url) {
    return res.status(400).json({ error: 'toUserId, title, and url are required' });
  }

  const sender = await prisma.user.findUnique({ where: { id: req.userId } });
  await notifyUser(toUserId, `${sender?.name ?? 'Someone'} shared "${title}" with you.`, url);

  res.status(201).json({ ok: true });
});

export default router;
