import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';

const router = Router();

const EDITABLE_FIELDS = ['name', 'bio', 'homeChurch', 'avatar', 'phone'] as const;

router.patch('/', requireAuth, async (req: AuthedRequest, res) => {
  const data: Record<string, string> = {};
  for (const field of EDITABLE_FIELDS) {
    if (typeof req.body?.[field] === 'string') {
      // "phone" isn't a real column (kept out of schema on purpose since the
      // original mock didn't need it persisted); ignore anything not in schema.
      if (field === 'phone') continue;
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
