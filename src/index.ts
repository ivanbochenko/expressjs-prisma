import express from "express"
import cors from 'cors'
import util from 'util'
// import { cwd } from 'process'
import multer, { memoryStorage } from "multer"
import { generateUploadURL } from './utils/uploadUrl'
import { auth } from './utils/auth'
import { graphQLServer } from './graphQLServer'
import loginRouter from './login'
import devRouter from './dev'
import { uploadToS3 } from './utils/upload'

const app = express()
const port = process.env.PORT || 3000

const storage = memoryStorage()
const upload = multer({ storage })

app.use(cors())
app.use(express.json())
app.use(express.raw({ type: "application/vnd.custom-type" }))
app.use(express.text({ type: "text/html" }))

if(process.env.NODE_ENV === 'dev') {
  app.use('/dev', devRouter)
} else {
  app.all('*', auth)
}

app.use('/graphql', graphQLServer)
app.use('/login', loginRouter)

app.get('/s3url', async (req, res) => {
  res.status(200).json(await generateUploadURL())
})

app.post('/images', upload.single("image"), async (req, res) => {
  const user_id = res.locals.user.id
  const { file } = req
  if (!file || !user_id) return res.status(400).json({ message: "Bad request" })

  const key = await uploadToS3(file, user_id)
  if (!key) return res.status(500).json({ message: 'Server error' })

  const imgUrl = new URL(key + '.jpg', process.env.AWS_S3_LINK)
  return res.status(201).json({avatar: imgUrl.toJSON()})
})

app.post('/error', (req, res) => {
  console.log('Client error: ' + util.inspect(req.body, false, null, true ))
  res.status(200).json({success: true})
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
  // console.log(`Current directory: ${cwd()}`)
})
