import jwt from 'jsonwebtoken';

declare module 'jsonwebtoken' {
  export interface IdJwtPayload extends jwt.JwtPayload {
    id: string,
    email?: string,
    pushToken?: string
  }
}

const secret = `${process.env.JWT_SECRET}`

export const verifyToken = (token: string) => {
  return <jwt.IdJwtPayload>jwt.verify(token, secret)
}

export const signToken = (data: {
  id: string,
  email?: string,
  pushToken?: string
}) => {
  const newToken = jwt.sign({
    ...data,
    exp: Math.floor(Date.now() / 1000) + 86400 * 30
  }, secret, { algorithm: 'HS256' } )
  return newToken
}