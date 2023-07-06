import { readFileSync } from 'node:fs'
import { createSchema, createYoga, createPubSub } from 'graphql-yoga'
import { getDistance, dateShiftHours } from './utils/calc'
import { sendPushNotifications } from './utils/notifications'
import { Resolvers } from '../resolvers-types'
import { db } from './utils/dbClient'
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse'

const pubSub = createPubSub<{
  newMessages: [event_id: string, payload: any]
}>()

const resolvers: Resolvers = {
  Query: {
    user: async (_, { id } ) => {
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
    event: async (_, { id } ) => {
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
    events: async (_, { author_id } ) => {
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
    matches: async (_, { user_id } ) => {
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
    messages: async (_, { event_id } ) => {
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
    reviews: async (_, { user_id } ) => {
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
    lastEvent: async (_, { author_id } ) => {
      const events = await db.event.findFirst({
        where: {
          author_id,
          time: { gt: dateShiftHours(new Date(), -24) }
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
    feed: async (_, { latitude, longitude, user_id, maxDistance }) => {
      const blocked = (await db.user.findUnique({
        where: { id: user_id },
        select: { blocked: true }
      }))?.blocked
      const events = await db.event.findMany({
        where: {
          time: { gte: dateShiftHours(new Date(), -24) },
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
    postMessage: async (_, { text, author_id, event_id } ) => {
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
      pubSub.publish('newMessages', event_id, message)
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
    postReview: async (_, { text, stars, author_id, user_id } ) => {
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
    postEvent: async (_, { author_id, photo, title, text, slots, time, latitude, longitude } ) => {
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
    deleteEvent: async (_, { id } ) => await db.event.delete({ where: { id } }),
    editUser: async (_, { id, name, age, sex, bio, avatar } ) => {
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
    createMatch: async (_, { user_id, event_id, dismissed } ) => {
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
    acceptMatch: async (_, { id } ) => {
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
    deleteMatch: async (_, { id } ) => await db.match.delete({ where: {id} }),
    block: async (_, { id, user_id }) => {
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

  Subscription: {
    messages: {
      subscribe: async (_, { event_id } ) => pubSub.subscribe('newMessages', event_id),
      resolve: (payload: any) => payload
    },
  },
}

const typeDefs = readFileSync('./src/schema.graphql', 'utf8')

export const schema = createSchema({ typeDefs, resolvers })

export const yoga = createYoga({ schema, plugins: [useGraphQLSSE()] })
