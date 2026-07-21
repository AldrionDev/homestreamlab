import { Route, Routes } from "react-router"
import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import ProtectedRoute from "@/components/routing/ProtectedRoute"
import AppLayout from "@/pages/app/AppLayout"
import AppHomePage from "@/pages/app/AppHomePage"
import MediaPage from "@/pages/app/MediaPage"
import MediaDetailPage from "@/pages/app/MediaDetailPage"
import VideosPage from "@/pages/app/VideosPage"
import DocumentsPage from "@/pages/app/DocumentsPage"
import PhotosPage from "@/pages/app/PhotosPage"
import UploadPage from "@/pages/app/UploadPage"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<AppHomePage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="media/:id" element={<MediaDetailPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="upload" element={<UploadPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
