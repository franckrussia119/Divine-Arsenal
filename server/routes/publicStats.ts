import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  const [totalUsers, totalAnsweredPrayers, totalCourses] = await Promise.all([
    prisma.user.count({ where: { emailVerified: true } }),
    prisma.prayerPoint.count({ where: { status: 'answered' } }),
    prisma.course.count(),
  ]);

  res.json({ totalUsers, totalAnsweredPrayers, totalCourses });
});

export default router;
