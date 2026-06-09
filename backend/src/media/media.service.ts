import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetMediaQueryDto } from './dto/get-media-query.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

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
