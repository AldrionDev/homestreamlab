import { useParams } from "react-router"

function MediaDetailPage() {
  const { id } = useParams()

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold">Media Detail</h1>
      <p className="text-neutral-400">Media id: {id}</p>
    </div>
  )
}

export default MediaDetailPage
