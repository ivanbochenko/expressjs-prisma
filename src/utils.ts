import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import aws from 'aws-sdk'
import crypto from 'crypto'
import { promisify } from "util"
import { Expo, ExpoPushMessage } from 'expo-server-sdk'
declare module 'jsonwebtoken' {
  export interface IdJwtPayload extends jwt.JwtPayload {
    id: string,
    email: string,
    pushToken: string
  }
}

const secret = process.env.JWT_SECRET!

export const verifyToken = (token: string) => {
  const payload = <jwt.IdJwtPayload>jwt.verify(token, secret)
  return payload
}

export const signToken = (data: {
  id: string,
  email?: string,
  pushToken?: string
}) => {
  const newToken = jwt.sign({
    ...data,
    exp: Math.floor(Date.now() / 1000) + 86400 * 30
  }, secret, { algorithm: 'HS256' } )
  return newToken
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      req.path == '/error'  ||
      req.path.startsWith('/login')
    ) return next();
    const token = req.headers['authorization']!
    const { id, email } = verifyToken(token)
    res.locals.user = { id, email }
    next()
  } catch (error) {
    res.status(401).json('Authorization error')
    console.error(error)
  }
}

export const generateUploadURL = async () => {
  const s3 = new aws.S3({
    region: "eu-central-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4'
  })
  const randomBytes = promisify(crypto.randomBytes)
  const rawBytes = await randomBytes(16)
  const params = ({
    Bucket: "onlyfriends-bucket",
    Key: rawBytes.toString('hex'),
    Expires: 60
  })
  return await s3.getSignedUrlPromise('putObject', params)
}

const expo = new Expo()

export const sendPushNotifications = async (pushTokens: (string | null)[], message: ExpoPushMessage) => {
  let messages = []
  for (const pushToken of pushTokens) {

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`)
      continue
    }
  
    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      ...message,
      to: pushToken
    })
  }

  const chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  (async () => {
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        tickets.push(...ticketChunk)
      } catch (error) {
        console.error(error)
      }
    }
  })();
}

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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