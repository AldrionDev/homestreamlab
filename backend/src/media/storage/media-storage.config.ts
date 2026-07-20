import { join } from 'path';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import {
  generateUniqueFilename,
  resolveMediaTypeFolder,
} from './media-storage.helper';

// Assumes backend scripts (start:dev, start, etc.) are run from the `backend/`
// directory, which matches the current local development workflow.
export const UPLOADS_ROOT = join(process.cwd(), 'uploads');

export const mediaDiskStorage = diskStorage({
  destination: (req, _file, cb) => {
    const body = req.body as { type?: MediaType } | undefined;
    try {
      const folder = resolveMediaTypeFolder(body?.type as MediaType);
      cb(null, join(UPLOADS_ROOT, folder));
    } catch {
      cb(new BadRequestException('Invalid or missing media type'), '');
    }
  },
  filename: (_req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  },
});
