import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './api-client'
import { deleteMediaItem, getMediaItem, getMediaItems, uploadMediaItem } from './media-api'

vi.mock('./api-client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('media-api', () => {
  it('getMediaItems fetches the media list', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    await getMediaItems()

    expect(api.get).toHaveBeenCalledWith('/media')
  })

  it('getMediaItems fetches only videos when filtered by type', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    await getMediaItems('VIDEO')

    expect(api.get).toHaveBeenCalledWith('/media?type=VIDEO')
  })

  it('getMediaItems fetches only documents when filtered by type', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    await getMediaItems('DOCUMENT')

    expect(api.get).toHaveBeenCalledWith('/media?type=DOCUMENT')
  })

  it('getMediaItems fetches only photos when filtered by type', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    await getMediaItems('PHOTO')

    expect(api.get).toHaveBeenCalledWith('/media?type=PHOTO')
  })

  it('getMediaItem fetches a single media item by id', async () => {
    vi.mocked(api.get).mockResolvedValue({})

    await getMediaItem('media-1')

    expect(api.get).toHaveBeenCalledWith('/media/media-1')
  })

  it('uploadMediaItem posts the given FormData to the upload endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({})
    const formData = new FormData()

    await uploadMediaItem(formData)

    expect(api.post).toHaveBeenCalledWith('/media/upload', formData)
  })

  it('deleteMediaItem deletes a media item by id and returns nothing', async () => {
    vi.mocked(api.delete).mockResolvedValue({ id: 'media-1' })

    const result = await deleteMediaItem('media-1')

    expect(api.delete).toHaveBeenCalledWith('/media/media-1')
    expect(result).toBeUndefined()
  })
})
