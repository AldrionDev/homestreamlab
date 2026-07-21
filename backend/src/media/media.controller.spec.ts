import { BadRequestException } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { unlink } from 'fs/promises';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: { create: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mediaService = { create: jest.fn() };
    controller = new MediaController(mediaService as unknown as MediaService);
  });

  describe('upload', () => {
    const user = { id: 'user-1' };
    const dto = { title: 'Holiday', type: MediaType.PHOTO };

    it('delegates to MediaService.create with the authenticated user id', async () => {
      const file = {
        originalname: 'photo.jpg',
        path: '/uploads/photos/photo.jpg',
      } as Express.Multer.File;

      await controller.upload(user, file, dto);

      expect(mediaService.create).toHaveBeenCalledWith(user.id, file, dto);
    });

    it('throws BadRequestException when no file is provided', async () => {
      await expect(
        controller.upload(
          user,
          undefined as unknown as Express.Multer.File,
          dto,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mediaService.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException and removes the file when the extension does not match the media type', async () => {
      const file = {
        originalname: 'document.pdf',
        path: '/uploads/photos/document.pdf',
      } as Express.Multer.File;

      await expect(controller.upload(user, file, dto)).rejects.toThrow(
        'Invalid file extension for type PHOTO. Allowed extensions: jpg, jpeg, png, webp.',
      );
      expect(unlink).toHaveBeenCalledWith(file.path);
      expect(mediaService.create).not.toHaveBeenCalled();
    });
  });
});
