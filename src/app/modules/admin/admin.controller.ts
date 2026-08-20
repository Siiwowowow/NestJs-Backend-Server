import {
  Controller,
  Patch,
  Get,
  Param,
  Body,
  Query,
  UsePipes,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  UpdateUserRoleDto,
  updateUserRoleSchema,
  UpdateUserStatusDto,
  updateUserStatusSchema,
} from './dto/admin.dto';
import { paginationQuerySchema, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Controller('admin')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('users/:id/role')
  @UsePipes(new ZodValidationPipe(updateUserRoleSchema))
  async updateUserRole(
    @CurrentUser() admin: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const data = await this.adminService.updateUserRole(admin.id, id, dto.role);
    return {
      message: `User role successfully updated to ${dto.role}`,
      data,
    };
  }

  @Patch('users/:id/status')
  @UsePipes(new ZodValidationPipe(updateUserStatusSchema))
  async updateUserStatus(
    @CurrentUser() admin: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const data = await this.adminService.updateUserStatus(admin.id, id, dto.status);
    return {
      message: `User status successfully updated to ${dto.status}`,
      data,
    };
  }

  @Get('audit-logs')
  @UsePipes(new ZodValidationPipe(paginationQuerySchema))
  async getAuditLogs(@Query() query: PaginationQueryDto) {
    return this.adminService.getAuditLogs(query);
  }

  @Get('stats')
  async getSystemStats() {
    const data = await this.adminService.getSystemStats();
    return {
      message: 'System statistics retrieved',
      data,
    };
  }
}
