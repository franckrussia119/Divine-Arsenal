import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth.js';

const router = Router();

const courseInclude = {
  modules: {
    orderBy: { order: 'asc' as const },
    include: { lessons: { orderBy: { order: 'asc' as const } } },
  },
};

function numLessonsOf(course: any) {
  return course.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0);
}

/** Shapes a raw DB course (no enrollment) into the frontend Course type. */
function shapeCatalogCourse(course: any) {
  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    numLessons: numLessonsOf(course),
    duration: course.duration,
    description: course.description,
    isFree: course.isFree,
    price: course.price ?? undefined,
    imageUrl: course.imageUrl,
    progress: 0,
    modules: course.modules.map((m: any) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        videoDuration: l.videoDuration,
        completed: false,
        videoUrl: l.videoUrl ?? undefined,
        keyVerse: l.keyVerse ?? undefined,
        keyVerseRef: l.keyVerseRef ?? undefined,
        practices: l.practices,
        content: l.content ?? undefined,
      })),
    })),
  };
}

/** Shapes a course together with one user's enrollment (progress + completions). */
function shapeEnrolledCourse(course: any, completedLessonIds: Set<string>, progress: number) {
  return {
    ...shapeCatalogCourse(course),
    progress,
    modules: course.modules.map((m: any) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        videoDuration: l.videoDuration,
        completed: completedLessonIds.has(l.id),
        videoUrl: l.videoUrl ?? undefined,
        keyVerse: l.keyVerse ?? undefined,
        keyVerseRef: l.keyVerseRef ?? undefined,
        practices: l.practices,
        content: l.content ?? undefined,
      })),
    })),
  };
}

// Public catalog of all courses.
router.get('/', async (_req, res) => {
  const courses = await prisma.course.findMany({
    include: courseInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ courses: courses.map(shapeCatalogCourse) });
});

// The signed-in user's enrolled courses, with progress & per-lesson completion.
router.get('/enrolled', requireAuth, async (req: AuthedRequest, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.userId },
    include: {
      course: { include: courseInclude },
      completions: true,
    },
  });

  const shaped = enrollments.map((e) =>
    shapeEnrolledCourse(
      e.course,
      new Set(e.completions.map((c) => c.lessonId)),
      e.progress
    )
  );

  res.json({ courses: shaped });
});

// Enroll the signed-in user in a course.
router.post('/:id/enroll', requireAuth, async (req: AuthedRequest, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: courseInclude,
  });
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: req.userId!, courseId: course.id } },
    update: {},
    create: { userId: req.userId!, courseId: course.id, progress: 0 },
    include: { completions: true },
  });

  res.status(201).json({
    course: shapeEnrolledCourse(course, new Set(enrollment.completions.map((c) => c.lessonId)), enrollment.progress),
  });
});

// Toggle a lesson's completed state for the signed-in user, recomputing progress.
router.post('/:id/lessons/:lessonId/toggle', requireAuth, async (req: AuthedRequest, res) => {
  const { id: courseId, lessonId } = req.params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.userId!, courseId } },
  });
  if (!enrollment) return res.status(404).json({ error: 'Not enrolled in this course' });

  const existing = await prisma.lessonCompletion.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
  });

  if (existing) {
    await prisma.lessonCompletion.delete({ where: { id: existing.id } });
  } else {
    await prisma.lessonCompletion.create({
      data: { enrollmentId: enrollment.id, lessonId },
    });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId }, include: courseInclude });
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const totalLessons = numLessonsOf(course);
  const completions = await prisma.lessonCompletion.findMany({ where: { enrollmentId: enrollment.id } });
  const progress = totalLessons > 0 ? Math.round((completions.length / totalLessons) * 100) : 0;

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { progress },
  });

  res.json({
    course: shapeEnrolledCourse(course, new Set(completions.map((c) => c.lessonId)), updatedEnrollment.progress),
    wasCompleted: !existing,
  });
});

// Admin/Counselor: create a new course with modules & lessons.
router.post('/', requireAuth, requireRole('Admin', 'Counselor'), async (req: AuthedRequest, res) => {
  try {
    const { title, subtitle, category, duration, description, isFree, price, imageUrl, modules } = req.body ?? {};
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const course = await prisma.course.create({
      data: {
        title,
        subtitle: subtitle ?? '',
        category: category ?? '',
        duration: duration ?? '',
        description: description ?? '',
        isFree: isFree ?? true,
        price: price ?? null,
        imageUrl: imageUrl ?? '',
        modules: {
          create: (modules ?? []).map((m: any, mi: number) => ({
            title: m.title,
            order: mi,
            lessons: {
              create: (m.lessons ?? []).map((l: any, li: number) => ({
                title: l.title,
                duration: l.duration ?? '',
                videoDuration: l.videoDuration ?? '',
                videoUrl: l.videoUrl ?? null,
                keyVerse: l.keyVerse ?? null,
                keyVerseRef: l.keyVerseRef ?? null,
                practices: l.practices ?? [],
                content: l.content ?? null,
                order: li,
              })),
            },
          })),
        },
      },
      include: courseInclude,
    });

    res.status(201).json({ course: shapeCatalogCourse(course) });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Could not create course' });
  }
});

export default router;
