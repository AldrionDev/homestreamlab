import { Link, Outlet } from "react-router"

const navItems = [
  { to: "/app/media", label: "Media" },
  { to: "/app/videos", label: "Videos" },
  { to: "/app/documents", label: "Documents" },
  { to: "/app/photos", label: "Photos" },
  { to: "/app/upload", label: "Upload" },
]

function AppLayout() {
  return (
    <div className="min-h-screen">
      <nav className="flex gap-4 border-b border-neutral-800 p-4">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className="text-sm underline">
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
