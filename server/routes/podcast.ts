import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth.js';
import { notifyRole } from '../lib/notifications.js';

const router = Router();

function shape(ep: any) {
  return {
    id: ep.id,
    title: ep.title,
    theme: ep.theme,
    category: ep.category,
    description: ep.description,
    audioUrl: ep.audioUrl,
    coverUrl: ep.coverUrl ?? undefined,
    duration: ep.duration ?? undefined,
    createdAt: ep.createdAt,
  };
}

// Browse — optionally filter by theme or category.
router.get('/', requireAuth, async (req, res) => {
  const theme = typeof req.query.theme === 'string' ? req.query.theme : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;

  const episodes = await prisma.podcastEpisode.findMany({
    where: {
      ...(theme ? { theme } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ episodes: episodes.map(shape) });
});

// Admin/Counselor only — upload a new episode.
router.post('/', requireAuth, requireRole('Admin', 'Counselor'), async (req: AuthedRequest, res) => {
  const { title, theme, category, description, audioUrl, coverUrl, duration } = req.body ?? {};
  if (!title || !audioUrl) {
    return res.status(400).json({ error: 'Title and an uploaded audio file are required' });
  }

  const episode = await prisma.podcastEpisode.create({
    data: {
      title,
      theme: theme ?? 'Teaching',
      category: category ?? 'General',
      description: description ?? '',
      audioUrl,
      coverUrl: coverUrl ?? null,
      duration: duration ?? null,
      uploadedById: req.userId!,
    },
  });

  res.status(201).json({ episode: shape(episode) });
  notifyRole('Student', `New podcast episode: "${title}"`);
});

router.delete('/:id', requireAuth, async (req: AuthedRequest, res) => {
  const episode = await prisma.podcastEpisode.findUnique({ where: { id: req.params.id } });
  if (!episode) return res.status(404).json({ error: 'Episode not found' });
  if (episode.uploadedById !== req.userId && req.userRole !== 'Admin') {
    return res.status(403).json({ error: 'You can only delete your own uploads' });
  }
  await prisma.podcastEpisode.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
