import express from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { db } from '../utils/dbClient'
import { signToken, verifyToken } from '../utils/token'
import { sendEmail } from '../utils/mail'

const router = express.Router()

router.post('/', async (req, res) => {
  const oldToken = req.body.token
  const { id } = verifyToken(oldToken)
  const token = signToken({id})
  res.status(200).json({token, id})
})

router.post('/password', async (req, res) => {
  const { email, password, pushToken } = req.body
  const user = await db.user.update({
    where: { email },
    data: { token: pushToken ?? '' }
  })
  const isCorrectPassword = bcrypt.compareSync(password, user?.password!)
  if (!user || !isCorrectPassword) {
    return res.status(400).send(!user ? 'No such user' : 'Wrong password')
  }
  const token = signToken({
    id: user.id,
    email: user.email!,
  })
  res.status(200).json({token, id: user.id, success: true})
})

// const user = await db.user.update({
//   where: {id},
//   data: {token: pushToken},
// })

router.post('/register', async (req, res) => {
  const { email, password, pushToken } = req.body
  if (!email || !password) {
    return res.status(400).send('Bad request data')
  }
  const userCount = await db.user.count({ where: { email } })
  if (userCount > 0) {
    return res.status(400).send('User already exists')
  }
  const user = await db.user.create({
    data: {
      email,
      token: pushToken ?? '',
      password: bcrypt.hashSync(password, 8)
    },
  })
  const token = signToken({
    id: user.id,
    email: email,
  })
  res.status(200).json({token, id: user.id, success: true})
})

router.post('/restore', async (req, res) => {
  const { email } = req.body
  const hex = crypto.randomBytes(8).toString('hex')
  const password = bcrypt.hashSync(hex, 8)
  const updatedUser = await db.user.update({
    where: { email },
    data: { password }
  })
  if (!updatedUser) {
    return res.status(400).send('User does not exist')
  }
  const subject = 'Woogie password reset'
  sendEmail(email, subject, {name: updatedUser?.name!, password })
  res.status(200).json({success: true})
})

export default router;