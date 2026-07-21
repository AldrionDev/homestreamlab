import { useQuery } from "@tanstack/react-query"

import MediaGrid from "@/components/media/MediaGrid"
import { getMediaItems, mediaKeys } from "@/lib/media-api"

function MediaPage() {
  const { data, isLoading, isError, error } = useQuery({
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
        error={error}
        loadingLabel="Loading media..."
        emptyMessage="No media yet. Upload something to get started."
      />
    </div>
  )
}

export default MediaPage
