import express from "express"
import cors from 'cors'
import util from 'util'
import multer, { memoryStorage } from "multer"
import { graphQLServer } from './graphQLServer'
import loginRouter from './routes/login'
import devRouter from './routes/dev'
import { uploadToS3 } from './utils/upload'
import { verifyToken } from "./utils/token"

const app = express()
const port = process.env.PORT || 3000

const storage = memoryStorage()
const upload = multer({ storage }).single('file')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "text/html" }))

if(process.env.NODE_ENV === 'dev') {
  app.use('/dev', devRouter)
} else {
  app.all('*', (req, res, next) => {
    try {
      if (
        req.path === '/error'  ||
        req.path.startsWith('/login')
      ) return next();
      const token = req.headers['authorization']!
      const { id, email } = verifyToken(token)
      app.set('user_id', id)
      app.set('email', email)
      next()
    } catch (error) {
      res.status(401).json('Authorization error')
      console.error(error)
    }
  })
}

app.use('/graphql', graphQLServer)
app.use('/login', loginRouter)

app.post('/images', upload, async (req, res) => {
  const user_id = app.get('user_id')
  const { file } = req
  console.log(req.body)
  if (!file || !user_id) return res.status(400).json({ message: "Bad request" })

  const key = await uploadToS3(file, user_id)
  const imgUrl = new URL(key!, process.env.AWS_S3_LINK)
  const image = imgUrl.toJSON()
  return res.status(201).json({ image })
})

app.post('/error', (req, res) => {
  console.log('Client error: ' + util.inspect(req.body, false, null, true ))
  res.status(200).json({success: true})
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
