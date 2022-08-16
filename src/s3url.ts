import express from 'express'
import aws from 'aws-sdk'
import crypto from 'crypto'
import { promisify } from "util"

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const url = await generateUploadURL(
      "eu-central-1",
      process.env.AWS_ACCESS_KEY_ID ?? '',
      process.env.AWS_SECRET_ACCESS_KEY ?? ''
    )
    res.status(200).json(url);
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
})

export default router;

const generateUploadURL = async (region: string, accessKeyId: string, secretAccessKey: string) => {  
  const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
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