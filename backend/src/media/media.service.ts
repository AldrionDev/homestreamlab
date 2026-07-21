import { Injectable, NotFoundException } from '@nestjs/common';
import { MediaItem } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join, relative } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { GetMediaQueryDto } from './dto/get-media-query.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { buildFileUrl } from './storage/media-storage.helper';
import { UPLOADS_ROOT } from './storage/media-storage.config';

type MediaItemResponse = MediaItem & { fileUrl: string };

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(item: MediaItem): MediaItemResponse {
    return { ...item, fileUrl: buildFileUrl(item.filePath) };
  }

  private async deleteLocalFile(filePath: string): Promise<void> {
    try {
      await unlink(join(UPLOADS_ROOT, filePath));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      }
      throw error;
    }
  }

  async create(
    userId: string,
    file: Express.Multer.File,
    dto: CreateMediaDto,
  ): Promise<MediaItemResponse> {
    const item = await this.prisma.mediaItem.create({
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
    return this.toResponse(item);
  }

  async findOne(userId: string, id: string): Promise<MediaItemResponse> {
    const item = await this.prisma.mediaItem.findFirst({
      where: { id, uploadedById: userId },
    });
    if (!item) throw new NotFoundException('Media item not found');
    return this.toResponse(item);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateMediaDto,
  ): Promise<MediaItemResponse> {
    const item = await this.prisma.mediaItem.findFirst({
      where: { id, uploadedById: userId },
    });
    if (!item) throw new NotFoundException('Media item not found');

    const updated = await this.prisma.mediaItem.update({
      where: { id },
      data: dto,
    });
    return this.toResponse(updated);
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.mediaItem.findFirst({
      where: { id, uploadedById: userId },
    });
    if (!item) throw new NotFoundException('Media item not found');

    await this.deleteLocalFile(item.filePath);

    return this.prisma.mediaItem.delete({ where: { id } });
  }

  async findAll(
    userId: string,
    query: GetMediaQueryDto,
  ): Promise<MediaItemResponse[]> {
    const { type, search } = query;
    const items = await this.prisma.mediaItem.findMany({
      where: {
        uploadedById: userId,
        ...(type && { type }),
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.toResponse(item));
  }
}
