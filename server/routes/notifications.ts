import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      message: n.message,
      link: n.link ?? undefined,
      read: n.read,
      timeAgo: relativeTime(n.createdAt),
    })),
    unreadCount: notifications.filter((n) => !n.read).length,
  });
});

router.post('/:id/read', requireAuth, async (req: AuthedRequest, res) => {
  const n = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!n || n.userId !== req.userId) return res.status(404).json({ error: 'Not found' });
  await prisma.notification.update({ where: { id: n.id }, data: { read: true } });
  res.json({ ok: true });
});

router.post('/read-all', requireAuth, async (req: AuthedRequest, res) => {
  await prisma.notification.updateMany({ where: { userId: req.userId, read: false }, data: { read: true } });
  res.json({ ok: true });
});

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default router;
