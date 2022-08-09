import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
// Authorization

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body
    jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token error' })
  }
}

export default auth