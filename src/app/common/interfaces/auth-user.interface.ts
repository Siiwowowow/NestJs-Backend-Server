import { Role } from '../enums/role.enum';
import { UserStatus } from '../enums/user-status.enum';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: Role;
  status: UserStatus;
  phoneNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface CurrentUserPayload {
  user: AuthUser;
  session: AuthSession;
}
