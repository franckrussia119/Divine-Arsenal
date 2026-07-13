import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth.js';
import { notifyRole } from '../lib/notifications.js';

const router = Router();

function shape(post: any) {
  return {
    id: post.id,
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
  const { title, category, excerpt, content, authorName, authorRole, readTime, imageUrl, featured } = req.body ?? {};
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  const post = await prisma.blogPost.create({
    data: {
      title,
      category: category ?? '',
      excerpt: excerpt ?? '',
      content,
      authorId: req.userId,
      authorName: authorName ?? '',
      authorRole: authorRole ?? '',
      readTime: readTime ?? '',
      imageUrl: imageUrl ?? '',
      featured: featured ?? false,
    },
  });

  res.status(201).json({ post: shape(post) });
  notifyRole('Student', `A new teaching was just published: "${title}"`);
});

export default router;
