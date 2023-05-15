import aws from 'aws-sdk'
import { v4 as uuid } from "uuid";

export const generateUploadURL = async () => {
  const s3 = new aws.S3({
    region: "eu-central-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4'
  })
  const params = ({
    Bucket: "onlyfriends-bucket",
    Key: uuid(),
    Expires: 60
  })
  return await s3.getSignedUrlPromise('putObject', params)
}

