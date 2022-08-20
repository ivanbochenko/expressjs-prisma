import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()

const secret = process.env.JWT_SECRET ?? ''

// Authentication

router.post('/', async (req, res) => {
  try {
    if (!req.body.token) return res.json( null );
    const { token } = req.body;
    const { id, phone }: any = jwt.verify(token, secret);
    // Refresh JWT
    const newToken = jwt.sign({
      id,
      phone,
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // Valid for 30 days
    }, secret )
    // send JWT in response to the client
    res.status(200).json({token: newToken, id: id});
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
})

export default router;