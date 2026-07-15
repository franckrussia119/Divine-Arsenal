import { Router } from 'express';
import path from 'path';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth.js';
import { uploadAvatar, uploadVideo, uploadMedia, uploadAudio } from '../lib/uploads.js';
import { compressIfVideo } from '../lib/videoCompress.js';

const router = Router();

router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), async (req: AuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file was uploaded' });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const user = await prisma.user.update({ where: { id: req.userId }, data: { avatar: avatarUrl } });

  const { password, ...publicUser } = user;
  res.json({ user: publicUser });
});

// Any signed-in user — photos/videos/audio for Zion Digital City posts. 50MB cap.
router.post('/media', requireAuth, (req, res, next) => {
  uploadMedia.single('media')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed (max size is 50MB)' });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file was uploaded' });
  const type = req.file.mimetype.startsWith('video/')
    ? 'video'
    : req.file.mimetype.startsWith('audio/')
    ? 'audio'
    : 'image';

  const finalPath = await compressIfVideo(req.file.path, req.file.mimetype);
  const filename = path.basename(finalPath);

  res.status(201).json({ url: `/uploads/media/${filename}`, type });
});

// Admin/Counselor only — music tracks & podcast episodes. Larger cap (150MB).
router.post('/audio', requireAuth, requireRole('Admin', 'Counselor'), (req, res, next) => {
  uploadAudio.single('audio')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed (max size is 150MB)' });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file was uploaded' });
  res.status(201).json({ url: `/uploads/audio/${req.file.filename}` });
});

// Admin/Counselor only — used when building a course's lessons.
router.post('/video', requireAuth, requireRole('Admin', 'Counselor'), uploadVideo.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file was uploaded' });

  const finalPath = await compressIfVideo(req.file.path, req.file.mimetype);
  const filename = path.basename(finalPath);

  res.status(201).json({ url: `/uploads/videos/${filename}` });
});

export default router;
