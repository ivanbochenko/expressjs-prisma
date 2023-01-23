type requiredServerEnvs =
	'PORT' |
	'DATABASE_URL' |
	'JWT_SECRET' |
	'AWS_ACCESS_KEY_ID' |
	'AWS_SECRET_ACCESS_KEY' |
	'FACEBOOK_CLIENT_ID' |
	'FACEBOOK_CLIENT_SECRET' |
	'EXPO_SLUG'

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Record<requiredServerEnvs, string> {}
	}
}

export {}