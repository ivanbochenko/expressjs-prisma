import aws from 'aws-sdk'
import crypto from 'crypto'
import { promisify } from "util"

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

export default generateUploadURL