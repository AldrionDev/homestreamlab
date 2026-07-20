import { Injectable, NotFoundException } from '@nestjs/common';
import { relative } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { GetMediaQueryDto } from './dto/get-media-query.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UPLOADS_ROOT } from './storage/media-storage.config';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, file: Express.Multer.File, dto: CreateMediaDto) {
    return this.prisma.mediaItem.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        category: dto.category,
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        filePath: relative(UPLOADS_ROOT, file.path),
        uploadedById: userId,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.mediaItem.findFirst({
      where: { id, uploadedById: userId },
    });
    if (!item) throw new NotFoundException('Media item not found');
    return item;
  }

  async update(userId: string, id: string, dto: UpdateMediaDto) {
    const item = await this.prisma.mediaItem.findFirst({
      where: { id, uploadedById: userId },
    });
    if (!item) throw new NotFoundException('Media item not found');

    return this.prisma.mediaItem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.mediaItem.findFirst({
      where: { id, uploadedById: userId },
    });
    if (!item) throw new NotFoundException('Media item not found');

    return this.prisma.mediaItem.delete({ where: { id } });
  }

  findAll(userId: string, query: GetMediaQueryDto) {
    const { type, search } = query;
    return this.prisma.mediaItem.findMany({
      where: {
        uploadedById: userId,
        ...(type && { type }),
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
