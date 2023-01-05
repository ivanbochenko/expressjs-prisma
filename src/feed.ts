import express from 'express'
import NodeCache from 'node-cache';

const router = express.Router()
const cache = new NodeCache({ stdTTL: 60 * 3 }) // default time-to-live 3 min

router.post('/', async (req, res) => {
  const db = req.app.get('db')
  const { location, id, maxDistance } = req.body
  // try to get data from cache
  let cachedEvents: any = cache.get('events')
  // Select and cache events with matches and author, 
  // not older than todays midnight and sorted by authors rating.
  if (!cachedEvents) {
    cachedEvents = await db.event.findMany(eventsQuery())
    cache.set('events', cachedEvents)
  }
  // Calculate distance to events
  const measuredEvents = measureDistance(cachedEvents, location)
  const closeEvents = measuredEvents.filter((event: Event) => event.distance <= maxDistance)
  // Exclude user's own and swiped events
  const newEvents = closeEvents.filter((event: Event) => (
    (event?.author_id !== id) &&
    !(event?.matches.some((m: any) => m.user?.id === id))
  ))
  res.status(200).json(newEvents)
})

export default router

const measureDistance = (events: Event[], location: Location) => (
  events.map((event: Event) => 
    ({...event,
      distance: Math.round(getDistance(
        location.latitude, 
        location.longitude, 
        event.latitude, 
        event.longitude
      ))
    })
  )
)

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
  return R * c; // Distance in km
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
  author:     Author
}

type Author = {
  id:         string,
  name:       string,
  avatar:     string,
  stars:      number,
  rating:     number
}

type Location = {
  latitude: number,
  longitude: number
}