import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationService } from '../../shared/pagination/pagination.service';
import { Role } from '../../common/enums/role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { NotFoundException } from '../../common/exceptions/domain.exceptions';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async updateUserRole(adminUserId: string, targetUserId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User', targetUserId);
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    });

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_USER_ROLE',
        resource: `User:${targetUserId}`,
        payload: { oldRole: user.role, newRole: role },
      },
    });

    this.logger.log(`Admin ${adminUserId} updated user ${targetUserId} role to ${role}`);
    return updated;
  }

  async updateUserStatus(adminUserId: string, targetUserId: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User', targetUserId);
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { status },
    });

    // If suspending or deactivating, terminate sessions
    if (status === UserStatus.SUSPENDED || status === UserStatus.INACTIVE) {
      await this.prisma.session.deleteMany({
        where: { userId: targetUserId },
      });
    }

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_USER_STATUS',
        resource: `User:${targetUserId}`,
        payload: { oldStatus: user.status, newStatus: status },
      },
    });

    this.logger.log(`Admin ${adminUserId} updated user ${targetUserId} status to ${status}`);
    return updated;
  }

  async getAuditLogs(query: PaginationQueryDto) {
    return this.paginationService.paginate(
      this.prisma.auditLog,
      {},
      query,
    );
  }

  async getSystemStats() {
    const [totalUsers, activeUsers, suspendedUsers, activeSessions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      this.prisma.session.count({ where: { expiresAt: { gte: new Date() } } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      activeSessions,
    };
  }
}
