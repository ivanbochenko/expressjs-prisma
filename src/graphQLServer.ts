import { readFileSync } from 'node:fs'
import { createServer, pipe, filter, createPubSub } from '@graphql-yoga/node'
import { getDistance } from './utils/distance'
import { sendPushNotifications } from './utils/notifications'
import { Resolvers } from '../resolvers-types'
import { db } from './utils/dbClient'

const HOURS_EVENT_LAST = 24
const bridge = () => new Date(new Date().getTime() - 3600000 * HOURS_EVENT_LAST)

const resolvers: Resolvers = {
  Query: {
    user: async (_, { id }, { db } ) => {
      const user = await db.user.findUnique({
        where: { id },
        include: {
          recievedReviews: {
            include: {
              author: true
            }
          }
        }
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
            include: {
              user: true
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
            include: {
              user: true
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
      const events = await db.event.findFirst({
        where: {
          author_id,
          time: { gt: bridge() }
        },
        include: {
          author: true,
          matches: {
            where: {
              accepted: false,
              dismissed: false
            },
            include:{
              user: true
            }
          },
        }
      })
      return events
    },
    feed: async (_, { latitude, longitude, user_id, maxDistance }, { db }) => {
      const blocked = (await db.user.findUnique({
        where: { id: user_id },
        select: { blocked: true }
      }))?.blocked
      const events = await db.event.findMany({
        where: {
          time: { gte: bridge() },
          author_id: {
            notIn: blocked
          }
        },
        orderBy: {
          author: { rating: 'desc' }
        },
        include: {
          matches: {
            where: {
              OR: [
                { accepted: true, },
                { user: { id: user_id } },
              ],
            },
            include: { user: true }
          },
          author: true
        }
      })
      const feed = events
        // Calculate distance to events
        .map( e => {
          const distance = getDistance(latitude, longitude, e.latitude, e.longitude)
          return ({...e, distance})
        })
        // Exclude far away, user's own, blocked, swiped and full events
        .filter( e => (
          (e.distance <= maxDistance) &&
          (e?.author_id !== user_id) &&
          !e?.author.blocked.includes(user_id) &&
          (!e?.matches.some(m => m.user?.id === user_id)) &&
          (e.matches.length < e.slots)
        ))
      return feed
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
      const matches = await db.match.findMany({
        where: {
          event_id
        },
        include: {
          user: true,
        }
      })
      // Get tokens
      const tokens = matches.map((m) => m.user.token)
      // Include event author
      const event = await db.event.findUnique({
        where: { id: event_id },
        include: { author: true }
      })
      tokens.push(event!.author.token)
      // Exclude message author
      const index = tokens.indexOf(message.author.token)
      if (index > -1) {
        tokens.splice(index, 1)
      }
      // Notify users in chat
      if (tokens) {
        await sendPushNotifications(tokens, {
          to: '',
          sound: 'default',
          title: message.author.name!,
          body: text,
        })
      }
      return message
    },
    postReview: async (_, { text, stars, author_id, user_id }, { db } ) => {
      const prevReview = (await db.review.findMany({
        where: {
          user_id,
          author_id
        }
      }))[0]

      let review
      if (prevReview) {
        review = await db.review.update({
          where: {
            id: prevReview.id,
          },
          data: {
            text,
            stars,
          },
        })
      } else {
        review = await db.review.create({
          data: {
            text,
            stars,
            author_id,
            user_id
          }
        })
      }
      const reviews = await db.review.findMany({
        where: {
          user_id
        }
      })

      const starsArr = reviews.map(r => r.stars)
      const sum = starsArr.reduce((a, b) => a + b, 0)
      const avg = Math.round(sum / starsArr.length) || 0
      const rating = Math.round((sum / starsArr.length) / 2.5 * starsArr.length)
      await db.user.update({
        where: {
          id: user_id
        },
        data: {
          stars: avg,
          rating
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
      // Notify nearby users
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
    createMatch: async (_, { user_id, event_id, dismissed }, { db } ) => {
      const match = await db.match.create({
        data: {
          user_id,
          event_id,
          dismissed
        },
        include: {
          user: true,
          event: {
            include: {
              author: true
            }
          }
        }
      })
      if (!dismissed) {
        await sendPushNotifications([match.event.author.token], {
          to: '',
          sound: 'default',
          title: 'You got a new match',
          body: match.user.name!,
        })
      }
      return match
    },
    acceptMatch: async (_, { id }, { db } ) => {
      const match = await db.match.update({
        where: { id },
        data: { accepted: true },
        include: {
          user: true,
          event: true
        }
      })
      await sendPushNotifications([match.user.token], {
        to: '',
        sound: 'default',
        title: 'You matched to event',
        body: match.event.title,
      })
      return match
    },
    deleteMatch: async (_, { id }, { db } ) => {
      const match = await db.match.delete({ where: {id} })
      return match
    },
    block: async (_, { id, user_id }, { db }) => {
      const user = await db.user.update({
        where: { id },
        data: {
          blocked: {
            push: user_id,
          },
        },
      })
      return user.blocked
    }
  },

  // Use pipe to filter messages by id of event you are subscribing to

  Subscription: {
    messages: {
      subscribe: async (_, { event_id }, { pubSub } ) =>
        pipe(
          pubSub.subscribe('newMessages'),
          filter((payload) => payload.event_id == event_id)
        ),
      resolve: (value: any) => value
    },
  },
}

const typeDefs = readFileSync('./src/schema.graphql', 'utf8')
const pubSub = createPubSub()

export const graphQLServer = createServer({
  maskedErrors: false,
  logging: true,
  context: {
    db,
    pubSub
  },
  schema: {
    resolvers,
    typeDefs
  },
})