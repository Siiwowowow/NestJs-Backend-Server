import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../constants/metadata.constants';
import { Role } from '../enums/role.enum';
import { ForbiddenException, UnauthorizedException } from '../exceptions/domain.exceptions';
import { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    let user: AuthUser | undefined;

    if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      user = ctx.user || ctx.req?.user;
    } else {
      const req = context.switchToHttp().getRequest();
      user = req.user;
    }

    if (!user) {
      throw new UnauthorizedException('Authentication required for role verification');
    }

    // Super Admin has full access to all roles
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: required role(s): [${requiredRoles.join(', ')}], your role is '${user.role}'`,
      );
    }

    return true;
  }
}
