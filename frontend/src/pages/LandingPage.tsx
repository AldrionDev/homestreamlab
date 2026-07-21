import { Link } from "react-router"
import { FileText, Image, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Video,
    title: "Videos",
    description:
      "Stream your personal video collection without uploading it to someone else's platform.",
  },
  {
    icon: FileText,
    title: "Documents",
    description:
      "Keep important files organized and easy to find, right alongside your media.",
  },
  {
    icon: Image,
    title: "Photos",
    description: "Browse your photo library in a clean, fast, distraction-free grid.",
  },
]

function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="flex flex-col items-center justify-center gap-6 px-4 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Your media, your library.
        </h1>
        <p className="max-w-xl text-base text-neutral-400 sm:text-lg">
          HomeStreamLab is a local-first home for your videos, documents, and photos — upload
          once and browse your personal collection in a clean, focused app.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/register">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 pb-24 sm:grid-cols-3 sm:gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="border-neutral-800 bg-neutral-900">
            <CardHeader>
              <feature.icon className="size-6 text-neutral-100" />
              <CardTitle className="text-neutral-100">{feature.title}</CardTitle>
              <CardDescription className="text-neutral-400">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default LandingPage
