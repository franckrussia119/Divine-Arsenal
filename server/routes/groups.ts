import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';
import { notifyUser } from '../lib/notifications.js';
import { avatarOrDefault } from '../lib/avatar.js';

const router = Router();

function shape(group: any, currentUserId?: string) {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    imageUrl: group.imageUrl || undefined,
    memberCount: group.members.length,
    createdByName: group.createdBy?.name ?? '',
    isMember: currentUserId ? group.members.some((m: any) => m.userId === currentUserId) : false,
    isAdmin: currentUserId ? group.members.some((m: any) => m.userId === currentUserId && m.role === 'admin') : false,
    createdAt: group.createdAt,
  };
}

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const groups = await prisma.group.findMany({
    include: { members: true, createdBy: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ groups: groups.map((g) => shape(g, req.userId)) });
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const { name, description, imageUrl } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'Group name is required' });

  const group = await prisma.group.create({
    data: {
      name,
      description: description ?? '',
      imageUrl: imageUrl ?? '',
      createdById: req.userId!,
      members: { create: { userId: req.userId!, role: 'admin' } },
    },
    include: { members: true, createdBy: true },
  });

  res.status(201).json({ group: shape(group, req.userId) });
});

router.get('/:id', requireAuth, async (req: AuthedRequest, res) => {
  const group = await prisma.group.findUnique({
    where: { id: req.params.id },
    include: { members: { include: { user: true } }, createdBy: true },
  });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  res.json({
    group: shape(group, req.userId),
    members: group.members.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      avatar: avatarOrDefault(m.user.avatar),
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  });
});

router.post('/:id/join', requireAuth, async (req: AuthedRequest, res) => {
  const group = await prisma.group.findUnique({ where: { id: req.params.id } });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  await prisma.groupMembership.upsert({
    where: { groupId_userId: { groupId: group.id, userId: req.userId! } },
    update: {},
    create: { groupId: group.id, userId: req.userId! },
  });

  const updated = await prisma.group.findUnique({ where: { id: group.id }, include: { members: true, createdBy: true } });
  res.json({ group: shape(updated, req.userId) });
});

router.post('/:id/leave', requireAuth, async (req: AuthedRequest, res) => {
  const membership = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId: req.params.id, userId: req.userId! } },
  });
  if (membership) {
    await prisma.groupMembership.delete({ where: { id: membership.id } });
  }

  const updated = await prisma.group.findUnique({ where: { id: req.params.id }, include: { members: true, createdBy: true } });
  if (!updated) return res.status(404).json({ error: 'Group not found' });
  res.json({ group: shape(updated, req.userId) });
});

// Group admin: add someone directly by email (they don't need to self-join).
router.post('/:id/members', requireAuth, async (req: AuthedRequest, res) => {
  const requesterMembership = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId: req.params.id, userId: req.userId! } },
  });
  if (!requesterMembership || requesterMembership.role !== 'admin') {
    return res.status(403).json({ error: 'Only this group\'s admin can add members' });
  }

  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return res.status(404).json({ error: 'No account found for that email' });

  await prisma.groupMembership.upsert({
    where: { groupId_userId: { groupId: req.params.id, userId: user.id } },
    update: {},
    create: { groupId: req.params.id, userId: user.id },
  });

  const group = await prisma.group.findUnique({
    where: { id: req.params.id },
    include: { members: { include: { user: true } }, createdBy: true },
  });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  notifyUser(user.id, `You were added to the group "${group.name}".`);

  res.status(201).json({
    group: shape(group, req.userId),
    members: group.members.map((m) => ({ userId: m.userId, name: m.user.name, avatar: avatarOrDefault(m.user.avatar), role: m.role, joinedAt: m.joinedAt })),
  });
});

// Group admin: remove a member.
router.delete('/:id/members/:userId', requireAuth, async (req: AuthedRequest, res) => {
  const requesterMembership = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId: req.params.id, userId: req.userId! } },
  });
  if (!requesterMembership || requesterMembership.role !== 'admin') {
    return res.status(403).json({ error: 'Only this group\'s admin can remove members' });
  }
  if (req.params.userId === req.userId) {
    return res.status(400).json({ error: 'Use "leave" to remove yourself' });
  }

  const membership = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId: req.params.id, userId: req.params.userId } },
  });
  if (membership) await prisma.groupMembership.delete({ where: { id: membership.id } });

  const group = await prisma.group.findUnique({
    where: { id: req.params.id },
    include: { members: { include: { user: true } }, createdBy: true },
  });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  res.json({
    group: shape(group, req.userId),
    members: group.members.map((m) => ({ userId: m.userId, name: m.user.name, avatar: avatarOrDefault(m.user.avatar), role: m.role, joinedAt: m.joinedAt })),
  });
});

export default router;
