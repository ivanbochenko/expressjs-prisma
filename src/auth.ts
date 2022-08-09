import jwt from 'jsonwebtoken';

// Authorization

const auth = (req, res, next) => {
  try {
    const { token } = req.body
    jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token error' })
  }
}

export default auth