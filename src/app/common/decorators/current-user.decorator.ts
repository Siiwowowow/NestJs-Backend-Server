import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthUser } from '../interfaces/auth-user.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, context: ExecutionContext) => {
    let req: any;

    if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      req = ctx.req || ctx;
      if (!req.user && ctx.user) {
        req.user = ctx.user;
      }
    } else {
      req = context.switchToHttp().getRequest();
    }

    const user = req?.user as AuthUser | undefined;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
