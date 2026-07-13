import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

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

export default router;
