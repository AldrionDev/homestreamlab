import { useQuery } from "@tanstack/react-query"

import MediaGrid from "@/components/media/MediaGrid"
import { getMediaItems, mediaKeys } from "@/lib/media-api"

function VideosPage() {
  const { data, isLoading, isError, error } = useQuery({
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
        error={error}
        loadingLabel="Loading videos..."
        emptyMessage="No videos yet. Upload a video to get started."
      />
    </div>
  )
}

export default VideosPage
