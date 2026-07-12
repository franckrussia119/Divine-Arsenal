import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';

const router = Router();

const postInclude = {
  author: true,
  comments: { include: { author: true }, orderBy: { createdAt: 'asc' as const } },
  likes: true,
  agreements: true,
};

function shape(post: any, currentUserId?: string) {
  return {
    id: post.id,
    authorName: post.author.name,
    authorAvatar: post.author.avatar,
    authorRole: post.author.role,
    content: post.content,
    imageUrl: post.imageUrl ?? undefined,
    videoUrl: post.videoUrl ?? undefined,
    likes: post.likes.length,
    prayerAgreements: post.agreements.length,
    dateStr: post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    category: post.category,
    isLiked: currentUserId ? post.likes.some((l: any) => l.userId === currentUserId) : false,
    isAgreed: currentUserId ? post.agreements.some((a: any) => a.userId === currentUserId) : false,
    comments: post.comments.map((c: any) => ({
      id: c.id,
      authorName: c.author.name,
      authorAvatar: c.author.avatar,
      authorRole: c.author.role,
      content: c.content,
      dateStr: c.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    })),
  };
}

router.get('/posts', requireAuth, async (req: AuthedRequest, res) => {
  const posts = await prisma.communityPost.findMany({
    include: postInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ posts: posts.map((p) => shape(p, req.userId)) });
});

router.post('/posts', requireAuth, async (req: AuthedRequest, res) => {
  const { content, imageUrl, videoUrl, category } = req.body ?? {};
  if (!content) return res.status(400).json({ error: 'Post content is required' });

  const post = await prisma.communityPost.create({
    data: {
      content,
      imageUrl: imageUrl ?? null,
      videoUrl: videoUrl ?? null,
      category: category ?? 'teaching',
      authorId: req.userId!,
    },
    include: postInclude,
  });
  res.status(201).json({ post: shape(post, req.userId) });
});

router.post('/posts/:id/like', requireAuth, async (req: AuthedRequest, res) => {
  const existing = await prisma.communityLike.findUnique({
    where: { postId_userId: { postId: req.params.id, userId: req.userId! } },
  });

  if (existing) {
    await prisma.communityLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.communityLike.create({ data: { postId: req.params.id, userId: req.userId! } });
  }

  const post = await prisma.communityPost.findUnique({ where: { id: req.params.id }, include: postInclude });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post: shape(post, req.userId) });
});

router.post('/posts/:id/agree', requireAuth, async (req: AuthedRequest, res) => {
  const existing = await prisma.communityAgreement.findUnique({
    where: { postId_userId: { postId: req.params.id, userId: req.userId! } },
  });

  if (existing) {
    await prisma.communityAgreement.delete({ where: { id: existing.id } });
  } else {
    await prisma.communityAgreement.create({ data: { postId: req.params.id, userId: req.userId! } });
  }

  const post = await prisma.communityPost.findUnique({ where: { id: req.params.id }, include: postInclude });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post: shape(post, req.userId) });
});

router.post('/posts/:id/comments', requireAuth, async (req: AuthedRequest, res) => {
  const { content } = req.body ?? {};
  if (!content) return res.status(400).json({ error: 'Comment content is required' });

  await prisma.communityComment.create({
    data: { content, postId: req.params.id, authorId: req.userId! },
  });

  const post = await prisma.communityPost.findUnique({ where: { id: req.params.id }, include: postInclude });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.status(201).json({ post: shape(post, req.userId) });
});

router.get('/live-sessions', requireAuth, async (_req, res) => {
  const sessions = await prisma.liveSession.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      hostName: s.hostName,
      hostAvatar: s.hostAvatar,
      viewerCount: s.viewerCount,
      status: s.status,
      scheduledTime: s.scheduledTime ?? undefined,
      category: s.category,
    })),
  });
});

export default router;
