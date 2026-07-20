import { join } from 'path';
import { diskStorage } from 'multer';
import { MediaType } from '@prisma/client';
import {
  generateUniqueFilename,
  resolveMediaTypeFolder,
} from './media-storage.helper';

// Assumes backend scripts (start:dev, start, etc.) are run from the `backend/`
// directory, which matches the current local development workflow.
const UPLOADS_ROOT = join(process.cwd(), 'uploads');

export const mediaDiskStorage = diskStorage({
  destination: (req, _file, cb) => {
    try {
      const body = req.body as { type?: MediaType } | undefined;
      const folder = resolveMediaTypeFolder(body?.type as MediaType);
      cb(null, join(UPLOADS_ROOT, folder));
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  },
});
