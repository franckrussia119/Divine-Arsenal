import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth.js';
import { uploadAvatar, uploadVideo, uploadMedia } from '../lib/uploads.js';

const router = Router();

router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), async (req: AuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file was uploaded' });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const user = await prisma.user.update({ where: { id: req.userId }, data: { avatar: avatarUrl } });

  const { password, ...publicUser } = user;
  res.json({ user: publicUser });
});

// Any signed-in user — photos/videos for Zion Digital City posts. 50MB cap.
router.post('/media', requireAuth, (req, res, next) => {
  uploadMedia.single('media')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed (max size is 50MB)' });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file was uploaded' });
  const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
  res.status(201).json({ url: `/uploads/media/${req.file.filename}`, type });
});

// Admin/Counselor only — used when building a course's lessons.
router.post('/video', requireAuth, requireRole('Admin', 'Counselor'), uploadVideo.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file was uploaded' });
  res.status(201).json({ url: `/uploads/videos/${req.file.filename}` });
});

export default router;
