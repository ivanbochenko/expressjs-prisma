import express from 'express'
import bcrypt from 'bcrypt'
import { db } from '../dbClient'

const router = express.Router()

router.all('*', async (req, res, next) => {
  const user_id = req.app.get('user_id')
  const { password } = req.body
  const user = await db.user.findUnique({ where: { id: user_id } })
  req.app.set('user', user)
  const isCorrectPassword = bcrypt.compareSync(password, user?.password!)
  if (isCorrectPassword) return next()
  return res.status(400).json({success: false, message: 'Wrong password'})
})

router.post('/reset', async (req, res) => {
  const user_id = req.app.get('user_id')
  const { password } = req.body
  const newPassword = bcrypt.hashSync(password, 8)
  await db.user.update({
    where: { id: user_id },
    data: { password: newPassword }
  })
  res.status(200).json({success: true})
})

router.post('/user/delete', async (req, res) => {
  const user_id = req.app.get('user_id')
  await db.user.delete({ where: { id: user_id } })
  res.status(200).json({success: true})
})

export default router;