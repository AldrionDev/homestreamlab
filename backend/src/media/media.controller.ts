import { unlink } from 'fs/promises';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateMediaDto } from './dto/create-media.dto';
import { GetMediaQueryDto } from './dto/get-media-query.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { mediaDiskStorage } from './storage/media-storage.config';
import {
  getAllowedExtensions,
  isAllowedFileExtension,
} from './storage/media-storage.helper';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: mediaDiskStorage }))
  async upload(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateMediaDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!isAllowedFileExtension(dto.type, file.originalname)) {
      await unlink(file.path).catch(() => undefined);
      const allowedExtensions = getAllowedExtensions(dto.type)
        .map((extension) => extension.replace('.', ''))
        .join(', ');
      throw new BadRequestException(
        `Invalid file extension for type ${dto.type}. Allowed extensions: ${allowedExtensions}.`,
      );
    }

    return this.mediaService.create(user.id, file, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.mediaService.findOne(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
  ) {
    return this.mediaService.update(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.mediaService.remove(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: GetMediaQueryDto,
  ) {
    return this.mediaService.findAll(user.id, query);
  }
}
