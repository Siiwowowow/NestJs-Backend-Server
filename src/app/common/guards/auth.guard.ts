import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../constants/metadata.constants';
import { UnauthorizedException, ForbiddenException } from '../exceptions/domain.exceptions';
import { UserStatus } from '../enums/user-status.enum';
import { auth } from '../../auth/better-auth.instance';
import { RequestWithUser } from '../interfaces/request-context.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    let req: RequestWithUser;
    let isGraphQL = false;

    if (context.getType().toString() === 'graphql') {
      isGraphQL = true;
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      req = ctx.req || ctx;
    } else {
      req = context.switchToHttp().getRequest();
    }

    try {
      // Use Better Auth's API to retrieve session from request headers (cookies/bearer)
      const sessionData = await auth.api.getSession({
        headers: new Headers(req.headers as any),
      });

      if (sessionData && sessionData.user) {
        const user = sessionData.user as any;
        const session = sessionData.session as any;

        if (user.status === UserStatus.SUSPENDED) {
          throw new ForbiddenException('Your account has been suspended. Please contact support.');
        }

        if (user.status === UserStatus.INACTIVE) {
          throw new ForbiddenException('Your account is inactive.');
        }

        req.user = user;
        req.session = session;

        if (isGraphQL) {
          const gqlContext = GqlExecutionContext.create(context);
          const ctx = gqlContext.getContext();
          ctx.user = user;
          ctx.session = session;
        }

        return true;
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // If error occurred during session check and route is public, allow through
      if (isPublic) {
        return true;
      }
    }

    if (isPublic) {
      return true;
    }

    throw new UnauthorizedException('Authentication required to access this resource');
  }
}
