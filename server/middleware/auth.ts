import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

export interface AuthedRequest extends Request {
  userId?: string;
  userRole?: 'Student' | 'Counselor' | 'Admin';
}

/** Requires a valid Bearer token. Rejects with 401 otherwise. */
export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const token = header.slice('Bearer '.length);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

/** Allows only the given roles. Use after requireAuth. */
export function requireRole(...roles: Array<'Student' | 'Counselor' | 'Admin'>) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Not permitted for this role' });
    }
    next();
  };
}
