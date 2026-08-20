import { registerAs } from '@nestjs/config';

export const graphqlConfig = registerAs('graphql', () => ({
  playground: process.env.GRAPHQL_PLAYGROUND === 'true',
  introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
  debug: process.env.GRAPHQL_DEBUG === 'true',
}));
