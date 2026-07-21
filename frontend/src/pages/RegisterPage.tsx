import { Link } from "react-router"

function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">Register</h1>
      <p className="text-neutral-400">Registration form coming soon.</p>
      <Link to="/" className="text-sm underline">
        Back to home
      </Link>
    </div>
  )
}

export default RegisterPage
