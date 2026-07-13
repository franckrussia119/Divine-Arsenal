import { prisma } from './prisma.js';

export async function notifyUser(userId: string | null | undefined, message: string, link?: string) {
  if (!userId) return;
  try {
    await prisma.notification.create({ data: { userId, message, link: link ?? null } });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

export async function notifyRole(role: 'Student' | 'Counselor' | 'Admin', message: string, link?: string) {
  try {
    const users = await prisma.user.findMany({ where: { role }, select: { id: true } });
    if (users.length === 0) return;
    await prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, message, link: link ?? null })),
    });
  } catch (err) {
    console.error('Failed to create role notifications:', err);
  }
}
