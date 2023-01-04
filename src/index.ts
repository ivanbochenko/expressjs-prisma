import express from "express"
import cors from 'cors'
import { PrismaClient } from "@prisma/client"
import { auth, generateUploadURL } from './utils'
import { graphQLServer } from './graphQLServer'
import loginRouter from './login'
import feedRouter from './feed'

const prisma = new PrismaClient()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.raw({ type: "application/vnd.custom-type" }))
app.use(express.text({ type: "text/html" }))
app.set('db', prisma) // Access db from routers

app.use('/login', loginRouter)
app.use('/feed', auth, feedRouter)
app.use('/graphql', auth, graphQLServer)

app.get('/s3url', auth, async (req, res) => {
  const url = await generateUploadURL()
  res.status(200).json(url)
})

app.post('/error', (req, res) => {
  const { error } = req.body
  console.log(`Client error: ${error}`)
  res.status(200)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
