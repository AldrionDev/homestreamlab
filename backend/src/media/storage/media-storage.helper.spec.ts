import { MediaType } from '@prisma/client';
import {
  generateUniqueFilename,
  getAllowedExtensions,
  isAllowedFileExtension,
  resolveMediaTypeFolder,
} from './media-storage.helper';

describe('resolveMediaTypeFolder', () => {
  it('maps VIDEO to videos', () => {
    expect(resolveMediaTypeFolder(MediaType.VIDEO)).toBe('videos');
  });

  it('maps DOCUMENT to documents', () => {
    expect(resolveMediaTypeFolder(MediaType.DOCUMENT)).toBe('documents');
  });

  it('maps PHOTO to photos', () => {
    expect(resolveMediaTypeFolder(MediaType.PHOTO)).toBe('photos');
  });

  it('throws for an unsupported type', () => {
    expect(() => resolveMediaTypeFolder('AUDIO' as MediaType)).toThrow(
      'Unsupported media type: AUDIO',
    );
  });
});

describe('generateUniqueFilename', () => {
  it('preserves the original extension', () => {
    const filename = generateUniqueFilename('holiday-photo.jpg');
    expect(filename.endsWith('.jpg')).toBe(true);
  });

  it('lowercases the extension', () => {
    const filename = generateUniqueFilename('Document.PDF');
    expect(filename.endsWith('.pdf')).toBe(true);
  });

  it('handles files with no extension', () => {
    const filename = generateUniqueFilename('README');
    expect(filename).not.toContain('.');
  });

  it('generates distinct filenames for repeated calls', () => {
    const first = generateUniqueFilename('video.mp4');
    const second = generateUniqueFilename('video.mp4');
    expect(first).not.toBe(second);
  });
});

describe('isAllowedFileExtension', () => {
  it.each([
    ['video.mp4', MediaType.VIDEO],
    ['video.webm', MediaType.VIDEO],
    ['video.mov', MediaType.VIDEO],
    ['document.pdf', MediaType.DOCUMENT],
    ['document.txt', MediaType.DOCUMENT],
    ['photo.jpg', MediaType.PHOTO],
    ['photo.jpeg', MediaType.PHOTO],
    ['photo.png', MediaType.PHOTO],
    ['photo.webp', MediaType.PHOTO],
  ])('allows %s for %s', (fileName, type) => {
    expect(isAllowedFileExtension(type, fileName)).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isAllowedFileExtension(MediaType.VIDEO, 'Movie.MP4')).toBe(true);
  });

  it.each([
    ['document.pdf', MediaType.VIDEO],
    ['photo.jpg', MediaType.DOCUMENT],
    ['video.mp4', MediaType.PHOTO],
  ])('rejects %s for %s', (fileName, type) => {
    expect(isAllowedFileExtension(type, fileName)).toBe(false);
  });

  it('returns false for an unsupported type', () => {
    expect(isAllowedFileExtension('AUDIO' as MediaType, 'song.mp3')).toBe(
      false,
    );
  });
});

describe('getAllowedExtensions', () => {
  it('returns the allowed extensions for a media type', () => {
    expect(getAllowedExtensions(MediaType.PHOTO)).toEqual([
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
    ]);
  });

  it('returns an empty array for an unsupported type', () => {
    expect(getAllowedExtensions('AUDIO' as MediaType)).toEqual([]);
  });
});
