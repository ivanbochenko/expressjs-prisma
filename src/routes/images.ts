import { uploadToS3 } from '../utils/upload'
import express from 'express'
import { convert, isSafe } from "../utils/NSFW"

const router = express.Router()

router.post('/', async (req, res) => {
  const user_id = req.app.get('user_id')
  const { file } = req
  if (!file || !user_id) return res.status(400).json({ message: "Bad request" })
  const model = req.app.get('model')
  const suspect = convert(file?.buffer!)
  const predictions = await model.classify(suspect)
  const safe = isSafe(predictions)
  suspect.dispose()
  if (safe) {
    const key = await uploadToS3(file, user_id)
    const imgUrl = new URL(key!, process.env.AWS_S3_LINK)
    const image = imgUrl.toJSON()
    return res.status(201).json({ image })
  } else {
    return res.status(400).json({ message: "Inappropriate image" })
  }
})

export default router;
