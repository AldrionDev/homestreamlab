import { Link } from "react-router"
import { Button } from "@/components/ui/button"

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-2xl font-bold">HomeStreamLab</h1>
      <p className="text-neutral-400">Personal media library — frontend coming soon.</p>

      <div className="flex gap-3">
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/register">Register</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/app">Go to app</Link>
        </Button>
      </div>
    </div>
  )
}

export default LandingPage
