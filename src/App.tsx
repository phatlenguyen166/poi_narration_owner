import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { AppLayout } from '@/components/layout/AppLayout'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import OnboardingPage from '@/pages/auth/OnboardingPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ShopsPage from '@/pages/shops/ShopsPage'
import StallsMapPage from '@/pages/shops/StallsMapPage'
import StallsListPage from '@/pages/shops/StallsListPage'
import ShopFormPage from '@/pages/shops/ShopFormPage'
import POIDetailPage from '@/pages/shops/POIDetailPage'
import StallDetailPage from '@/pages/shops/StallDetailPage'
import StallCreatePage from '@/pages/shops/stalls/StallCreatePage'
import StallEditPage from '@/pages/shops/stalls/StallEditPage'
import QRCodePage from '@/pages/shops/QRCodePage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import GlobalAnalyticsPage from '@/pages/analytics/GlobalAnalyticsPage'
import ApprovalsPage from '@/pages/approvals/ApprovalsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '10px', fontSize: '14px' },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/shops" element={<ShopsPage />} />
            <Route path="/shops/map" element={<StallsMapPage />} />
            <Route path="/shops/stalls" element={<StallsListPage />} />
            <Route path="/shops/stalls/new" element={<StallCreatePage />} />
            <Route path="/shops/new" element={<ShopFormPage />} />
            <Route path="/shops/stalls/:stallId" element={<StallDetailPage />} />
            <Route path="/shops/stalls/:stallId/edit" element={<StallEditPage />} />
            <Route path="/shops/:id/edit" element={<ShopFormPage />} />
            <Route path="/shops/:shopId/poi/:poiId" element={<POIDetailPage />} />
            <Route path="/shops/:id/qr" element={<QRCodePage />} />
            <Route path="/shops/:id/analytics" element={<AnalyticsPage />} />

            <Route path="/analytics" element={<GlobalAnalyticsPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
