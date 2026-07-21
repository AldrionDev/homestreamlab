import { useQuery } from "@tanstack/react-query"

import MediaGrid from "@/components/media/MediaGrid"
import { getMediaItems, mediaKeys } from "@/lib/media-api"

function DocumentsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: mediaKeys.lists("DOCUMENT"),
    queryFn: () => getMediaItems("DOCUMENT"),
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Documents</h1>

      <MediaGrid
        items={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingLabel="Loading documents..."
        emptyMessage="No documents yet. Upload a document to get started."
      />
    </div>
  )
}

export default DocumentsPage
