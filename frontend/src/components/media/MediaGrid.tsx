import { Loader2 } from "lucide-react"

import MediaCard from "@/components/media/MediaCard"
import type { MediaItem } from "@/lib/media-api"

interface MediaGridProps {
  items: MediaItem[] | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  loadingLabel: string
  emptyMessage: string
}

function MediaGrid({
  items,
  isLoading,
  isError,
  error,
  loadingLabel,
  emptyMessage,
}: MediaGridProps) {
  const errorMessage =
    error instanceof Error ? error.message : "Failed to load media items."

  return (
    <>
      {isLoading && (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="size-4 animate-spin" />
          <span>{loadingLabel}</span>
        </div>
      )}

      {isError && <p className="text-neutral-400">{errorMessage}</p>}

      {!isLoading && !isError && items && items.length === 0 && (
        <p className="text-neutral-400">{emptyMessage}</p>
      )}

      {!isLoading && !isError && items && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  )
}

export default MediaGrid
