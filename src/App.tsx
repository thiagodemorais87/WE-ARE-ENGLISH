import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { PlatformProvider } from '@/contexts/PlatformContext'
import { AppShell } from '@/components/layout/AppShell'
import { BrandLoader } from '@/components/layout/BrandLoader'
import { ProtectedRoute, TeacherRoute } from '@/components/layout/ProtectedRoute'
import { useIntroLoader } from '@/hooks/useIntroLoader'
import { HomePage } from '@/pages/Home'
import { LoginPage } from '@/pages/Login'
import { SignupPage } from '@/pages/Signup'
import { ActivitiesPage } from '@/pages/Activities'
import { ActivityDetailPage } from '@/pages/ActivityDetail'
import { ActivityPlayPage } from '@/pages/ActivityPlay'
import { ProgressPage } from '@/pages/Progress'
import { FavoritesPage } from '@/pages/Favorites'
import { CartPage } from '@/pages/Cart'
import { ProfilePage } from '@/pages/Profile'
import { AdminActivitiesPage } from '@/pages/Admin/Activities'
import { ActivityCreatePage } from '@/pages/Admin/ActivityCreate'
import { ActivityEditPage } from '@/pages/Admin/ActivityEdit'

function AppRoutes() {
  const { show, finish } = useIntroLoader()

  return (
    <>
      {show ? <BrandLoader onDone={finish} /> : null}
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/activities"
              element={
                <ProtectedRoute>
                  <ActivitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity/:id"
              element={
                <ProtectedRoute>
                  <ActivityDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity/:id/play"
              element={
                <ProtectedRoute>
                  <ActivityPlayPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activities"
              element={
                <TeacherRoute>
                  <AdminActivitiesPage />
                </TeacherRoute>
              }
            />
            <Route
              path="/admin/activities/new"
              element={
                <TeacherRoute>
                  <ActivityCreatePage />
                </TeacherRoute>
              }
            />
            <Route
              path="/admin/activities/:id/edit"
              element={
                <TeacherRoute>
                  <ActivityEditPage />
                </TeacherRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <AppRoutes />
      </PlatformProvider>
    </AuthProvider>
  )
}
