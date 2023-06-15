import { PrismaClient } from "@prisma/client";
import { createPubSub } from '@graphql-yoga/node'
export interface Context {
  db: PrismaClient;
  pubSub: ReturnType<typeof createPubSub>;
}