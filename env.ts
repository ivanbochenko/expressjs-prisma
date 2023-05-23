type requiredServerEnvs =
	'PORT' |
  'NODE_ENV' |
	'DATABASE_URL' |
	'JWT_SECRET' |
  'AWS_S3_LINK' |
	'AWS_ACCESS_KEY_ID' |
	'AWS_SECRET_ACCESS_KEY' |
  'EMAIL_USERNAME' |
  'EMAIL_PASSWORD' 

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Record<requiredServerEnvs, string> {}
	}
}

export {}