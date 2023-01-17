const requiredServerEnvs = [
	'PORT',
	'DATABASE_URL',
	'JWT_SECRET',
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'FACEBOOK_CLIENT_ID',
	'FACEBOOK_CLIENT_SECRET',
	'EXPO_SLUG'
] as const

type RequiredServerEnvKeys = (typeof requiredServerEnvs)[number]

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Record<RequiredServerEnvKeys, string> {}
	}
}

export {}