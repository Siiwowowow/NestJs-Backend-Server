import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { paginationQuerySchema, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UpdateUserDto, updateUserSchema } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(paginationQuerySchema))
  async findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findById(id);
    return {
      message: 'User retrieved successfully',
      data,
    };
  }

  @Patch('profile')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  async updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    const data = await this.userService.updateProfile(user.id, dto);
    return {
      message: 'Profile updated successfully',
      data,
    };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.userService.uploadAvatar(user.id, file);
    return {
      message: 'Avatar uploaded successfully',
      data: result,
    };
  }
}
