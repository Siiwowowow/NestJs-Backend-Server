import { ObjectType, Field, ID, registerEnumType, InputType } from '@nestjs/graphql';
import { Role } from '../../common/enums/role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

registerEnumType(Role, {
  name: 'Role',
  description: 'User access role',
});

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User account status',
});

@ObjectType('User')
export class UserEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => Boolean)
  emailVerified!: boolean;

  @Field({ nullable: true })
  image?: string;

  @Field(() => Role)
  role!: Role;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType('Session')
export class SessionEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  token!: string;

  @Field(() => Date)
  expiresAt!: Date;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;
}

@ObjectType('AuthPayload')
export class AuthPayloadEntity {
  @Field(() => UserEntity)
  user!: UserEntity;

  @Field(() => SessionEntity, { nullable: true })
  session?: SessionEntity;

  @Field({ nullable: true })
  token?: string;
}

@InputType()
export class RegisterInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field({ nullable: true })
  phoneNumber?: string;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  email!: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  token!: string;

  @Field()
  newPassword!: string;
}

@InputType()
export class VerifyEmailInput {
  @Field()
  token!: string;
}
