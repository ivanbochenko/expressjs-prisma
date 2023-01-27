import express from 'express'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import bcrypt from 'bcrypt'

const router = express.Router()

const secret = process.env.JWT_SECRET!
const valid = 30 // Token valid for 30 days

router.post('/', async (req, res) => {
  const db = req.app.get('db')
  const { token, pushToken } = req.body
  const { id, email, pushToken: prevPushToken }: any = jwt.verify(token, secret)

  // Update push notifications token
  if (prevPushToken !== pushToken) {
    const user = await db.user.upsert({
      where: {id},
      update: {token: pushToken},
      create: {token: pushToken},
    })
  }

  // Refresh JWT
  const newToken = jwt.sign({
    id,
    email,
    pushToken,
    exp: getExpirationTime()
  }, secret, { algorithm: 'HS256' } )

  // send JWT in response to the client
  res.status(200).json({token: newToken, id})
})

router.post('/password', async (req, res) => {
  const { email, password } = req.body
  const db = req.app.get('db')
  const user = await db.user.findUnique({
    where: {
      email
    }
  })
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({
      id: user.id,
      email: user.email,
      exp: getExpirationTime() 
    }, secret, { algorithm: 'HS256' })
    res.status(200).json({token, id: user.id, success: true})
  } else {
    res.status(200).json({success: false})
  }
})

// Create new user with facebook email

router.post('/facebook', async (req, res) => {
  const db = req.app.get('db')
  const { code, verifier, pushToken } = req.body
  const email = await getFacebookEmail(code, verifier)
  const user = await db.user.upsert({
    where: { email },
    update: { email, token: pushToken },
    create: { email, token: pushToken },
  })
  const id = user.id
  // Create JWT
  const token = jwt.sign({
    id,
    email,
    exp: getExpirationTime()
  }, secret, { algorithm: 'HS256' })
  res.status(200).json({token, id})
})

router.post('/reset', async (req, res) => {
  const db = req.app.get('db')
  const { id }: any = jwt.verify(req.headers['authorization']!, secret)
  const password = bcrypt.hashSync(req.body.password, 8)
  const user = await db.user.update({
    where: { id },
    data: {
      password
    }
  })
  res.status(200).json({succes: true})
})

export default router;

const getExpirationTime = () => Math.floor(Date.now() / 1000) + 86400 * valid

const getFacebookEmail = async (code: string, verifier: string) => {
  const baseUrl = 'https://graph.facebook.com'
  const expoUrl = 'https://auth.expo.io/@'
  const link = new URL('oauth/access_token', baseUrl)

  link.searchParams.set("client_id", process.env.FACEBOOK_CLIENT_ID! )
  link.searchParams.set("redirect_uri", expoUrl + process.env.EXPO_SLUG )
  link.searchParams.set("client_secret", process.env.FACEBOOK_CLIENT_SECRET! )
  link.searchParams.set("grant_type", 'authorization_code' )
  link.searchParams.set("code_verifier", verifier )
  link.searchParams.set("code", code )

  const { access_token } = (await axios.get(link.toString())).data
  const { data } = await axios.post(
    `https://graph.facebook.com/v14.0/me?fields=email&access_token=${access_token}`
  )

  return data.email
}