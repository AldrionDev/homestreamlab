import { MediaType } from '@prisma/client';
import {
  generateUniqueFilename,
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
