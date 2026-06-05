import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import DashboardLayout from '../layouts/DashboardLayout'

import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import ForgotPassword from '../pages/auth/ForgotPassword'

import Dashboard from '../pages/dashboard/Dashboard'
import Marketplace from '../pages/marketplace/Marketplace'
import MyResources from '../pages/resources/MyResources'
import Transactions from '../pages/transactions/Transactions'
import Notifications from '../pages/notifications/Notifications'
import Support from '../pages/support/Support'
import Profile from '../pages/profile/Profile'
import AdminPanel from '../admin/AdminPanel'
import PaymentSubmit from '../pages/payment/PaymentSubmit'
import RenewIP from '../pages/resources/RenewIP'
import Landing from '../pages/landing/Landing'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Guest only ─────────────────────────────────────────── */}
      <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

      {/* ── Protected (logged in) ──────────────────────────────── */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/resources" element={<MyResources />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/support" element={<Support />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/payment" element={<PaymentSubmit />} />
        <Route path="/renew" element={<RenewIP />} />
      </Route>

      {/* ── Catch all ─────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  )
}