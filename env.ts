import { z } from 'zod'

const envVirables = z.object({
  PORT: z.number(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  FACEBOOK_CLIENT_ID: z.string(),
  FACEBOOK_CLIENT_SECRET: z.string(),
  EXPO_SLUG: z.string(),
})

envVirables.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVirables> {}
  }
}