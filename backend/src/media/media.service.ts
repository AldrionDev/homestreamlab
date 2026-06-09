import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetMediaQueryDto } from './dto/get-media-query.dto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

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
