import { useQuery } from "@tanstack/react-query"
import { FileText } from "lucide-react"

import MediaGrid from "@/components/media/MediaGrid"
import { getMediaItems, mediaKeys } from "@/lib/media-api"

function DocumentsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
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
        loadingLabel="Loading documents..."
        emptyIcon={FileText}
        emptyTitle="No documents yet"
        emptyDescription="Documents you upload will appear here."
        errorTitle="Could not load documents"
        onRetry={() => void refetch()}
      />
    </div>
  )
}

export default DocumentsPage
