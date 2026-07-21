import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api, buildAssetUrl } from './api-client'

function jsonResponse(body: unknown, status = 200) {
  const hasBody = body !== undefined && status !== 204
  return new Response(hasBody ? JSON.stringify(body) : null, {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
  })
}

class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length() {
    return this.store.size
  }
  clear = () => this.store.clear()
  getItem = (key: string) => this.store.get(key) ?? null
  key = (index: number) => Array.from(this.store.keys())[index] ?? null
  removeItem = (key: string) => this.store.delete(key)
  setItem = (key: string, value: string) => this.store.set(key, value)
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage())
  vi.stubGlobal('fetch', vi.fn())
})

describe('api-client', () => {
  it('builds the request URL from VITE_API_URL and the given path', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }))

    await api.get('/media')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/media',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('sends an Authorization header when accessToken exists in localStorage', async () => {
    localStorage.setItem('accessToken', 'test-token')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }))

    await api.get('/media')

    const [, init] = vi.mocked(fetch).mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer test-token')
  })

  it('omits the Authorization header when accessToken is missing', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }))

    await api.get('/media')

    const [, init] = vi.mocked(fetch).mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Authorization']).toBeUndefined()
  })

  it('JSON-encodes the request body and sets Content-Type for POST', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 1 }))

    await api.post('/media', { title: 'test' })

    const [, init] = vi.mocked(fetch).mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
    expect(init?.body).toBe(JSON.stringify({ title: 'test' }))
  })

  it('sends FormData bodies as-is without Content-Type or JSON-encoding', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 1 }))

    const formData = new FormData()
    formData.append('title', 'test')

    await api.post('/media/upload', formData)

    const [, init] = vi.mocked(fetch).mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
    expect(init?.body).toBe(formData)
  })

  it('parses a successful JSON response', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 1, title: 'test' }))

    const result = await api.get<{ id: number; title: string }>('/media/1')

    expect(result).toEqual({ id: 1, title: 'test' })
  })

  it('resolves to undefined for an empty response body', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(undefined, 204))

    const result = await api.delete('/media/1')

    expect(result).toBeUndefined()
  })

  it('throws a readable ApiError for non-2xx responses', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: 'Not found' }, 404))

    await expect(api.get('/media/999')).rejects.toMatchObject(
      new ApiError('Not found', 404, { message: 'Not found' }),
    )
  })
})

describe('buildAssetUrl', () => {
  it('joins VITE_API_URL with a leading-slash asset path', () => {
    expect(buildAssetUrl('/uploads/photos/x.jpg')).toBe(
      'http://localhost:3000/uploads/photos/x.jpg',
    )
  })

  it('normalizes a path without a leading slash', () => {
    expect(buildAssetUrl('uploads/photos/x.jpg')).toBe(
      'http://localhost:3000/uploads/photos/x.jpg',
    )
  })
})
