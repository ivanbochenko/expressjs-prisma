import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()
const secret = process.env.JWT_SECRET!

router.get('/newToken', async (req, res) => {
  const newToken = jwt.sign({
    id: "1011",
    email: "bochenkoivan@gmail.com",
    exp: getExpirationTime()
  }, secret )
  res.status(200).json({token: newToken})
})

router.post('/notification', async (req, res) => {
  const db = req.app.get('db')
  const { message, email } = req.body
  
  const user = await db.user.findUnique({
    where: {email}
  })

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({...message, to: user.token}),
  })
  res.status(200).json({success: true})
})

const getExpirationTime = () => Math.floor(Date.now() / 1000) + 86400 * 30