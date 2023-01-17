import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import aws from 'aws-sdk'
import crypto from 'crypto'
import { promisify } from "util"
import { Expo, ExpoPushMessage } from 'expo-server-sdk'

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      req.path == '/error'  ||
      req.path.startsWith('/login')
    ) return next();
    const token = req.headers['authorization'] ?? ''
    const { id, email }: any = jwt.verify(token, process.env.JWT_SECRET )
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

export const sendPushNotifications = async (somePushTokens: [], message: ExpoPushMessage) => {
  let messages = []
  for (const pushToken of somePushTokens) {

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