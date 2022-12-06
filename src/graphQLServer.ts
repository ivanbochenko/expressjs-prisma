import { createServer, createPubSub, pipe, filter } from '@graphql-yoga/node';
import { PrismaClient } from "@prisma/client";
import typeDefs from './typeDefs'

const pubSub = createPubSub()

const prisma = new PrismaClient()

export default createServer({
  maskedErrors: false,
  context: { pubSub, db: prisma },
  schema: {
    typeDefs,
    resolvers: {
      Query: {
        user: async (_, { id }, { db } ) => {
          const user = await db.user.findUnique({
            where: { id },
          })
          return user
        },
        event: async (_, { id }, { db } ) => {
          const event = await db.event.findUnique({
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
        events: async (_, { author_id }, { db } ) => {
          const events = await db.event.findMany({
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
        matches: async (_, { user_id }, { db } ) => {
          const event = await db.match.findMany({
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
        messages: async (_, { event_id }, { db } ) => {
          const messages = await db.message.findMany({
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
        reviews: async (_, { user_id }, { db } ) => {
          const reviews = await db.review.findMany({
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
        lastEvent: async (_, { author_id }, { db } ) => {
          const time = new Date()
          time.setHours(0,0,0,0)
          const events = await db.event.findFirst({
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
        postMessage: async (_, { text, author_id, event_id }, { pubSub, db } ) => {
          const message = await db.message.create({
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
        postReview: async (_, { text, stars, author_id, user_id }, { db } ) => {
          const review = await db.review.upsert({
            where: {
              id: author_id + user_id
            },
            create: {
              text,
              stars,
              author_id,
              user_id,
            },
            update: {
              text,
              stars
            }
          })
          const reviews = await db.review.findMany({
            where: {
              user_id
            }
          })
          const starsArr = reviews.map(r => r.stars)
          const sum = starsArr.reduce((a, b) => a + b, 0)
          const avg = Math.round(sum / starsArr.length) || 0
          await db.user.update({
            where: {
              id: user_id
            },
            data: {
              stars: avg
            }
          })
          return review
        },
        postEvent: async (_, { author_id, photo, title, text, slots, time, latitude, longitude }, { db } ) => {
          const event = await db.event.create({
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
        deleteEvent: async (_, { id }, { db } ) => {
          const event = await db.event.delete({ where: { id } })
          return event
        },
        editUser: async (_, { id, name, age, sex, bio, avatar }, { db } ) => {
          const user = await db.user.update({
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
        deleteUser: async (_, { id }, { db } ) => {
          const user = await db.user.delete({ where: { id } })
          return user
        },
        createMatch: async (_, { user_id, event_id }, { db } ) => {
          const match = await db.match.create({
            data: {
              user_id,
              event_id
            }
          })
          return match
        },
        acceptMatch: async (_, { id }, { db } ) => {
          const match = await db.match.update({
            where: {
              id
            },
            data: {
              accepted: true
            },
          })
          return match
        },
        deleteMatch: async (_, { id }, { db } ) => {
          const match = await db.match.delete({ where: {id} })
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
      },
    },
  },
})