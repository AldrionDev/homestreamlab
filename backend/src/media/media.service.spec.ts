import { join } from 'path';
import { MediaType } from '@prisma/client';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { UPLOADS_ROOT } from './storage/media-storage.config';

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

describe('MediaService', () => {
  let service: MediaService;
  let prisma: { mediaItem: { create: jest.Mock } };

  beforeEach(() => {
    prisma = { mediaItem: { create: jest.fn() } };
    service = new MediaService(prisma as unknown as PrismaService);
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

      await service.create('authenticated-user', file, dto);

      expect(prisma.mediaItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            uploadedById: 'authenticated-user',
          }) as Record<string, unknown>,
        }),
      );
    });
  });
});
