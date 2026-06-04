import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import AdminDashboard from './dashboard/AdminDashboard'
import PaymentReviews from './payments/PaymentReviews'
import Orders from './orders/Orders'
import Users from './users/Users'
import SupportTickets from './support/SupportTickets'
import SiteSettings from './settings/SiteSettings'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: '⊞' },
  { id: 'payments',  label: 'Payments',   icon: '💳' },
  { id: 'orders',    label: 'Orders',     icon: '📦' },
  { id: 'users',     label: 'Users',      icon: '👥' },
  { id: 'tickets',   label: 'Tickets',    icon: '💬' },
  { id: 'settings',  label: 'Settings',   icon: '⚙️' },
]

export default function AdminPanel() {
  const { isAdmin } = useAuth()
  const navigate    = useNavigate()
  const [active, setActive] = useState('dashboard')

  if (!isAdmin) {
    navigate('/dashboard')
    return null
  }

  const renderPage = () => {
    switch (active) {
      case 'dashboard': return <AdminDashboard />
      case 'payments':  return <PaymentReviews />
      case 'orders':    return <Orders />
      case 'users':     return <Users />
      case 'tickets':   return <SupportTickets />
      case 'settings':  return <SiteSettings />
      default:          return <AdminDashboard />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,16,0.97)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #f59e0b22',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: '#ffffff08', border: '1px solid #ffffff12', color: '#9ca3af', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            ←
          </button>
          <div>
            <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '14px' }}>⚙️ Admin Panel</div>
            <div style={{ color: '#4b5563', fontSize: '9px' }}>Infinity IP Control Center</div>
          </div>
        </div>
        <div style={{ background: '#f59e0b18', border: '1px solid #f59e0b33', borderRadius: '20px', padding: '3px 10px', color: '#fbbf24', fontSize: '10px', fontWeight: 700 }}>
          ADMIN
        </div>
      </div>

      {/* Mobile horizontal nav */}
      <div style={{
        borderBottom: '1px solid #ffffff08',
        overflowX: 'auto',
        display: 'flex',
        background: '#0a0a16',
      }}>
        {NAV.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                background: 'none', border: 'none',
                borderBottom: `2px solid ${isActive ? '#f59e0b' : 'transparent'}`,
                color: isActive ? '#fbbf24' : '#6b7280',
                padding: '12px 14px 10px',
                cursor: 'pointer', fontSize: '11px',
                fontWeight: isActive ? 700 : 400,
                whiteSpace: 'nowrap', transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '3px', flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Page content */}
      <div>{renderPage()}</div>
    </div>
  )
}