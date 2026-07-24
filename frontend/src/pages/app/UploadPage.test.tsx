import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UploadPage from './UploadPage'
import { uploadMediaItem } from '@/lib/media-api'
import type { MediaItem } from '@/lib/media-api'

const mockNavigate = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/lib/media-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/media-api')>()
  return { ...actual, uploadMediaItem: vi.fn() }
})

const mockedUploadMediaItem = vi.mocked(uploadMediaItem)

function buildMediaItem(overrides: Partial<MediaItem> = {}): MediaItem {
  return {
    id: 'media-1',
    title: 'Holiday clip',
    description: null,
    type: 'VIDEO',
    category: null,
    originalName: 'clip.mp4',
    fileName: 'clip.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 2048,
    filePath: 'videos/clip.mp4',
    uploadedById: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    fileUrl: '/uploads/videos/clip.mp4',
    ...overrides,
  }
}

function renderUploadPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <UploadPage />
    </QueryClientProvider>,
  )
}

describe('UploadPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows a validation error and does not upload when title is empty', async () => {
    const user = userEvent.setup()
    renderUploadPage()

    await user.click(screen.getByRole('button', { name: /upload/i }))

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(mockedUploadMediaItem).not.toHaveBeenCalled()
  })

  it('shows a validation error and does not upload when type is missing', async () => {
    const user = userEvent.setup()
    renderUploadPage()

    await user.type(screen.getByLabelText('Title'), 'Holiday clip')
    await user.click(screen.getByRole('button', { name: /upload/i }))

    expect(screen.getByText('Type is required.')).toBeInTheDocument()
    expect(mockedUploadMediaItem).not.toHaveBeenCalled()
  })

  it('shows a validation error and does not upload when file is missing', async () => {
    const user = userEvent.setup()
    renderUploadPage()

    await user.type(screen.getByLabelText('Title'), 'Holiday clip')
    await user.selectOptions(screen.getByLabelText('Type'), 'VIDEO')
    await user.click(screen.getByRole('button', { name: /upload/i }))

    expect(screen.getByText('A file is required.')).toBeInTheDocument()
    expect(mockedUploadMediaItem).not.toHaveBeenCalled()
  })

  it('clears the validation error while editing a field', async () => {
    const user = userEvent.setup()
    renderUploadPage()

    await user.click(screen.getByRole('button', { name: /upload/i }))
    expect(screen.getByText('Title is required.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Title'), 'x')

    expect(screen.queryByText('Title is required.')).not.toBeInTheDocument()
  })

  it('uploads with the expected FormData and navigates to the created item', async () => {
    const user = userEvent.setup()
    const createdItem = buildMediaItem({ id: 'media-42' })
    mockedUploadMediaItem.mockResolvedValue(createdItem)

    renderUploadPage()

    await user.type(screen.getByLabelText('Title'), 'Holiday clip')
    await user.type(screen.getByLabelText('Description'), 'Beach trip')
    await user.type(screen.getByLabelText('Category'), 'travel')
    await user.selectOptions(screen.getByLabelText('Type'), 'VIDEO')

    const file = new File(['file contents'], 'clip.mp4', { type: 'video/mp4' })
    await user.upload(screen.getByLabelText('File'), file)

    await user.click(screen.getByRole('button', { name: /upload/i }))

    await waitFor(() => {
      expect(mockedUploadMediaItem).toHaveBeenCalledTimes(1)
    })

    const submittedFormData = mockedUploadMediaItem.mock.calls[0][0]
    expect(submittedFormData).toBeInstanceOf(FormData)
    expect(submittedFormData.get('title')).toBe('Holiday clip')
    expect(submittedFormData.get('description')).toBe('Beach trip')
    expect(submittedFormData.get('category')).toBe('travel')
    expect(submittedFormData.get('type')).toBe('VIDEO')
    expect((submittedFormData.get('file') as File).name).toBe('clip.mp4')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app/media/media-42')
    })
  })
})
