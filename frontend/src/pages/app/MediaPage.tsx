import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import MediaCard from "@/components/media/MediaCard"
import { getMediaItems, mediaKeys } from "@/lib/media-api"

function MediaPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: mediaKeys.lists(),
    queryFn: getMediaItems,
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Media</h1>

      {isLoading && (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading media...</span>
        </div>
      )}

      {isError && (
        <p className="text-neutral-400">
          {error instanceof Error
            ? error.message
            : "Failed to load media items."}
        </p>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <p className="text-neutral-400">
          No media yet. Upload something to get started.
        </p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaPage
