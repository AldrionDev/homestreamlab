import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Image } from 'lucide-react'
import MediaGrid from './MediaGrid'
import type { MediaItem } from '@/lib/media-api'

function buildItem(overrides: Partial<MediaItem> = {}): MediaItem {
  return {
    id: 'media-1',
    title: 'Holiday photo',
    description: null,
    type: 'PHOTO',
    category: 'travel',
    originalName: 'holiday.jpg',
    fileName: 'holiday.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024,
    filePath: 'photos/holiday.jpg',
    uploadedById: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    fileUrl: '/uploads/photos/holiday.jpg',
    ...overrides,
  }
}

function renderGrid(props: Partial<ComponentProps<typeof MediaGrid>> = {}) {
  const onRetry = vi.fn()
  render(
    <MemoryRouter>
      <MediaGrid
        items={undefined}
        isLoading={false}
        isError={false}
        loadingLabel="Loading media..."
        emptyIcon={Image}
        emptyTitle="No media yet"
        emptyDescription="Upload your first file."
        errorTitle="Couldn't load media"
        onRetry={onRetry}
        {...props}
      />
    </MemoryRouter>,
  )
  return { onRetry }
}

describe('MediaGrid', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows the loading label when isLoading is true', () => {
    renderGrid({ isLoading: true })

    expect(screen.getByText('Loading media...')).toBeInTheDocument()
  })

  it('shows the error title and calls onRetry once when Try again is clicked', async () => {
    const user = userEvent.setup()
    const { onRetry } = renderGrid({ isError: true })

    expect(screen.getByText("Couldn't load media")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows the empty state with an Upload media link when items is an empty array', () => {
    renderGrid({ items: [] })

    expect(screen.getByText('No media yet')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Upload media' }),
    ).toBeInTheDocument()
  })

  it('shows the empty state with an Upload media link when items is undefined', () => {
    renderGrid({ items: undefined })

    expect(screen.getByText('No media yet')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Upload media' }),
    ).toBeInTheDocument()
  })

  it('renders one card per item with the correct titles', () => {
    renderGrid({
      items: [
        buildItem({ id: '1', title: 'First' }),
        buildItem({ id: '2', title: 'Second' }),
      ],
    })

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })
})
