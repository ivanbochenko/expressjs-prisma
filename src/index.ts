import express from "express";
import { PrismaClient } from "@prisma/client";
import { createServer, createPubSub, pipe, filter, GraphQLYogaError } from '@graphql-yoga/node';
import auth from './auth';
import tokenRouter from './token'
import loginRouter from './login'
import s3urlRouter from './s3url'
import feedRouter from './feed'

// Todo: configure message subscriptions
// Transform date to string
// Figure out date

const prisma = new PrismaClient()

const pubSub = createPubSub()

const graphQLServer = createServer({
  maskedErrors: false,
  context: { pubSub, prisma },
  schema: {
    typeDefs: /* GraphQL */ `
      type User {
        id:         ID!
        created_at: String
        email:      String
        phone:      String
        name:       String
        bio:        String
        avatar:     String
        age:        Int
        messages:   [Message]
      }

      type Message {
        id:         ID!
        text:       String!
        time:       String
        author:     User!
      }

      type Event {
        id:         ID!
        author_id:  ID!
        photo:      String!
        title:      String!
        text:       String
        slots:      Int
        time:       String
        latitude:   Float
        longitude:  Float
      }

      type Query {
        user(id: ID!): User
        messages(event_id: ID!): [Message]
      }

      type Mutation {
        postMessage(author_id: ID!, event_id: ID!, text: String!): Message!
        postEvent(
          author_id: ID!,
          photo:     String!,
          title:     String!,
          text:      String!,
          slots:     Int!,
          time:      String,
          latitude:  Float!,
          longitude: Float!
        ): Event!
        editUser(id: ID!, name: String!, age: Int, bio: String, avatar: String): User!
      }
      
      type Subscription {
        messages(event_id: ID!): Message!
      }

    `,
    resolvers: {
      Query: {
        user: async (_, { id }, { prisma }, info) => {
          const user = await prisma.user.findUnique({ where: { id } })
          return user
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
        postEvent: async (_, { author_id, photo, title, text, slots, time, latitude, longitude }, { pubSub, prisma }, info) => {
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
        editUser: async (_, { id, name, age, bio, avatar }, { pubSub, prisma }, info) => {
          const user = await prisma.user.update({
            where: {
              id
            },
            data: {
              name,
              bio,
              avatar,
              age,
            }
          })
          return user
        }
      },

      // Use pipe to filter messages by id of event you are subscribing to

      Subscription: {
        messages: {
          subscribe: async (_, { event_id }, { pubSub, prisma }, info) => 
            pipe(
              pubSub.subscribe('newMessages'),
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
app.use('/graphql', graphQLServer)
app.use('/token', tokenRouter)
app.use('/login', loginRouter)
app.use('/feed', auth, feedRouter)
app.use('/s3url', auth, s3urlRouter)

app.get("/events", auth, async (req, res) => {
  const events = await prisma.event.findMany()
  return res.json(events);
});

app.post("/user", auth, async (req, res) => {
  const { email, name } = req.body
  const user = await prisma.user.upsert({
    where: { email },
    update: { email, name },
    create: { email, name },
  })
  return res.json(user);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
