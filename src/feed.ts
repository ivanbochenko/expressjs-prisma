import express from 'express'
import NodeCache from 'node-cache';

const router = express.Router()
const cache = new NodeCache({ stdTTL: 60 * 3 }) // default time-to-live 3 min
const NUMBER_OF_EVENTS_RETURNED = 20
const DEFAULT_MAX_DISTANCE = 100

router.post('/', async (req, res) => {
  const { location, id } = req.body
  const db = req.app.get('db')
  // try to get data from cache
  let cachedEvents: any = cache.get('events')
  if (!cachedEvents) {
    // Select and cache events with matches and author not older than todays midnight
    const date = new Date()
    date.setHours(0,0,0,0)
    const events = await db.event.findMany(eventsQuery(date))
    cachedEvents = events
    cache.set('events', events);
  }
  const closestEvents = findClosestEvents(cachedEvents, id, location)
  res.status(200).json(closestEvents)
})

export default router;

const eventsQuery = (date: Date) => ({
  where: {
    time: {
      gte: date
    },
  },
  include: {
    matches: {
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
        avatar: true
      }
    }
  }
})

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
  matches: []
}

type Location = {
  latitude: number,
  longitude: number
}

const findClosestEvents = (events: Event[], id: string, location: Location) => (
  events
  // Exclude user's own and swiped events
  .filter((event: any) => (
    !(event.matches.some((m: any) => m.user?.id === id)) &&
    (event.author_id !== id)
  ))
  // Calculate distance to events
  .map((event: Event) => {
    const distance = Math.round(getDistance(
      location.latitude, 
      location.longitude, 
      event.latitude, 
      event.longitude
    ))
    return {...event, distance}
  })
  // Sort events by distance
  .sort((a: Event, b: Event ) => a.distance - b.distance)
  // Return closest
  .slice(0, NUMBER_OF_EVENTS_RETURNED)
  // Filter users accepted in event
  .map((e: Event) => ({...e, matches: e.matches.filter( (m: any) => m.accepted === true)}))
)

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c; // Distance in km
}

const deg2rad = (deg: number) => deg * (Math.PI/180)
