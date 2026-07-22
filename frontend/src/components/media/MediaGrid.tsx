import type { LucideIcon } from "lucide-react"

import MediaCard from "@/components/media/MediaCard"
import {
  MediaEmptyState,
  MediaErrorState,
  MediaLoadingState,
} from "@/components/media/MediaStates"
import type { MediaItem } from "@/lib/media-api"

interface MediaGridProps {
  items: MediaItem[] | undefined
  isLoading: boolean
  isError: boolean
  loadingLabel: string
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription: string
  errorTitle: string
  onRetry: () => void
}

function MediaGrid({
  items,
  isLoading,
  isError,
  loadingLabel,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  errorTitle,
  onRetry,
}: MediaGridProps) {
  if (isLoading) {
    return <MediaLoadingState label={loadingLabel} />
  }

  if (isError) {
    return (
      <MediaErrorState
        title={errorTitle}
        description="Something went wrong while loading this page. Please try again."
        onRetry={onRetry}
      />
    )
  }

  if (!items || items.length === 0) {
    return (
      <MediaEmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  )
}

export default MediaGrid
