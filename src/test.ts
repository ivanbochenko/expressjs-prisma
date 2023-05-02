import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()
const secret = process.env.JWT_SECRET!

router.get('/newToken', async (req, res) => {
  const newToken = jwt.sign({
    id: "1011",
    email: "bochenkoivan@gmail.com",
    exp: getExpirationTime()
  }, secret )
  res.status(200).json({token: newToken})
})

router.post('/notification', async (req, res) => {
  const db = req.app.get('db')
  const { message, email } = req.body
  
  const user = await db.user.findUnique({
    where: {email}
  })

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({...message, to: user.token}),
  })
  res.status(200).json({success: true})
})

router.post('/db', async (req: Request, res: Response) => {
  const user_id = '1011'
  const db = req.app.get('db')
  const events = await db.event.findMany(eventsQuery(user_id))
  res.status(200).json(events)
})

export default router

const getExpirationTime = () => Math.floor(Date.now() / 1000) + 86400 * 30


const eventsQuery = (user_id: string) => {
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
          OR: [
            { accepted: true, },
            { user: { id: user_id } },
          ],
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
          avatar: true
        }
      }
    }
  })
}