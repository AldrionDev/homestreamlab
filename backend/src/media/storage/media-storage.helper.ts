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

const ALLOWED_EXTENSIONS: Record<MediaType, string[]> = {
  VIDEO: ['.mp4', '.webm', '.mov'],
  DOCUMENT: ['.pdf', '.txt'],
  PHOTO: ['.jpg', '.jpeg', '.png', '.webp'],
};

export function getAllowedExtensions(type: MediaType): string[] {
  return ALLOWED_EXTENSIONS[type] ?? [];
}

export function isAllowedFileExtension(
  type: MediaType,
  originalName: string,
): boolean {
  const allowedExtensions = getAllowedExtensions(type);
  if (allowedExtensions.length === 0) {
    return false;
  }
  const extension = extname(originalName).toLowerCase();
  return allowedExtensions.includes(extension);
}
