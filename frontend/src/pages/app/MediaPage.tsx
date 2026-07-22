import { useQuery } from "@tanstack/react-query"
import { LibraryBig } from "lucide-react"

import MediaGrid from "@/components/media/MediaGrid"
import { getMediaItems, mediaKeys } from "@/lib/media-api"

function MediaPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: mediaKeys.lists(),
    queryFn: () => getMediaItems(),
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Media</h1>

      <MediaGrid
        items={data}
        isLoading={isLoading}
        isError={isError}
        loadingLabel="Loading media..."
        emptyIcon={LibraryBig}
        emptyTitle="No media yet"
        emptyDescription="Upload your first video, document or photo to build your library."
        errorTitle="Could not load media"
        onRetry={() => void refetch()}
      />
    </div>
  )
}

export default MediaPage
