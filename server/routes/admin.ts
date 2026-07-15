import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { notifyUser } from '../lib/notifications.js';

const router = Router();

router.use(requireAuth, requireRole('Admin'));

router.get('/stats', async (_req, res) => {
  const [totalUsers, totalStudents, totalCounselors, totalAdmins, totalEnrollments, totalCourses, totalPrayers, totalPosts] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'Student' } }),
      prisma.user.count({ where: { role: 'Counselor' } }),
      prisma.user.count({ where: { role: 'Admin' } }),
      prisma.enrollment.count(),
      prisma.course.count(),
      prisma.prayerPoint.count(),
      prisma.communityPost.count(),
    ]);

  const courses = await prisma.course.findMany({
    include: { enrollments: true, modules: { include: { lessons: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const courseStats = courses.map((c) => {
    const totalLessons = c.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const avgProgress = c.enrollments.length
      ? Math.round(c.enrollments.reduce((acc, e) => acc + e.progress, 0) / c.enrollments.length)
      : 0;
    return {
      id: c.id,
      title: c.title,
      enrolledCount: c.enrollments.length,
      totalLessons,
      avgProgress,
    };
  });

  res.json({
    totalUsers,
    totalStudents,
    totalCounselors,
    totalAdmins,
    totalEnrollments,
    totalCourses,
    totalPrayers,
    totalPosts,
    courses: courseStats,
  });
});

// All students, with what they're enrolled in and their progress on each.
router.get('/students', async (_req, res) => {
  const students = await prisma.user.findMany({
    where: { role: 'Student' },
    include: {
      enrollments: { include: { course: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      whatsapp: s.whatsapp,
      homeChurch: s.homeChurch,
      joinedAt: s.createdAt,
      courses: s.enrollments.map((e) => ({
        courseId: e.courseId,
        title: e.course.title,
        progress: e.progress,
      })),
    })),
  });
});

// Promote an existing Student account to Counselor (doesn't create a new account).
router.post('/students/:id/promote', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role !== 'Student') {
    return res.status(400).json({ error: 'Only Student accounts can be promoted from here' });
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data: { role: 'Counselor' } });
  notifyUser(updated.id, "You've been promoted to Counselor! You now have counselor access across the platform.");

  res.json({ ok: true });
});

export default router;
