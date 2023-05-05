import express from 'express'
import { db } from './dbClient'
import { signToken } from './utils'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    res.status(200).json({message: 'hi'})
  } catch (error) {
    console.log(error)    
  }
})

router.post('/up', async (req, res) => {
  try {
    const { latitude, longitude } = req.body
    const events = await db.event.updateMany({
      where: { slots: 5 },
      data: {
        latitude,
        longitude
      }
    })
    res.status(200).json(events)
  } catch (error) {
    console.log(error)
  }
})

router.post('/new', async (req,res) => {
  const { id, email } = req.body
  const token = signToken({ id, email })
  res.status(200).json(token)
})

export default router;