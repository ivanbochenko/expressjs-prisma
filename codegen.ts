import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/schema.graphql',
  generates: {
    './resolvers-types.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers',
      ],
      config: {
        contextType: './src/context#Context'
      }
    },
  },
};
export default config;