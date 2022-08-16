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
    // Refresh the JWT for the user so they only get logged out after SESSION_LENGTH_IN_DAYS of inactivity
    const newToken = jwt.sign({
      id,
      phone,
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
    }, secret )
    // send JWT in response to the client, necessary for API requests to Hasrua
    res.status(200).json({token: newToken, id: id});
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
})

export default router;