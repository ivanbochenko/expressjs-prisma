import express from "express"
import cors from 'cors'
import util from 'util'
import { auth, generateUploadURL } from './utils'
import { graphQLServer } from './graphQLServer'
import loginRouter from './login'
import { cwd } from 'process';

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.raw({ type: "application/vnd.custom-type" }))
app.use(express.text({ type: "text/html" }))

if(process.env.NODE_ENV !== 'dev') {
  app.all('*', auth)
} 

app.use('/graphql', graphQLServer)
app.use('/login', loginRouter)

app.get('/s3url', async (req, res) => {
  res.status(200).json(await generateUploadURL())
})

app.post('/error', (req, res) => {
  console.log('Client error: ' + util.inspect(req.body, false, null, true ))
  res.status(200).json({success: true})
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
  console.log(`Current directory: ${cwd()}`);
})
