import { useQuery } from "@tanstack/react-query"
import { Video } from "lucide-react"

import MediaGrid from "@/components/media/MediaGrid"
import { getMediaItems, mediaKeys } from "@/lib/media-api"

function VideosPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: mediaKeys.lists("VIDEO"),
    queryFn: () => getMediaItems("VIDEO"),
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Videos</h1>

      <MediaGrid
        items={data}
        isLoading={isLoading}
        isError={isError}
        loadingLabel="Loading videos..."
        emptyIcon={Video}
        emptyTitle="No videos yet"
        emptyDescription="Videos you upload will appear here."
        errorTitle="Could not load videos"
        onRetry={() => void refetch()}
      />
    </div>
  )
}

export default VideosPage
