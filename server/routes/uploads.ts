import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth.js';
import { uploadAvatar, uploadVideo } from '../lib/uploads.js';

const router = Router();

router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), async (req: AuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file was uploaded' });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const user = await prisma.user.update({ where: { id: req.userId }, data: { avatar: avatarUrl } });

  const { password, ...publicUser } = user;
  res.json({ user: publicUser });
});

// Admin/Counselor only — used when building a course's lessons.
router.post('/video', requireAuth, requireRole('Admin', 'Counselor'), uploadVideo.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file was uploaded' });
  res.status(201).json({ url: `/uploads/videos/${req.file.filename}` });
});

export default router;
