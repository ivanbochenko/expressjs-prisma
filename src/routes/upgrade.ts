import express from 'express'
import { db } from '../dbClient'

const router = express.Router()

router.post('/', async (req, res) => {
  console.log("Upgrade")
  res.status(200)
})

export default router;