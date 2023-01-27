import { createServer, createPubSub, pipe, filter } from '@graphql-yoga/node'
import { PrismaClient } from "@prisma/client"
import { sendPushNotifications } from './utils'

const pubSub = createPubSub()

const prisma = new PrismaClient()

export const graphQLServer = createServer({
  maskedErrors: false,
  context: { pubSub, db: prisma },
  schema: {
    resolvers: {
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
          return {...user, reviews: user?.recievedReviews}
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
          const event = await db.event.findUnique({
            where: { id: event_id },
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
          // Notify users in chat
          const matchTokens = event?.matches.map(m => m.user.token)
          // Include event author
          matchTokens?.push(event?.author.token!)
          // Exclude message author
          const tokens = matchTokens?.filter(t => t !== message.author.token)
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
        deleteUser: async (_, { id }, { db } ) => {
          const user = await db.user.delete({ where: { id } })
          return user
        },
        createMatch: async (_, { user_id, event_id }, { db } ) => {
          const match = await db.match.create({
            data: {
              user_id,
              event_id
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
          await sendPushNotifications([match.event.author.token], {
            to: '',
            sound: 'default',
            title: 'You got a new match',
            body: match.user.name!,
          })
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
    typeDefs: `

      type User {
        id:         ID!
        created_at: DateTime!
        email:      String
        phone:      String
        name:       String
        bio:        String
        avatar:     String
        age:        Int
        stars:      Int
        sex:        String
        reviews:    [Review]
        messages:   [Message]
      }
    
      type Event {
        id:         ID!
        author_id:  ID!
        photo:      String!
        title:      String!
        text:       String
        slots:      Int
        time:       DateTime!
        latitude:   Float
        longitude:  Float
        matches:    [Match]
        author:     User
      }
    
      type Message {
        id:         ID!
        text:       String!
        time:       DateTime!
        author:     User!
      }
    
      type Match {
        id:         ID!
        user_id:    ID!
        event_id:   ID!
        accepted:   Boolean
        event:      Event!
        user:       User!
      }
    
      type Review {
        id:         ID!
        text:       String!
        time:       DateTime!
        stars:      Int!
        author:     User!
        user:       User!
      }
    
      scalar DateTime
    
      type Query {
        user(id: ID!):                User
        event(id: ID!):               Event
        events(author_id: ID!):       [Event]
        reviews(user_id: ID!):        [Review]
        messages(event_id: ID!):      [Message]
        matches(user_id: ID!):        [Match]
        lastEvent(author_id: ID!):    Event
      }
    
      type Mutation {
        postMessage(author_id: ID!, event_id: ID!, text: String!): Message!
        postReview(author_id: ID!, user_id: ID!, text: String!, stars: Int!): Review!
        postEvent(
          author_id: ID!,
          photo:     String!,
          title:     String!,
          text:      String!,
          slots:     Int!,
          time:      DateTime,
          latitude:  Float!,
          longitude: Float!
        ): Event!
        deleteEvent(id: ID!): Event!
        editUser(id: ID!, name: String!, age: Int!, sex: String!, bio: String, avatar: String): User!
        deleteUser(id: ID!): User
        createMatch(user_id: ID!, event_id: ID!): Match!
        acceptMatch(id: ID!): Match!
        deleteMatch(id: ID!): Match!
      }
    
      type Subscription {
        messages(event_id: ID!): Message!
      }
    `
  },
})