import { api } from './api-client'

export type MediaType = 'VIDEO' | 'DOCUMENT' | 'PHOTO'

export interface MediaItem {
  id: string
  title: string
  description: string | null
  type: MediaType
  category: string | null
  originalName: string
  fileName: string
  mimeType: string
  sizeBytes: number
  filePath: string
  uploadedById: string
  createdAt: string
  updatedAt: string
  fileUrl: string
}

export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  detail: (id: string) => [...mediaKeys.all, 'detail', id] as const,
}

export function getMediaItems(): Promise<MediaItem[]> {
  return api.get<MediaItem[]>('/media')
}

export function getMediaItem(id: string): Promise<MediaItem> {
  return api.get<MediaItem>(`/media/${id}`)
}

export function uploadMediaItem(formData: FormData): Promise<MediaItem> {
  return api.post<MediaItem>('/media/upload', formData)
}

export async function deleteMediaItem(id: string): Promise<void> {
  await api.delete(`/media/${id}`)
}
