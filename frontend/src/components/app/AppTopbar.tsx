import { LogOut } from "lucide-react"
import { useNavigate } from "react-router"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

function AppTopbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 px-6">
      <span className="text-sm font-semibold text-neutral-100">
        HomeStreamLab
      </span>
      <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="size-4" />
        Logout
      </Button>
    </header>
  )
}

export default AppTopbar
