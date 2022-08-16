import express from "express";
import { PrismaClient } from "@prisma/client";
import { createServer } from '@graphql-yoga/node';
import auth from './auth';
import tokenRouter from './token'
import loginRouter from './login'
import s3urlRouter from './s3url'
import feedRouter from './feed'

const prisma = new PrismaClient()
const graphQLServer = createServer()

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }))
app.use('/graphql', graphQLServer)
app.use('/token', tokenRouter)
app.use('/login', loginRouter)
app.use('/feed', auth, feedRouter)
app.use('/s3url', auth, s3urlRouter)

app.get("/users/:id", auth, async (req, res) => {
  const id = req.params.id;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return res.json(user);
});

app.post("/user", auth, async (req, res) => {
  try {
    const { email, name, age } = req.body
    const user = await prisma.user.create({
      data: {
        email,
        name,
        age
      },
    });
    return res.json(user);
  } catch (error) {
    console.log(error);
  }
});

app.get("/events", auth, async (req, res) => {
  const events = await prisma.event.findMany()
  return res.json(events);
});

app.post('/event', auth, async (req, res) => {
  try {
    const { author_id, title, text, slots, photo, time, location } = req.body
    const event = await prisma.event.create({
      data: {
        author_id,
        title,
        text,
        slots,
        photo,
        time,
        latitude: location.latitude,
        longitude: location.longitude,
      }
    })
    return res.json(event)
  } catch (error) {
    console.log(error);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
