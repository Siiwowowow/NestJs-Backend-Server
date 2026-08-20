import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { UserEntity } from '../../auth/entities/auth.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import {
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  SystemStatsEntity,
} from './dto/admin.dto';

@Resolver()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Mutation(() => UserEntity, { description: 'Admin mutation to update user role' })
  async updateUserRole(
    @CurrentUser() admin: AuthUser,
    @Args('input') input: UpdateUserRoleInput,
  ) {
    return this.adminService.updateUserRole(admin.id, input.userId, input.role);
  }

  @Mutation(() => UserEntity, { description: 'Admin mutation to update user status' })
  async updateUserStatus(
    @CurrentUser() admin: AuthUser,
    @Args('input') input: UpdateUserStatusInput,
  ) {
    return this.adminService.updateUserStatus(admin.id, input.userId, input.status);
  }

  @Query(() => SystemStatsEntity, { description: 'Admin query for system overview statistics' })
  async systemStats() {
    return this.adminService.getSystemStats();
  }
}
