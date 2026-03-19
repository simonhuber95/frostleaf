import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '../auth';
import { fromNodeHeaders } from 'better-auth/node';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await getAuth().api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    req.userId = session.user.id;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication required' });
  }
}
