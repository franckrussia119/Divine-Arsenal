import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth.js';
import { notifyRole } from '../lib/notifications.js';

const router = Router();

function shape(track: any) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    genre: track.genre,
    audioUrl: track.audioUrl,
    coverUrl: track.coverUrl ?? undefined,
    duration: track.duration ?? undefined,
    createdAt: track.createdAt,
  };
}

// Browse — optionally filter by artist or genre.
router.get('/', requireAuth, async (req, res) => {
  const artist = typeof req.query.artist === 'string' ? req.query.artist : undefined;
  const genre = typeof req.query.genre === 'string' ? req.query.genre : undefined;

  const tracks = await prisma.track.findMany({
    where: {
      ...(artist ? { artist } : {}),
      ...(genre ? { genre } : {}),
    },
    orderBy: [{ artist: 'asc' }, { title: 'asc' }],
  });

  res.json({ tracks: tracks.map(shape) });
});

// Admin/Counselor only — upload a new track.
router.post('/', requireAuth, requireRole('Admin', 'Counselor'), async (req: AuthedRequest, res) => {
  const { title, artist, genre, audioUrl, coverUrl, duration } = req.body ?? {};
  if (!title || !artist || !audioUrl) {
    return res.status(400).json({ error: 'Title, artist, and an uploaded audio file are required' });
  }

  const track = await prisma.track.create({
    data: {
      title,
      artist,
      genre: genre ?? 'Worship',
      audioUrl,
      coverUrl: coverUrl ?? null,
      duration: duration ?? null,
      uploadedById: req.userId!,
    },
  });

  res.status(201).json({ track: shape(track) });
  notifyRole('Student', `New music added: "${title}" by ${artist}`);
});

router.delete('/:id', requireAuth, async (req: AuthedRequest, res) => {
  const track = await prisma.track.findUnique({ where: { id: req.params.id } });
  if (!track) return res.status(404).json({ error: 'Track not found' });
  if (track.uploadedById !== req.userId && req.userRole !== 'Admin') {
    return res.status(403).json({ error: 'You can only delete your own uploads' });
  }
  await prisma.track.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
