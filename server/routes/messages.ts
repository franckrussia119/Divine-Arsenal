import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';

const router = Router();

function shape(message: any) {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    text: message.text,
    timestamp: message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    senderName: message.sender?.name ?? '',
  };
}

/** There's one shared "counsel line" — the earliest-created Counselor account. */
async function getDefaultCounselor() {
  return prisma.user.findFirst({ where: { role: 'Counselor' }, orderBy: { createdAt: 'asc' } });
}

// A student's conversation with the default counselor.
router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const counselor = await getDefaultCounselor();
  if (!counselor) return res.json({ messages: [], counselorAvailable: false });

  const otherId = req.userRole === 'Student' ? counselor.id : req.query.withUserId as string;
  if (!otherId) return res.json({ messages: [], counselorAvailable: true });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.userId, receiverId: otherId },
        { senderId: otherId, receiverId: req.userId },
      ],
    },
    include: { sender: true },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ messages: messages.map(shape), counselorAvailable: true });
});

// Send a message. Students send to the default counselor automatically;
// counselors/admins must pass receiverId explicitly.
router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const { text, receiverId } = req.body ?? {};
  if (!text) return res.status(400).json({ error: 'Message text is required' });

  let toId = receiverId;
  if (req.userRole === 'Student') {
    const counselor = await getDefaultCounselor();
    if (!counselor) return res.status(503).json({ error: 'No counselor is available yet' });
    toId = counselor.id;
  }
  if (!toId) return res.status(400).json({ error: 'receiverId is required' });

  const message = await prisma.message.create({
    data: { text, senderId: req.userId!, receiverId: toId },
    include: { sender: true },
  });

  res.status(201).json({ message: shape(message) });
});

export default router;
