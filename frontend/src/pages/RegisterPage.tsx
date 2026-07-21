import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { ApiError, api } from "@/lib/api-client"
import { validateRegisterForm } from "@/lib/register-validation"
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

function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validationError = validateRegisterForm({ email, displayName, password })
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await api.post("/auth/register", { email, displayName, password })
      navigate("/login")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-neutral-100">
      <Card className="w-full max-w-sm border-neutral-800 bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-neutral-100">Create an account</CardTitle>
          <CardDescription className="text-neutral-400">
            Start building your personal media library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-neutral-100">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName" className="text-neutral-100">
                Display name
              </Label>
              <Input
                id="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-neutral-100">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-neutral-400">
            Already have an account?{" "}
            <Link to="/login" className="text-neutral-100 underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterPage
