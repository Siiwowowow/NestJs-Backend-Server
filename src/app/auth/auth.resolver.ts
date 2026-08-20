import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  UserEntity,
  AuthPayloadEntity,
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './entities/auth.entity';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { IGraphQLContext } from '../common/interfaces/request-context.interface';

@Resolver(() => UserEntity)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => UserEntity, { name: 'me', description: 'Get current authenticated user profile' })
  async getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.id);
  }

  @Public()
  @Mutation(() => AuthPayloadEntity, { description: 'Register a new user account' })
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: IGraphQLContext,
  ) {
    const headers = new Headers(context.req?.headers as any);
    return this.authService.register(input, headers);
  }

  @Public()
  @Mutation(() => AuthPayloadEntity, { description: 'Authenticate user with email and password' })
  async login(
    @Args('input') input: LoginInput,
    @Context() context: IGraphQLContext,
  ) {
    const headers = new Headers(context.req?.headers as any);
    return this.authService.login(input, headers);
  }

  @Mutation(() => Boolean, { description: 'Sign out and invalidate session' })
  async logout(@Context() context: IGraphQLContext): Promise<boolean> {
    const headers = new Headers(context.req?.headers as any);
    return this.authService.logout(headers);
  }

  @Public()
  @Mutation(() => Boolean, { description: 'Request password reset email' })
  async forgotPassword(@Args('input') input: ForgotPasswordInput): Promise<boolean> {
    return this.authService.forgotPassword(input);
  }

  @Public()
  @Mutation(() => Boolean, { description: 'Reset password with token' })
  async resetPassword(@Args('input') input: ResetPasswordInput): Promise<boolean> {
    return this.authService.resetPassword(input);
  }

  @Public()
  @Mutation(() => Boolean, { description: 'Verify email address' })
  async verifyEmail(@Args('input') input: VerifyEmailInput): Promise<boolean> {
    return this.authService.verifyEmail(input);
  }
}
