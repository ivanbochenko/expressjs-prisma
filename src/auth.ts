import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Authorization

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['authorization'] ?? ''
    jwt.verify(token, process.env.JWT_SECRET ?? '')
    next()
  } catch (error) {
    res.status(401).json({ message: 'Authorization error' })
    console.log(error)
  }
}

export default auth