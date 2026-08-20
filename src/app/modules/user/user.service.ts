import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationService } from '../../shared/pagination/pagination.service';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import { NotFoundException, BadRequestException } from '../../common/exceptions/domain.exceptions';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        adminProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User', id);
    }

    return user;
  }

  async findAll(query: PaginationQueryDto) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.paginationService.paginate(
      this.prisma.user,
      { where },
      query,
    );
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        image: dto.image,
      },
    });

    return updated;
  }

  async uploadAvatar(id: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const uploadResult = await this.cloudinaryService.uploadFile(file, 'avatars');

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        image: uploadResult.secure_url,
      },
    });

    return {
      avatarUrl: uploadResult.secure_url,
      user: updated,
    };
  }
}
