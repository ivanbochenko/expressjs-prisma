import express from 'express'
import { DB } from '../dbClient';
import { getDistance } from './utils';

const router = express.Router()

router.post('/', async (req, res) => {
  const db: DB = req.app.get('db')
  const { location, user_id, maxDistance } = req.body
  const date = new Date()
  date.setHours(0,0,0,0)
  const events = await db.event.findMany({
    where: {
      time: { gte: date },
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
      const distance = getDistance(location.latitude, location.longitude, e.latitude, e.longitude)
      return ({...e, distance})
    })
    // Exclude far away, user's own, swiped and full events
    .filter( e => (
      e.distance <= maxDistance &&
      (e?.author_id !== user_id) &&
      !(e?.matches.some((m) => m.user?.id === user_id)) &&
      e.matches.length < e.slots
    ))
  res.status(200).json(feed)
})

export default router

// import NodeCache from 'node-cache';

// Cache default time-to-live 3 min
// const stdTTL = 60 * 3
// const cache = new NodeCache({ stdTTL })
  // Try to get data from cache
  // let cachedEvents: Event[] | undefined = cache.get('events')
  // if (!cachedEvents) {
  //   cachedEvents = await db.event.findMany(eventsQuery())
  //   cache.set('events', cachedEvents)
  // }
  // const events = cachedEvents!

// const eventsTodayQuery = () => {
//   const date = new Date()
//   date.setHours(0,0,0,0)
//   return ({
//     where: {
//       time: {
//         gte: date
//       },
//     },
//     orderBy: {
//       author: {
//         rating: 'desc'
//       }
//     },
//     include: {
//       matches: {
//         include: {
//           user: true
//         }
//       },
//       author: true
//     }
//   })
// }