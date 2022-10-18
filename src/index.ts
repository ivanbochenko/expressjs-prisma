import express from "express";
import { PrismaClient } from "@prisma/client";
import { createServer, createPubSub, pipe, filter } from '@graphql-yoga/node';
import auth from './auth';
import tokenRouter from './token'
import loginRouter from './login'
import s3urlRouter from './s3url'
import feedRouter from './feed'
import typeDefs from './typeDefs'

const prisma = new PrismaClient()

const pubSub = createPubSub()

const graphQLServer = createServer({
  maskedErrors: false,
  context: { pubSub, prisma },
  schema: {
    typeDefs,
    resolvers: {
      Query: {
        user: async (_, { id }, { prisma } ) => {
          const user = await prisma.user.findUnique({
            where: { id },
          })
          return user
        },
        event: async (_, { id }, { prisma } ) => {
          const event = await prisma.event.findUnique({
            where: { id },
            include: {
              author: true,
              matches: {
                where: {
                  accepted: true
                },
                select: {
                  id: true,
                  accepted: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    }
                  }
                }
              },
            }
          })
          return event
        },
        events: async (_, { author_id }, { prisma } ) => {
          const events = await prisma.event.findMany({
            where: { author_id },
            include: {
              author: true,
              matches: {
                where: {
                  accepted: true
                },
                select: {
                  id: true,
                  accepted: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    }
                  }
                }
              },
            }
          })
          return events
        },
        matches: async (_, { user_id }, { prisma } ) => {
          const event = await prisma.match.findMany({
            where: {
              user_id,
              accepted: true
            },
            include: {
              event: true
            }
          })
          return event
        },
        messages: async (_, { event_id }, { prisma } ) => {
          const messages = await prisma.message.findMany({
            where: {
              event_id
            },
            orderBy: {
              time: 'asc',
            },
            include: {
              author: true
            }
          })
          return messages
        },
        reviews: async (_, { user_id }, { prisma } ) => {
          const reviews = await prisma.review.findMany({
            where: {
              user_id
            },
            orderBy: {
              time: 'asc',
            },
            include: {
              author: true
            }
          })
          return reviews
        },
        lastEvent: async (_, { author_id }, { prisma } ) => {
          const time = new Date()
          time.setHours(0,0,0,0)
          const events = await prisma.event.findFirst({
            where: {
              author_id,
              time: {
                gt: time
              }
            },
            include: {
              author: true,
              matches: {
                where: {
                  accepted: false
                },
                select: {
                  id: true,
                  accepted: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    }
                  }
                }
              },
            }
          })
          return events
        }
      },
      Mutation: {
        postMessage: async (_, { text, author_id, event_id }, { pubSub, prisma } ) => {
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
        postReview: async (_, { text, stars, author_id, user_id }, { prisma } ) => {
          const time = new Date()
          time.setHours(0,0,0,0)
          const check = await prisma.review.findFirst({
            where: {
              author_id,
              time: {
                gt: time
              }
            }
          })
          if (check) return new Error('Oops!')
          const review = await prisma.review.create({
            data: {
              text,
              stars,
              author_id,
              user_id,
            }
          })
          const reviews = await prisma.review.findMany({
            where: {
              user_id
            }
          })
          const starsArr = reviews.map(r => r.stars)
          const sum = starsArr.reduce((a, b) => a + b, 0)
          const avg = Math.round(sum / starsArr.length) || 0
          const user = await prisma.user.update({
            where: {
              id: user_id
            },
            data: {
              stars: avg
            }
          })
          return review
        },
        postEvent: async (_, { author_id, photo, title, text, slots, time, latitude, longitude }, { prisma } ) => {
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
        deleteEvent: async (_, { id }, { prisma } ) => {
          const event = await prisma.event.delete({ where: { id } })
          return event
        },
        editUser: async (_, { id, name, age, sex, bio, avatar }, { prisma } ) => {
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
        deleteUser: async (_, { id }, { prisma } ) => {
          const user = await prisma.user.delete({ where: { id } })
          return user
        },
        createMatch: async (_, { user_id, event_id }, { prisma } ) => {
          const match = await prisma.match.create({
            data: {
              user_id,
              event_id
            }
          })
          return match
        },
        acceptMatch: async (_, { id }, { prisma } ) => {
          const match = await prisma.match.update({
            where: {
              id
            },
            data: {
              accepted: true
            },
          })
          return match
        },
        deleteMatch: async (_, { id }, { prisma } ) => {
          const match = await prisma.match.delete({ where: {id} })
          return match
        },
      },

      // Use pipe to filter messages by id of event you are subscribing to

      Subscription: {
        messages: {
          subscribe: async (_, { event_id }, { pubSub } ) =>
            pipe(
              pubSub.subscribe('newMessages'),
              filter(payload => payload.event_id == event_id)
            ),
          resolve: (value) => value
        },
        // matches: {
        //   subscribe: async (_, { event_id }, { pubSub } ) => 
        //     pipe(
        //       pubSub.subscribe('newMatches'),
        //       filter(payload => payload.event_id == event_id)
        //     ),
        //   resolve: (value) => value
        // },
      },
    },
  },
})

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.raw({ type: "application/vnd.custom-type" }))
app.use(express.text({ type: "text/html" }))
// Access db from routers, prevents creating multiple clients
app.set('prisma', prisma)
app.use('/token', tokenRouter)
app.use('/login', loginRouter)
app.use('/feed', auth, feedRouter)
app.use('/s3url', auth, s3urlRouter)
app.use('/graphql', graphQLServer)

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
