import express from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { db } from '../dbClient'
import { signToken, verifyToken } from '../utils/token'
import { sendEmail } from '../utils/mail'

const router = express.Router()

router.post('/', async (req, res) => {
  const { token: oldToken, pushToken } = req.body
  const { pushToken: oldPushToken, id } = verifyToken(oldToken)

  if (oldPushToken !== pushToken) {
    const user = await db.user.update({
      where: {id},
      data: {token: pushToken},
    })
  }
  const token = signToken({id, pushToken})
  res.status(200).json({token, id})
})

router.post('/password', async (req, res) => {
  const { email, password } = req.body
  const user = await db.user.findUnique({
    where: { email }
  })

  const isCorrectPassword = bcrypt.compareSync(password, user?.password!)

  if (user && isCorrectPassword) {
    const token = signToken({
      id: user.id,
      email: user.email!,
    })
    res.status(200).json({token, id: user.id, success: true})
  } else {
    res.status(400).json({success: false})
  }
})

router.post('/register', async (req, res) => {
  const { email, pushToken, password } = req.body
  if (!email || !pushToken || !password) {
    return res.status(200).json({success: false, message: 'Bad request data'})
  }
  const hashPassword = bcrypt.hashSync(password, 8)
  const userCount = await db.user.count({ where: { email } })

  if (userCount > 0) {
    res.status(200).json({success: false, message: 'User already exists'})
  } else {
    const user = await db.user.create({
      data: { email, token: pushToken, password: hashPassword },
    })
    const token = signToken({
      id: user.id,
      email: user.email!,
    })

    res.status(200).json({token, id: user.id, success: true})
  }
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
    return res.status(400).json({success: false, message: 'User does not exist'})
  }
  const subject = 'Woogie password reset'
  sendEmail(email, subject, {name: updatedUser?.name!, password })
  res.status(200).json({success: true})
})

router.post('/reset', async (req, res) => {
  const { id, password } = req.body
  const user = await db.user.findUnique({ where: { id } })
  if (!bcrypt.compareSync(password, user?.password!)) {
    return res.status(400).json({success: false, message: 'Wrong password'})
  }
  const newPassword = bcrypt.hashSync(password, 8)
  const updatedUser = await db.user.update({
    where: { id },
    data: { password: newPassword }
  })
  res.status(200).json({success: true})
})

router.post('/delete', async (req, res) => {
  const { id, password } = req.body
  const user = await db.user.findUnique({ where: { id } })
  if (!bcrypt.compareSync(password, user?.password!)) {
    return res.status(400).json({success: false, message: 'Wrong password'})
  }
  const deletedUser = await db.user.delete({ where: {id} })
  res.status(200).json({success: true})
})

export default router;