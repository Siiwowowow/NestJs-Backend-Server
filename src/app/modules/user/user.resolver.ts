import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserEntity } from '../../auth/entities/auth.entity';
import { UpdateUserInput } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { IGraphQLContext } from '../../common/interfaces/request-context.interface';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserEntity, { name: 'user', description: 'Get user by ID with DataLoader optimization' })
  async getUser(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: IGraphQLContext,
  ) {
    const loader = (context as any).loaders?.userLoader;
    if (loader) {
      return loader.load(id);
    }
    return this.userService.findById(id);
  }

  @Mutation(() => UserEntity, { description: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.userService.updateProfile(user.id, input);
  }
}
