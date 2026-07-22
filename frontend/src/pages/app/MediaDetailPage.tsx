import { Link, useNavigate, useParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { ApiError, buildAssetUrl } from "@/lib/api-client"
import { deleteMediaItem, getMediaItem, mediaKeys } from "@/lib/media-api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

function MediaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: mediaKeys.detail(id ?? ""),
    queryFn: () => getMediaItem(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => deleteMediaItem(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all })
      navigate("/app/media")
    },
  })

  const isNotFound = !id || (error instanceof ApiError && error.status === 404)
  const errorMessage =
    error instanceof Error ? error.message : "Failed to load media item."

  const deleteErrorMessage =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.error
        ? "Failed to delete media item. Please try again."
        : null

  function handleDelete() {
    if (!id) return
    if (!window.confirm("Delete this media item? This cannot be undone.")) return
    deleteMutation.reset()
    deleteMutation.mutate(id)
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/app/media"
        className="text-sm text-neutral-400 hover:text-neutral-200"
      >
        &larr; Back to media
      </Link>

      {isNotFound && <p className="text-neutral-400">Media not found.</p>}

      {!isNotFound && isLoading && (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading media...</span>
        </div>
      )}

      {!isNotFound && isError && (
        <p className="text-neutral-400">{errorMessage}</p>
      )}

      {!isNotFound && !isLoading && !isError && data && (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-neutral-100">{data.title}</CardTitle>
            <CardDescription className="text-neutral-400">
              {data.category ?? data.type}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data.description && (
              <p className="text-neutral-300">{data.description}</p>
            )}

            {data.type === "PHOTO" && (
              <img
                src={buildAssetUrl(data.fileUrl)}
                alt={data.title}
                className="max-w-full rounded border border-neutral-800"
              />
            )}
            {data.type === "VIDEO" && (
              <video
                controls
                src={buildAssetUrl(data.fileUrl)}
                className="max-w-full rounded border border-neutral-800"
              />
            )}
            {data.type === "DOCUMENT" && (
              <a
                href={buildAssetUrl(data.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-300 underline hover:text-neutral-100"
              >
                Open file
              </a>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-neutral-500">Type</dt>
              <dd className="text-neutral-300">{data.type}</dd>

              <dt className="text-neutral-500">Original file name</dt>
              <dd className="text-neutral-300">{data.originalName}</dd>

              <dt className="text-neutral-500">File type</dt>
              <dd className="text-neutral-300">{data.mimeType}</dd>

              <dt className="text-neutral-500">Size</dt>
              <dd className="text-neutral-300">
                {formatFileSize(data.sizeBytes)}
              </dd>

              <dt className="text-neutral-500">Uploaded</dt>
              <dd className="text-neutral-300">
                {new Date(data.createdAt).toLocaleDateString()}
              </dd>
            </dl>

            <div className="flex flex-col gap-2 border-t border-neutral-800 pt-4">
              {deleteErrorMessage && (
                <p className="text-sm text-red-400">{deleteErrorMessage}</p>
              )}
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="self-start"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MediaDetailPage
