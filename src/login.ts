import express from 'express'
import jwt from 'jsonwebtoken'
import axios from 'axios'

const router = express.Router()

const secret = process.env.JWT_SECRET ?? ''

router.post('/token', async (req, res) => {
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
  res.status(200).json({token: newToken, id: id})
})

router.post('/password', async (req, res) => {
  const { name, password } = req.body;
  if (name === process.env.ADMIN_NAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({
      id: 1,
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // Valid for 30 days
    }, process.env.JWT_SECRET ?? '', { algorithm: 'HS256' })
    res.status(200).json({token, id: 1, success: true})
  } else {
    res.status(200).json({success: false})
  }
})

// Create new user with facebook email

router.post('/facebook', async (req, res) => {
  const db = req.app.get('db')
  const { code, verifier } = req.body;
  const email = await getFacebookEmail(code, verifier)
  const user = await db.user.upsert({
    where: { email },
    update: { email },
    create: { email },
  })
  const id = user.id
  // Create JWT
  const token = jwt.sign({
    id,
    email,
    exp: Math.floor(Date.now() / 1000) + 86400 * 30, // Valid for 30 days
  }, process.env.JWT_SECRET ?? '', { algorithm: 'HS256' })
  res.status(200).json({token, id})
})

// For development

// router.get('/newToken', async (req, res) => {
//   const newToken = jwt.sign({
//     exp: Math.floor(Date.now() / 1000) + 86400 * 30,
//   }, secret )
//   res.status(200).json({token: newToken})
// })

export default router;

const getFacebookEmail = async (code: string, verifier: string) => {
  const link =
  "https://graph.facebook.com/oauth/access_token" +
  "?client_id=" + process.env.FACEBOOK_CLIENT_ID +
  "&redirect_uri=https://auth.expo.io/@" + process.env.EXPO_SLUG +
  "&client_secret=" + process.env.FACEBOOK_CLIENT_SECRET +
  "&grant_type=authorization_code" + 
  "&code_verifier=" + verifier +
  "&code=" + code;

  const { data: res } = await axios.get(link)
  const { data } = await axios.post(`https://graph.facebook.com/v14.0/me?fields=email&access_token=${res.access_token}`)

  return data.email
}