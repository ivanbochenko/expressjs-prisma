import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './token';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      req.path == '/error'  ||
      req.path.startsWith('/login')
    ) return next();
    const token = req.headers['authorization']!
    const { id, email } = verifyToken(token)
    res.locals.user = { id, email }
    next()
  } catch (error) {
    res.status(401).json('Authorization error')
    console.error(error)
  }
}