import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api-client"
import { mediaKeys, uploadMediaItem, type MediaType } from "@/lib/media-api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const fieldClassName =
  "flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80"

const textareaClassName = cn(fieldClassName, "h-20 resize-none py-1.5")

function UploadPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState<MediaType | "">("")
  const [file, setFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => uploadMediaItem(formData),
    onSuccess: (createdItem) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all })
      navigate(`/app/media/${createdItem.id}`)
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormError(null)
    uploadMutation.reset()

    if (!title.trim()) {
      setFormError("Title is required.")
      return
    }
    if (!type) {
      setFormError("Type is required.")
      return
    }
    if (!file) {
      setFormError("A file is required.")
      return
    }

    const formData = new FormData()
    formData.append("title", title.trim())
    if (description.trim()) formData.append("description", description.trim())
    if (category.trim()) formData.append("category", category.trim())
    formData.append("type", type)
    formData.append("file", file)

    uploadMutation.mutate(formData)
  }

  const serverError =
    uploadMutation.error instanceof ApiError
      ? uploadMutation.error.message
      : uploadMutation.error
        ? "Something went wrong. Please try again."
        : null
  const displayError = formError ?? serverError

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Upload</h1>

      <Card className="max-w-lg border-neutral-800 bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-neutral-100">Upload media</CardTitle>
          <CardDescription className="text-neutral-400">
            Add a video, document or photo to your library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title" className="text-neutral-100">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploadMutation.isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description" className="text-neutral-100">
                Description
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploadMutation.isPending}
                className={textareaClassName}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category" className="text-neutral-100">
                Category
              </Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploadMutation.isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type" className="text-neutral-100">
                Type
              </Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as MediaType)}
                disabled={uploadMutation.isPending}
                className={fieldClassName}
              >
                <option value="" disabled>
                  Select a type
                </option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
                <option value="PHOTO">Photo</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="file" className="text-neutral-100">
                File
              </Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={uploadMutation.isPending}
              />
            </div>

            {displayError && <p className="text-sm text-red-400">{displayError}</p>}

            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default UploadPage
