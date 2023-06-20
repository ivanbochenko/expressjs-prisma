import express from 'express'
import bcrypt from 'bcrypt'
import { db } from '../utils/dbClient'
import { signToken } from '../utils/token'

const router = express.Router()

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

export default router;