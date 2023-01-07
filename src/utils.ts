import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import aws from 'aws-sdk'
import crypto from 'crypto'
import { promisify } from "util"

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      req.path == '/'       ||
      req.path == '/error'  ||
      req.path.startsWith('/login')
    ) return next();
    const token = req.headers['authorization'] ?? ''
    const { id, email }: any = jwt.verify(token, process.env.JWT_SECRET ?? '')
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
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    signatureVersion: 'v4'
  })
  const randomBytes = promisify(crypto.randomBytes)
  const rawBytes = await randomBytes(16)
  const params = ({
    Bucket: "onlyfriends-bucket",
    Key: rawBytes.toString('hex'),
    Expires: 60
  })  
  const uploadURL = await s3.getSignedUrlPromise('putObject', params)
  return uploadURL
}