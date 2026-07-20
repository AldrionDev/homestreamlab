import { randomUUID } from 'crypto';
import { extname } from 'path';
import { MediaType } from '@prisma/client';

const MEDIA_TYPE_FOLDERS: Record<MediaType, string> = {
  VIDEO: 'videos',
  DOCUMENT: 'documents',
  PHOTO: 'photos',
};

export function resolveMediaTypeFolder(type: MediaType): string {
  const folder = MEDIA_TYPE_FOLDERS[type];
  if (!folder) {
    throw new Error(`Unsupported media type: ${type}`);
  }
  return folder;
}

export function generateUniqueFilename(originalName: string): string {
  const extension = extname(originalName).toLowerCase();
  return `${randomUUID()}${extension}`;
}
