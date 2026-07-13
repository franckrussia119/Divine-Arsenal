import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';

const router = Router();

const EDITABLE_FIELDS = ['name', 'bio', 'homeChurch', 'avatar', 'whatsapp', 'language'] as const;

router.patch('/', requireAuth, async (req: AuthedRequest, res) => {
  const data: Record<string, string> = {};
  for (const field of EDITABLE_FIELDS) {
    if (typeof req.body?.[field] === 'string') {
      data[field] = req.body[field];
    }
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data,
  });

  const { password, ...publicUser } = user;
  res.json({ user: publicUser });
});

export default router;
