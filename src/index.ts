import express from "express"
import { PrismaClient } from "@prisma/client"
import auth from './auth'
import graphQLServer from './graphQLServer'
import loginRouter from './login'
import s3urlRouter from './s3url'
import feedRouter from './feed'

const prisma = new PrismaClient()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.raw({ type: "application/vnd.custom-type" }))
app.use(express.text({ type: "text/html" }))
app.get('/error', (req, res) => {
  console.log(`Error`)
  res.status(500).send('Server error')
})
app.set('prisma', prisma) // Access db from routers
app.use('/login', loginRouter)
app.use('/feed', auth, feedRouter)
app.use('/s3url', auth, s3urlRouter)
app.use('/graphql', graphQLServer)

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
