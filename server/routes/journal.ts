import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';

const router = Router();

function shape(entry: any) {
  return {
    id: entry.id,
    text: entry.text,
    category: entry.category,
    dateStr: entry.createdAt.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    linkedLessonId: entry.linkedLessonId ?? undefined,
  };
}

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const entries = await prisma.journalEntry.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ entries: entries.map(shape) });
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const { text, category, linkedLessonId } = req.body ?? {};
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const entry = await prisma.journalEntry.create({
    data: {
      text,
      category: category ?? 'REFLECTION',
      linkedLessonId: linkedLessonId ?? null,
      userId: req.userId!,
    },
  });
  res.status(201).json({ entry: shape(entry) });
});

export default router;
