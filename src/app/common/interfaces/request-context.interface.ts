import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthUser, AuthSession } from './auth-user.interface';

export interface RequestWithUser extends ExpressRequest {
  id?: string;
  user?: AuthUser;
  session?: AuthSession;
}

export interface IGraphQLContext {
  req: RequestWithUser;
  res: ExpressResponse;
  user?: AuthUser;
  session?: AuthSession;
}
