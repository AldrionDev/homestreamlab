import { Link } from "react-router"
import { FileText, Image, Video } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { MediaItem, MediaType } from "@/lib/media-api"

const typeIcons: Record<MediaType, typeof Video> = {
  VIDEO: Video,
  DOCUMENT: FileText,
  PHOTO: Image,
}

interface MediaCardProps {
  item: MediaItem
}

function MediaCard({ item }: MediaCardProps) {
  const Icon = typeIcons[item.type]

  return (
    <Link to={`/app/media/${item.id}`} className="block no-underline">
      <Card className="border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-700">
        <CardHeader>
          <Icon className="size-6 text-neutral-400" />
          <CardTitle className="text-neutral-100">{item.title}</CardTitle>
          <CardDescription className="text-neutral-400">
            {item.category ?? item.type}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-neutral-500">
            {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default MediaCard
