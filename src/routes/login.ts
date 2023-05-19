import express from 'express'
import bcrypt from 'bcrypt'
import { db } from '../dbClient'
import { signToken, verifyToken } from '../utils/token'

const router = express.Router()

router.post('/', async (req, res) => {
  const { token: oldToken, pushToken } = req.body
  const { pushToken: oldPushToken, id } = verifyToken(oldToken)

  if (oldPushToken !== pushToken) {
    const user = await db.user.update({
      where: {id},
      data: {token: pushToken},
    })
  }
  const token = signToken({id, pushToken})
  res.status(200).json({token, id})
})

router.post('/password', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await db.user.findUnique({
      where: { email }
    })
  
    const isCorrectPassword = bcrypt.compareSync(password, user?.password!)
  
    if (user && isCorrectPassword) {
      const token = signToken({
        id: user.id,
        email: user.email!,
      })
      res.status(200).json({token, id: user.id, success: true})
    } else {
      res.status(200).json({success: false})
    }
  } catch (error) {
    res.status(500).json({success: false})
    console.error(error)
  }
})


router.post('/register', async (req, res) => {
  try {
    const { email, pushToken, password } = req.body
    if (!email || !pushToken || !password) {
      res.status(200).json({success: false, message: 'Bad request data'})
    }
    const hashPassword = bcrypt.hashSync(password, 8)
    const userCount = await db.user.count({ where: { email } })

    if (userCount > 0) {
      res.status(200).json({success: false, message: 'User already exists'})
    } else {
      const user = await db.user.create({
        data: { email, token: pushToken, password: hashPassword },
      })
      const token = signToken({
        id: user.id,
        email: user.email!,
      })

      res.status(200).json({token, id: user.id, success: true})
    }
  } catch (error) {
    res.status(500).json({success: false})
    console.error(error)
  }
})

router.post('/reset', async (req, res) => {
  try {
    const { id } = verifyToken(req.headers['authorization']!)
    const { password } = req.body
    const user = await db.user.findUnique({ where: { id } })
    if (bcrypt.compareSync(password, user?.password!)) {
      const newPassword = bcrypt.hashSync(password, 8)
      const updatedUser = await db.user.update({
        where: { id },
        data: { password: newPassword }
      })
    } else {
      res.status(200).json({success: false, message: 'Wrong password'})
      return
    }
    res.status(200).json({success: true})
  } catch (error) {
    res.status(500).json({success: false})
    console.error(error)
  }
})

router.post('/delete', async (req, res) => {
  try {
    const { id } = verifyToken(req.headers['authorization']!)
    const { password } = req.body
    const user = await db.user.findUnique({ where: { id } })
    if (bcrypt.compareSync(password, user?.password!)) {
      const deletedUser = await db.user.delete({ where: {id} })
    } else {
      res.status(200).json({success: false, message: 'Wrong password'})
      return
    }
    res.status(200).json({success: true})
  } catch (error) {
    res.status(500).json({success: false})
    console.error(error)
  }
})

export default router;


// Create new user with facebook email

// router.post('/facebook', async (req, res) => {
//   try {
//     const { code, verifier, pushToken } = req.body
//     const email = await getFacebookEmail(code, verifier)
//     const user = await db.user.upsert({
//       where: { email },
//       update: { email, token: pushToken },
//       create: { email, token: pushToken },
//     })
//     const id = user.id
//     // Create JWT
//     const token = jwt.sign({
//       id,
//       email,
//       exp: getExpirationTime()
//     }, secret, { algorithm: 'HS256' })
//     res.status(200).json({token, id})
//   } catch (error) {
//     console.error(error)
//   }
// })

// const getFacebookEmail = async (code: string, verifier: string) => {
//   const baseUrl = 'https://graph.facebook.com'
//   const expoUrl = 'https://auth.expo.io/@'
//   const link = new URL('oauth/access_token', baseUrl)

//   link.searchParams.set("client_id", process.env.FACEBOOK_CLIENT_ID! )
//   link.searchParams.set("redirect_uri", expoUrl + process.env.EXPO_SLUG )
//   link.searchParams.set("client_secret", process.env.FACEBOOK_CLIENT_SECRET! )
//   link.searchParams.set("grant_type", 'authorization_code' )
//   link.searchParams.set("code_verifier", verifier )
//   link.searchParams.set("code", code )

//   const { access_token } = (await axios.get(link.toString())).data
//   const { data } = await axios.post(
//     `https://graph.facebook.com/v14.0/me?fields=email&access_token=${access_token}`
//   )

//   return data.email
// }