import express from "express";
import { PrismaClient } from "@prisma/client";
import { createServer, createPubSub } from '@graphql-yoga/node';
import auth from './auth';
import tokenRouter from './token'
import loginRouter from './login'
import s3urlRouter from './s3url'
import feedRouter from './feed'

// Todo: configure message subscriptions

const prisma = new PrismaClient()

const pubSub = createPubSub()

const graphQLServer = createServer({
  context: { pubSub, prisma },
  schema: {
    typeDefs: /* GraphQL */ `
      type User {
        id:         String!
        email:      String
        phone:      String
        name:       String
        bio:        String
        avatar:     String
        age:        Int
        messages:   [Message]
      }

      type Message {
        id:         String!
        text:       String!
        time:       String!
        author:  User!
      }

      type Event {
        id:         String!
        author_id:  User!
        photo:      String
        title:      String
        text:       String
        slots:      Int
        date:       String
        time:       String
        latitude:   Float
        longitude:  Float
      }

      type Query {
        user(id: String!): User
        messages(event_id: String!): [Message]
      }

      type Mutation {
        postMessage(text: String!, author_id: String!, event_id: String!): Message!
        postEvent(
          author_id: String!,
          photo: String!,
          title: String!,
          text: String!,
          slots: Int!,
          time: String!,
          latitude: Float!,
          longitude: Float!
        ): Event!
        editUser(name: String!, age: Int!, bio: String!, avatar: String!): User!
      }
      


    `,
    resolvers: {
      Query: {
        user: async (obj, args, context, info) => await context.prisma.user.findUnique({
          where: {id: args.id}
        }),
        messages: async (obj, args, context, info) => {
          const messages = await context.prisma.message.findMany({
            where: {
              event_id: args.event_id
            },
            include: {
              author: true
            }
          })
          return messages
        }
      },
      Mutation: {
        postMessage: async (obj, args, context, info) => {
          const message = await context.prisma.message.create({
            data: {
              text: args.text,
              author_id: args.author_id,
              event_id: args.event_id,
            }
          })
          // context.pubSub.publish("newMessage", {
          //   newMessage: message,
          //   event
          // })
          return message
        },
        postEvent: async (obj, args, context, info) => await context.prisma.event.create({
          data: {
            author_id: args.author_id,
            photo: args.photo,
            title: args.title,
            text: args.text,
            slots: args.slots,
            time: args.time,
            latitude: args.latitude,
            longitude: args.longitude,
          }
        }),
        editUser: async (obj, args, context, info) => await context.prisma.user.update({
          where: {
            id: args.id
          },
          data: {
            name: args.name,
            bio: args.bio,
            avatar: args.avatar,
            age: args.age,
          }
        }),
      },
      // Subscription: {
      //   messages: {
      //     subscribe: async (_: any, { from }: any) => {
      //       const channel = Math.random().toString(36).slice(2, 15);
            
      //       onMessagesUpdates(() => pubSub.publish(channel, { messages }))
      //       pubSub.publish(channel, { messages })
      //       return pubSub.asyncIterator(channel)
      //     },
      //   },
      // },
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
