import { useQuery } from "@tanstack/react-query"

import MediaGrid from "@/components/media/MediaGrid"
import { getMediaItems, mediaKeys } from "@/lib/media-api"

function PhotosPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: mediaKeys.lists("PHOTO"),
    queryFn: () => getMediaItems("PHOTO"),
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Photos</h1>

      <MediaGrid
        items={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingLabel="Loading photos..."
        emptyMessage="No photos yet. Upload a photo to get started."
      />
    </div>
  )
}

export default PhotosPage
