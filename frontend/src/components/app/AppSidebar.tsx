import { NavLink } from "react-router"
import {
  FileText,
  Image,
  LayoutDashboard,
  LibraryBig,
  Upload,
  Video,
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/media", label: "Media", icon: LibraryBig },
  { to: "/app/videos", label: "Videos", icon: Video },
  { to: "/app/documents", label: "Documents", icon: FileText },
  { to: "/app/photos", label: "Photos", icon: Image },
  { to: "/app/upload", label: "Upload", icon: Upload },
]

function AppSidebar() {
  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-neutral-800 bg-neutral-900">
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100",
                isActive && "bg-neutral-800 text-neutral-100"
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AppSidebar
