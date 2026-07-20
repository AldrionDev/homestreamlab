import { BadRequestException } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: { create: jest.Mock };

  beforeEach(() => {
    mediaService = { create: jest.fn() };
    controller = new MediaController(mediaService as unknown as MediaService);
  });

  describe('upload', () => {
    const user = { id: 'user-1' };
    const dto = { title: 'Holiday', type: MediaType.PHOTO };

    it('delegates to MediaService.create with the authenticated user id', () => {
      const file = { originalname: 'photo.jpg' } as Express.Multer.File;

      void controller.upload(user, file, dto);

      expect(mediaService.create).toHaveBeenCalledWith(user.id, file, dto);
    });

    it('throws BadRequestException when no file is provided', () => {
      expect(() =>
        controller.upload(
          user,
          undefined as unknown as Express.Multer.File,
          dto,
        ),
      ).toThrow(BadRequestException);
      expect(mediaService.create).not.toHaveBeenCalled();
    });
  });
});
