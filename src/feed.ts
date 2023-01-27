import express from 'express'
import NodeCache from 'node-cache';

const router = express.Router()

// Cache default time-to-live 3 min
const stdTTL = 60 * 3
const cache = new NodeCache({ stdTTL })

router.post('/', async (req, res) => {
  const db = req.app.get('db')
  const { location, id, maxDistance } = req.body
  // Try to get data from cache
  let cachedEvents: Event[] | undefined = cache.get('events')
  if (!cachedEvents) {
    cachedEvents = await db.event.findMany(eventsQuery())
    cache.set('events', cachedEvents)
  }
  const events = cachedEvents!
    // Calculate distance to events
    .map( e => {
      const distance = getDistance(location.latitude, location.longitude, e.latitude, e.longitude)
      return ({...e, distance})
    })
    // Exclude far away, user's own, swiped and full events
    .filter( e => (
      e.distance <= maxDistance &&
      (e?.author_id !== id) &&
      !(e?.matches.some((m: any) => m.user?.id === id)) &&
      e.matches.length < e.slots
    ))
  res.status(200).json(events)
})

export default router

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const deg2rad = (deg: number) => deg * (Math.PI/180)
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c) // Distance in km
}

const eventsQuery = () => {
  const date = new Date()
  date.setHours(0,0,0,0)
  return ({
    where: {
      time: {
        gte: date
      },
    },
    orderBy: {
      author: {
        rating: 'desc'
      }
    },
    include: {
      matches: {
        where: {
          accepted: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
          stars: true
        }
      }
    }
  })
}

type Event = {
  id:         string,
  author_id:  string,
  title:      string,
  text:       string,
  time:       Date,
  slots:      number,
  latitude:   number,
  longitude:  number,
  distance:   number,
  matches:    [],
  author:     {
    id:         string,
    name:       string,
    avatar:     string,
    stars:      number,
    rating:     number
  }
}