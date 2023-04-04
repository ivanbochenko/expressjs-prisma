import { db } from './src/dbClient';
import { createPubSub } from '@graphql-yoga/node'
import { PrismaClient } from "@prisma/client";

const pubSub = createPubSub()

export interface Context {
  db: PrismaClient;
  pubSub: typeof pubSub;
}

export const context: Context = {
  db,
  pubSub,
};