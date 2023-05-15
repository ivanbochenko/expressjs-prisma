import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

const s3 = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  }
})

export const uploadToS3 = async (file: Express.Multer.File, user_id: string) => {
  const key = `${user_id}/${uuid()}`
  const date = new Date()
  date.setMonth(date.getMonth() + 2)
  const command = new PutObjectCommand({
    Bucket: "onlyfriends-bucket",
    Key: key,
    Expires: date,
    Body: file.buffer,
    ContentType: file.mimetype,
  })
  try {
    await s3.send(command);
    return key;
  } catch (error) {
    console.log(error);
  }
}