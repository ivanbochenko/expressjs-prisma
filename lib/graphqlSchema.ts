const schema = {
  schema: {
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String
      }

      type Subscription {
        countdown(from: Int!): Int!
      }
    `,
    resolvers: {
      Query: {
        hello: () => 'world',
      },
      Subscription: {
        countdown: {
          // This will return the value on every 1 sec until it reaches 0
          subscribe: async function* (_: any, { from }: any) {
            for (let i = from; i >= 0; i--) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
              yield { countdown: i }
            }
          },
        },
      },
    },
  },
}
export default schema