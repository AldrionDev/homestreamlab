import { useQuery } from "@tanstack/react-query"
import { Image } from "lucide-react"

import MediaGrid from "@/components/media/MediaGrid"
import { getMediaItems, mediaKeys } from "@/lib/media-api"

function PhotosPage() {
  const { data, isLoading, isError, refetch } = useQuery({
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
        loadingLabel="Loading photos..."
        emptyIcon={Image}
        emptyTitle="No photos yet"
        emptyDescription="Photos you upload will appear here."
        errorTitle="Could not load photos"
        onRetry={() => void refetch()}
      />
    </div>
  )
}

export default PhotosPage
