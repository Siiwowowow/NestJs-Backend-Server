import { z } from 'zod';
import { InputType, Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { Role } from '../../../common/enums/role.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>;

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;

@InputType()
export class UpdateUserRoleInput {
  @Field(() => ID)
  userId!: string;

  @Field(() => Role)
  role!: Role;
}

@InputType()
export class UpdateUserStatusInput {
  @Field(() => ID)
  userId!: string;

  @Field(() => UserStatus)
  status!: UserStatus;
}

@ObjectType('SystemStats')
export class SystemStatsEntity {
  @Field(() => Int)
  totalUsers!: number;

  @Field(() => Int)
  activeUsers!: number;

  @Field(() => Int)
  suspendedUsers!: number;

  @Field(() => Int)
  activeSessions!: number;
}
