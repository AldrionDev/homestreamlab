import { Outlet } from "react-router"

import AppSidebar from "@/components/app/AppSidebar"
import AppTopbar from "@/components/app/AppTopbar"

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
