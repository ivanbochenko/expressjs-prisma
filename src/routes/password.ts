import express from 'express'
import bcrypt from 'bcrypt'
import { db } from '../dbClient'

const router = express.Router()

router.all('*', async (req, res, next) => {
  const { id } = req.app.get('user')
  const { password } = req.body
  const user = await db.user.findUnique({ where: { id } })
  req.app.set('user', user)
  const isCorrectPassword = bcrypt.compareSync(password, user?.password!)
  if (isCorrectPassword) return next()
  return res.status(400).json({success: false, message: 'Wrong password'})
})

router.post('/reset', async (req, res) => {
  const { id } = req.app.get('user')
  const { newPassword } = req.body
  const password = bcrypt.hashSync(newPassword, 8)
  await db.user.update({
    where: { id },
    data: { password }
  })
  res.status(200).json({success: true})
})

router.post('/user/delete', async (req, res) => {
  const { id } = req.app.get('user')
  await db.user.delete({ where: { id } })
  res.status(200).json({success: true})
})

export default router;