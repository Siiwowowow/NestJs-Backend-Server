import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { PrismaService } from '../database/prisma.service';
import { createDataLoaders } from './loaders/user.loader';
import { GraphQLPlugin } from './plugins/graphql-logger.plugin';
import { auth } from '../auth/better-auth.instance';

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [PrismaService],
      useFactory: async (prisma: PrismaService): Promise<ApolloDriverConfig> => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: false,
        plugins: [
          GraphQLPlugin,
          process.env.GRAPHQL_PLAYGROUND === 'true'
            ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
            : undefined,
        ].filter(Boolean) as any[],
        introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
        context: async ({ req, res }: { req: any; res: any }) => {
          const loaders = createDataLoaders(prisma);
          let user = req?.user;
          let session = req?.session;

          // If user is not yet attached by middleware, try resolving via Better Auth
          if (!user && req?.headers) {
            try {
              const sessionData = await auth.api.getSession({
                headers: new Headers(req.headers),
              });
              if (sessionData) {
                user = sessionData.user;
                session = sessionData.session;
                req.user = user;
                req.session = session;
              }
            } catch {
              // Ignore session lookup failures in public GraphQL operations
            }
          }

          return {
            req,
            res,
            user,
            session,
            loaders,
          };
        },
        formatError: (formattedError, error: any) => {
          const code =
            error?.extensions?.code ||
            formattedError.extensions?.code ||
            'INTERNAL_SERVER_ERROR';

          const message = formattedError.message;
          return {
            message,
            extensions: {
              code,
              timestamp: new Date().toISOString(),
            },
          };
        },
      }),
    }),
  ],
  providers: [GraphQLPlugin],
  exports: [NestGraphQLModule],
})
export class AppGraphQLModule {}
