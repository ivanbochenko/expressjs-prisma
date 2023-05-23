import express from 'express'
import bcrypt from 'bcrypt'
import { db } from '../dbClient'
import { signToken } from '../utils/token'
import { sendEmail } from '../utils/mail'
import { convert, isSafe } from '../utils/NSFW'

const router = express.Router()

router.post('/', async (req, res) => {
  res.status(200).json({message: 'hi'})
})

router.post('/up', async (req, res) => {
  const { latitude, longitude } = req.body
  const events = await db.event.updateMany({
    where: { slots: 5 },
    data: {
      latitude,
      longitude
    }
  })
  res.status(200).json(events)
})

router.post('/del', async (req, res) => {
  const { user_id } = req.body
  const events = await db.match.deleteMany({
    where: { user_id }
  })
  res.status(200).json(events)
})

router.post('/new', async (req,res) => {
  const { id } = req.body
  const token = signToken({ id })
  res.status(200).json(token)
})

router.post('/pass', async (req, res) => {
  const password = '123'
  const hashPassword = bcrypt.hashSync(password, 8)
  console.log(hashPassword)
})

router.post('/mail', async (req, res) => {
  const { email, password } = req.body
  const hashPassword = bcrypt.hashSync(password, 8)
  const user = await db.user.update({
    where: { email },
    data: { password: hashPassword }
  })
  const subject = 'Woogie password reset'
  sendEmail(email, subject, {name: user?.name!, password })
  res.status(200).json({ success: true })
})

router.post('/photo', async (req, res) => {
  const { file } = req
  const model = req.app.get('model')
  const suspect = convert(file?.buffer!)
  const predictions = await model.classify(suspect)
  const safe = isSafe(predictions)
  suspect.dispose()
  
  res.status(200).json({ safe, predictions })
})

export default router;