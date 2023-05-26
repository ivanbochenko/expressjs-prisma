import express from 'express'
import { db } from '../dbClient'

const router = express.Router()

// router.all('*', async (req, res, next) => {
// })

router.post('/event', async (req, res) => {
  const { id } = req.app.get('user')
  const { event_id, reason, text } = req.body
  
  const report = await db.report.create({
    data: {
      author_id: id,
      event_id,
      reason,
      text,
    }
  })
  res.status(200).json({success: true})
})

router.post('/user', async (req, res) => {
  const { id } = req.app.get('user')
  const { user_id, reason, text } = req.body
  
  const report = await db.report.create({
    data: {
      author_id: id,
      user_id,
      reason,
      text,
    }
  })
  res.status(200).json({success: true})
})

export default router;