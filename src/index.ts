import express from "express";
import { PrismaClient } from "@prisma/client";
import { createServer, createPubSub, pipe, filter } from '@graphql-yoga/node';
import auth from './auth';
import tokenRouter from './token'
import loginRouter from './login'
import s3urlRouter from './s3url'
import feedRouter from './feed'
import typeDefs from './typeDefs'

// Todo: configure message subscriptions
// Transform date to string

const prisma = new PrismaClient()

const pubSub = createPubSub()

const graphQLServer = createServer({
  maskedErrors: false,
  context: { pubSub, prisma },
  schema: {
    typeDefs,
    resolvers: {
      Query: {
        user: async (_, { id }, { prisma }, info) => {
          const user = await prisma.user.findUnique({ where: { id } })
          return user
        },
        eventsToday: async (_, { author_id }, { prisma }, info) => {
          const date = new Date()
          date.setHours(0,0,0,0)
          const event = await prisma.event.findMany({
            where: {
              author_id,
              time: {
                gte: date
              }
            },
            include: {
              matches: true
            }
          })
          return event
        },
        messages: async (_, { event_id }, { prisma }, info) => {
          const messages = await prisma.message.findMany({
            where: {
              event_id
            },
            include: {
              author: true
            }
          })
          return messages
        }
      },
      Mutation: {
        postMessage: async (_, { text, author_id, event_id }, { pubSub, prisma }, info) => {
          const message = await prisma.message.create({
            data: {
              text,
              author_id,
              event_id,
            },
            include: {
              author: true
            }
          })
          pubSub.publish('newMessages', message)
          return message
        },
        postEvent: async (_, { author_id, photo, title, text, slots, time, latitude, longitude }, { prisma }, info) => {
          const event = await prisma.event.create({
            data: {
              author_id,
              photo,
              title,
              text,
              slots,
              time,
              latitude,
              longitude,
            }
          })
          return event
        },
        editUser: async (_, { id, name, age, sex, bio, avatar }, { prisma }, info) => {
          const user = await prisma.user.update({
            where: {
              id
            },
            data: {
              name,
              age,
              sex,
              bio,
              avatar,
            }
          })
          return user
        },
        createMatch: async (_, { user_id, event_id }, { prisma, pubSub }, info) => {
          const match = await prisma.match.create({
            data: {
              user_id,
              event_id
            },
          })
          pubSub.publish('newMatches', match)
          return match
        }
      },

      // Use pipe to filter messages by id of event you are subscribing to

      Subscription: {
        messages: {
          subscribe: async (_, { event_id }, { pubSub }, info) =>
            pipe(
              pubSub.subscribe('newMessages'),
              filter(payload => payload.event_id == event_id)
            ),
          resolve: (value) => value
        },
        matches: {
          subscribe: async (_, { event_id }, { pubSub }, info) => 
            pipe(
              pubSub.subscribe('newMatches'),
              filter(payload => payload.event_id == event_id)
            ),
          resolve: (value) => value
        },
      },      
    },
  },
})

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.raw({ type: "application/vnd.custom-type" }))
app.use(express.text({ type: "text/html" }))
app.set('prisma', prisma) // Access db from routers
app.use('/token', tokenRouter)
app.use('/login', loginRouter)
app.use('/feed', auth, feedRouter)
app.use('/s3url', auth, s3urlRouter)
app.use('/graphql', auth, graphQLServer)

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
