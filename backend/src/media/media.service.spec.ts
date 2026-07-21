import { join } from 'path';
import { unlink } from 'fs/promises';
import { MediaType } from '@prisma/client';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { UPLOADS_ROOT } from './storage/media-storage.config';

jest.mock('fs/promises');

const mockUnlink = unlink as jest.MockedFunction<typeof unlink>;

function buildFile(overrides: Partial<Express.Multer.File> = {}) {
  return {
    fieldname: 'file',
    originalname: 'holiday-photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    destination: join(UPLOADS_ROOT, 'photos'),
    filename: 'generated-unique-name.jpg',
    path: join(UPLOADS_ROOT, 'photos', 'generated-unique-name.jpg'),
    stream: undefined,
    buffer: undefined,
    ...overrides,
  } as Express.Multer.File;
}

function buildMediaItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'media-1',
    title: 'Holiday',
    description: 'Beach trip',
    type: MediaType.PHOTO,
    category: 'travel',
    originalName: 'holiday-photo.jpg',
    fileName: 'generated-unique-name.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024,
    filePath: join('photos', 'generated-unique-name.jpg'),
    uploadedById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('MediaService', () => {
  let service: MediaService;
  let prisma: {
    mediaItem: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      mediaItem: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new MediaService(prisma as unknown as PrismaService);
    mockUnlink.mockReset().mockResolvedValue(undefined);
  });

  describe('create', () => {
    it('maps file and dto fields into the Prisma create call', async () => {
      const file = buildFile();
      const dto = {
        title: 'Holiday',
        description: 'Beach trip',
        type: MediaType.PHOTO,
        category: 'travel',
      };
      prisma.mediaItem.create.mockResolvedValue(buildMediaItem());

      await service.create('user-1', file, dto);

      expect(prisma.mediaItem.create).toHaveBeenCalledWith({
        data: {
          title: 'Holiday',
          description: 'Beach trip',
          type: MediaType.PHOTO,
          category: 'travel',
          originalName: 'holiday-photo.jpg',
          fileName: 'generated-unique-name.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          filePath: join('photos', 'generated-unique-name.jpg'),
          uploadedById: 'user-1',
        },
      });
    });

    it('links the media item to the authenticated user, not a body-supplied value', async () => {
      const file = buildFile();
      const dto = { title: 'Holiday', type: MediaType.PHOTO };
      prisma.mediaItem.create.mockResolvedValue(buildMediaItem());

      await service.create('authenticated-user', file, dto);

      expect(prisma.mediaItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            uploadedById: 'authenticated-user',
          }) as Record<string, unknown>,
        }),
      );
    });

    it('includes a fileUrl derived from the stored filePath', async () => {
      const file = buildFile();
      const dto = { title: 'Holiday', type: MediaType.PHOTO };
      prisma.mediaItem.create.mockResolvedValue(buildMediaItem());

      const result = await service.create('user-1', file, dto);

      expect(result.fileUrl).toBe('/uploads/photos/generated-unique-name.jpg');
    });
  });

  describe('findOne', () => {
    it('includes fileUrl in the returned media item', async () => {
      prisma.mediaItem.findFirst.mockResolvedValue(buildMediaItem());

      const result = await service.findOne('user-1', 'media-1');

      expect(result.fileUrl).toBe('/uploads/photos/generated-unique-name.jpg');
    });
  });

  describe('update', () => {
    it('includes fileUrl in the returned media item', async () => {
      prisma.mediaItem.findFirst.mockResolvedValue(buildMediaItem());
      prisma.mediaItem.update.mockResolvedValue(
        buildMediaItem({ title: 'Updated title' }),
      );

      const result = await service.update('user-1', 'media-1', {
        title: 'Updated title',
      });

      expect(result.title).toBe('Updated title');
      expect(result.fileUrl).toBe('/uploads/photos/generated-unique-name.jpg');
    });
  });

  describe('remove', () => {
    it('deletes the local file before deleting the database record', async () => {
      prisma.mediaItem.findFirst.mockResolvedValue(buildMediaItem());
      prisma.mediaItem.delete.mockResolvedValue(buildMediaItem());

      await service.remove('user-1', 'media-1');

      expect(mockUnlink).toHaveBeenCalledWith(
        join(UPLOADS_ROOT, join('photos', 'generated-unique-name.jpg')),
      );
      expect(prisma.mediaItem.delete).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
    });

    it('deletes the database record even when the local file is already missing', async () => {
      prisma.mediaItem.findFirst.mockResolvedValue(buildMediaItem());
      prisma.mediaItem.delete.mockResolvedValue(buildMediaItem());
      mockUnlink.mockRejectedValue(
        Object.assign(new Error('missing'), { code: 'ENOENT' }),
      );

      await service.remove('user-1', 'media-1');

      expect(prisma.mediaItem.delete).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
    });

    it('does not delete the database record when local file deletion fails unexpectedly', async () => {
      prisma.mediaItem.findFirst.mockResolvedValue(buildMediaItem());
      const unlinkError = Object.assign(new Error('permission denied'), {
        code: 'EACCES',
      });
      mockUnlink.mockRejectedValue(unlinkError);

      await expect(service.remove('user-1', 'media-1')).rejects.toThrow(
        unlinkError,
      );

      expect(prisma.mediaItem.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the item does not belong to the user', async () => {
      prisma.mediaItem.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-1', 'media-1')).rejects.toThrow(
        'Media item not found',
      );
    });

    it('does not delete the local file or database record when the item does not belong to the user', async () => {
      prisma.mediaItem.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-1', 'media-1')).rejects.toThrow();

      expect(mockUnlink).not.toHaveBeenCalled();
      expect(prisma.mediaItem.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('includes fileUrl on every item in the returned list', async () => {
      prisma.mediaItem.findMany.mockResolvedValue([
        buildMediaItem({ id: 'media-1' }),
        buildMediaItem({
          id: 'media-2',
          filePath: join('videos', 'other-file.mp4'),
        }),
      ]);

      const result = await service.findAll('user-1', {});

      expect(result).toHaveLength(2);
      expect(result[0].fileUrl).toBe(
        '/uploads/photos/generated-unique-name.jpg',
      );
      expect(result[1].fileUrl).toBe('/uploads/videos/other-file.mp4');
    });
  });
});
