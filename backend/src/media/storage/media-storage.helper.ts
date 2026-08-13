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

const MAX_FILE_SIZE_BYTES: Record<MediaType, number> = {
  VIDEO: 500 * 1024 * 1024,
  DOCUMENT: 50 * 1024 * 1024,
  PHOTO: 20 * 1024 * 1024,
};

export function getMaxFileSizeBytes(type: MediaType): number | undefined {
  return MAX_FILE_SIZE_BYTES[type];
}

export function isWithinFileSizeLimit(type: MediaType, size: number): boolean {
  const maxSize = getMaxFileSizeBytes(type);
  if (maxSize === undefined) {
    return false;
  }
  return size <= maxSize;
}

export function buildFileUrl(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const withoutLeadingSlash = normalizedPath.replace(/^\/+/, '');
  const withoutUploadsPrefix = withoutLeadingSlash.replace(/^uploads\/+/, '');
  return `/uploads/${withoutUploadsPrefix}`;
}
