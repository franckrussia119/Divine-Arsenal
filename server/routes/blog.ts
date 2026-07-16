import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth.js';
import { notifyRole } from '../lib/notifications.js';

const router = Router();

function shape(post: any) {
  return {
    id: post.id,
    authorId: post.authorId ?? undefined,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    author: post.authorName,
    authorRole: post.authorRole,
    date: post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: post.readTime,
    imageUrl: post.imageUrl,
    featured: post.featured,
  };
}

router.get('/', async (_req, res) => {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ posts: posts.map(shape) });
});

router.post('/', requireAuth, requireRole('Admin', 'Counselor'), async (req: AuthedRequest, res) => {
  const { title, category, excerpt, content, readTime, imageUrl, featured } = req.body ?? {};
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  const author = await prisma.user.findUnique({ where: { id: req.userId } });

  const post = await prisma.blogPost.create({
    data: {
      title,
      category: category ?? '',
      excerpt: excerpt ?? '',
      content,
      authorId: req.userId,
      authorName: author?.name ?? '',
      authorRole: author?.role ?? '',
      readTime: readTime ?? '',
      imageUrl: imageUrl ?? '',
      featured: featured ?? false,
    },
  });

  res.status(201).json({ post: shape(post) });
  notifyRole('Student', `A new teaching was just published: "${title}"`);
});

// Delete a blog post — its author, or an Admin, only.
router.delete('/:id', requireAuth, async (req: AuthedRequest, res) => {
  const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.authorId !== req.userId && req.userRole !== 'Admin') {
    return res.status(403).json({ error: 'You can only delete your own teachings' });
  }

  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
