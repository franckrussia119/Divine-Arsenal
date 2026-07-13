import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';
import { notifyUser } from '../lib/notifications.js';

const router = Router();

function relativeDaysAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function shape(prayer: any) {
  return {
    id: prayer.id,
    title: prayer.title,
    description: prayer.description,
    status: prayer.status,
    prayingCount: prayer.agreements.length + 1, // +1 for the person who posted it
    daysAgo: prayer.status === 'answered' ? `Answered ${relativeDaysAgo(prayer.createdAt)}` : relativeDaysAgo(prayer.createdAt),
    dateStr: prayer.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    testimonyNote: prayer.testimonyNote ?? undefined,
    userId: prayer.userId,
  };
}

router.get('/', requireAuth, async (_req, res) => {
  const prayers = await prisma.prayerPoint.findMany({
    include: { agreements: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ prayers: prayers.map(shape) });
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const { title, description } = req.body ?? {};
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const prayer = await prisma.prayerPoint.create({
    data: { title, description: description ?? '', userId: req.userId! },
    include: { agreements: true },
  });
  res.status(201).json({ prayer: shape(prayer) });
});

router.post('/:id/toggle', requireAuth, async (req: AuthedRequest, res) => {
  const prayer = await prisma.prayerPoint.findUnique({ where: { id: req.params.id } });
  if (!prayer) return res.status(404).json({ error: 'Prayer not found' });
  if (prayer.userId !== req.userId && req.userRole === 'Student') {
    return res.status(403).json({ error: 'You can only update your own prayer requests' });
  }

  const updated = await prisma.prayerPoint.update({
    where: { id: prayer.id },
    data: {
      status: prayer.status === 'active' ? 'answered' : 'active',
      testimonyNote: prayer.status === 'active' ? (prayer.testimonyNote ?? 'Declared Answered!') : null,
    },
    include: { agreements: true },
  });
  res.json({ prayer: shape(updated) });
});

router.post('/:id/answered', requireAuth, async (req: AuthedRequest, res) => {
  const { testimonyNote } = req.body ?? {};
  const prayer = await prisma.prayerPoint.findUnique({ where: { id: req.params.id } });
  if (!prayer) return res.status(404).json({ error: 'Prayer not found' });
  if (prayer.userId !== req.userId && req.userRole === 'Student') {
    return res.status(403).json({ error: 'You can only update your own prayer requests' });
  }

  const updated = await prisma.prayerPoint.update({
    where: { id: prayer.id },
    data: { status: 'answered', testimonyNote: testimonyNote ?? 'Declared Answered!' },
    include: { agreements: true },
  });
  res.json({ prayer: shape(updated) });
});

router.post('/:id/pray', requireAuth, async (req: AuthedRequest, res) => {
  const prayer = await prisma.prayerPoint.findUnique({ where: { id: req.params.id } });
  if (!prayer) return res.status(404).json({ error: 'Prayer not found' });

  await prisma.prayerAgreement.upsert({
    where: { prayerId_userId: { prayerId: prayer.id, userId: req.userId! } },
    update: {},
    create: { prayerId: prayer.id, userId: req.userId! },
  });

  const updated = await prisma.prayerPoint.findUnique({
    where: { id: prayer.id },
    include: { agreements: true },
  });

  if (prayer.userId !== req.userId) {
    const prayingUser = await prisma.user.findUnique({ where: { id: req.userId } });
    notifyUser(prayer.userId, `${prayingUser?.name ?? 'Someone'} is praying with you over "${prayer.title}".`);
  }

  res.json({ prayer: shape(updated) });
});

// Counselor/Admin: send a direct message to whoever posted this prayer.
router.post('/:id/reply', requireAuth, async (req: AuthedRequest, res) => {
  if (req.userRole === 'Student') {
    return res.status(403).json({ error: 'Only counselors and admins can reply' });
  }
  const { text } = req.body ?? {};
  if (!text) return res.status(400).json({ error: 'Reply text is required' });

  const prayer = await prisma.prayerPoint.findUnique({ where: { id: req.params.id } });
  if (!prayer) return res.status(404).json({ error: 'Prayer not found' });

  const message = await prisma.message.create({
    data: { text, senderId: req.userId!, receiverId: prayer.userId },
  });

  notifyUser(prayer.userId, `A counselor replied to your prayer request "${prayer.title}".`);

  res.status(201).json({ messageId: message.id });
});

export default router;
