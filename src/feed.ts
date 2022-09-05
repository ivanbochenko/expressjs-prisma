import express from 'express'
import NodeCache from 'node-cache';

const router = express.Router()
const cache = new NodeCache({ stdTTL: 300 }) // default time-to-live 5 min

type Event = {
  id:         string,
  author_id:  string,
  title:      string,
  text:       string,
  time:       Date,
  slots:      number,
  latitude:   number,
  longitude:  number,
  distance:   number
}

router.post('/', async (req, res) => {
  try {
    const { location } = req.body
    const prisma = req.app.get('prisma')

    // try to get data from cache
    let cachedEvents: any = cache.get('events');
    if (cachedEvents == null) {
      // Query events not older than todays midnight
      const date = new Date()
      date.setHours(0,0,0,0)
      const events = await prisma.event.findMany({
        where: { 
          time: {
            gte: date
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
          }
        }
      })
      cachedEvents = events
      cache.set('events', events);
    }
    // Sort events by distance to user and return list of 20 closest event ids
    const closestEvents = cachedEvents
      .map((event: Event) => ({
        ...event,
        distance: Math.round(getDistance(
          location.latitude, 
          location.longitude, 
          event.latitude, 
          event.longitude
        ))
      }))
      .sort((a: Event, b: Event ) => a.distance - b.distance)
      .slice(0, 20)
      
    res.status(200).json(closestEvents);
  } catch (error) {
    console.log(error);
    res.status(500).json(null);
  }
})

export default router;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}
