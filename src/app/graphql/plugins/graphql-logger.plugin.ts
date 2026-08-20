import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { Logger } from '@nestjs/common';

@Plugin()
export class GraphQLPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger('GraphQL');

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const startTime = Date.now();
    const logger = this.logger;

    return {
      async didResolveOperation(context) {
        if (context.operationName !== 'IntrospectionQuery') {
          logger.log(`Operation: ${context.operationName || 'Anonymous'} (${context.operation?.operation})`);
        }
      },
      async didEncounterErrors(context) {
        context.errors.forEach((err) => {
          logger.error(`GraphQL Error [${err.extensions?.code || 'ERROR'}]: ${err.message}`, err.stack);
        });
      },
      async willSendResponse(context) {
        if (context.operationName !== 'IntrospectionQuery') {
          const duration = Date.now() - startTime;
          logger.log(`Completed ${context.operationName || 'Anonymous'} +${duration}ms`);
        }
      },
    };
  }
}
